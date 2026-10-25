import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import CreateEventModal from "@/src/components/admin/CreateEventModal";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import InstructorAvailabilityModal from "@/src/components/instructor/InstructorAvailabilityModal";
import TimeOffModal from "@/src/components/instructor/TimeOffModal";
import BottomNavBar from "@/src/components/NavBar";
import SessionBookingModal from "@/src/components/SessionBookingModal";
import SessionDetailsModal from "@/src/components/SessionDetailsModal";
import StudentCancelSessionModal from "@/src/components/student/StudentCancelSessionModal";

import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { calendarScreenStyles as styles } from "@/src/styles/CalendarPageStyles/calendarScreen";

import { courseService } from "@/src/services/courseService";
import { eventService } from "@/src/services/eventService";
import { instructorAvailabilityService } from "@/src/services/instructorAvailabilityService";
import { sessionService } from "@/src/services/sessionService";
import { userService } from "@/src/services/userService";

import { UserRole } from "@/src/types/enums";
import {
  Availability,
  AvailabilityUpdate,
  CreateAvailabilityRequest,
} from "@/src/types/availability.types";
import { User } from "@/src/types/auth.types";
import { CreateEventRequest, Event } from "@/src/types/event.types";
import { SessionDetailed } from "@/src/types/sessions.types";
import { BookingTrackContext, BookingWeekState } from "@/src/types/bookingTrack.types";
import { EnrollmentWithCourse } from "@/src/types/enrollment.types";

import {
  buildWeekStateMap,
  buildWeeksWithSession,
  resolveAnchorWeekStart,
  resolveRecommendedWeekStart,
} from "@/src/utils/bookingTrack";
import {
  addDays,
  createLocalDate,
  formatDateForAPI,
  formatDateRange,
  formatDateString,
  formatTimeString,
  getWeekBounds,
} from "@/src/utils/dateTimeUtils";

type TrackMarker = "booked" | "bookNow" | "skipRisk" | null;

// Week booking status is carried by a slim underline on each day (like the web's week
// marker) so the month stays readable instead of turning into solid colored tiles.
const TRACK_MARKER_COLORS: Record<Exclude<TrackMarker, null>, string> = {
  booked: themes.success,
  bookNow: themes.vegasGold,
  skipRisk: themes.danger,
};

const toLocalDateKey = (isoString: string) => formatDateForAPI(new Date(isoString));

const isUnavailableRow = (availability: Availability) =>
  (availability.status ?? "").toLowerCase() === "unavailable";

/** API times like "09:00:00" or "09:00". Never throws — a bad row must not crash the screen. */
const timeToMinutes = (timeStr: string) => {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0);
};

/** Month bounds for a YYYY-MM-DD string, padded a day each side because the API filters by UTC date. */
const getPaddedMonthRange = (dateString: string) => {
  const date = createLocalDate(dateString);
  const start = new Date(date.getFullYear(), date.getMonth(), 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
};
interface Session {
  id: number;
  time: string;
  student: string;
  instructor: string;
  date: string;
}

export default function CalendarScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const isAdmin = user?.role === UserRole.ADMIN;
  const isInstructor = user?.role === UserRole.INSTRUCTOR;
  const canManageOwnAvailability =
    isInstructor && Boolean(user?.can_manage_own_availability);
  const canManageOwnTimeOff =
    isInstructor && Boolean(user?.can_manage_own_time_off);
  const canManageOtherInstructorAvailability =
    isAdmin || (isInstructor && Boolean(user?.can_manage_others_availability));
  const availabilityScrollViewRef = useRef<ScrollView>(null);
  // Android back blurs this screen before it unmounts. Ignore month updates after that
  // so the calendar is not rebuilt while the screen is leaving.
  const screenActiveRef = useRef(true);
  const bottomContentPadding = insets.bottom + 150;

  const goToPrevMonth = () => {
    const d = createLocalDate(visibleMonth);
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    setVisibleMonth(formatDateForAPI(d));
  };
  const goToNextMonth = () => {
    const d = createLocalDate(visibleMonth);
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    setVisibleMonth(formatDateForAPI(d));
  };

  const screenWidth = Dimensions.get("window").width;
  const horizontalPadding = 40;
  const daySize = Math.min(
    70,
    Math.max(36, Math.floor((screenWidth - horizontalPadding - 24) / 7))
  );
  const monthTitleFontSize = screenWidth < 400 ? 20 : 24;

  const [events, setEvents] = useState<Event[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const { date: dateParam } = useLocalSearchParams<{ date?: string }>();
  const requestedDate = Array.isArray(dateParam) ? dateParam[0] : dateParam;
  const openingDate =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : null;
  const today = formatDateForAPI(new Date());
  const [selectedDate, setSelectedDate] = useState(openingDate ?? today);
  const firstOfThisMonth = (() => {
    const d = new Date();
    d.setDate(1);
    return formatDateForAPI(d);
  })();
  const [visibleMonth, setVisibleMonth] = useState(
    openingDate ? `${openingDate.slice(0, 7)}-01` : firstOfThisMonth
  );

  useEffect(() => {
    if (!screenActiveRef.current) return;
    const requested = Array.isArray(dateParam) ? dateParam[0] : dateParam;
    if (!requested || !/^\d{4}-\d{2}-\d{2}$/.test(requested)) return;
    setSelectedDate((current) => (current === requested ? current : requested));
    const nextMonth = `${requested.slice(0, 7)}-01`;
    setVisibleMonth((current) => (current === nextMonth ? current : nextMonth));
  }, [dateParam]);

  useFocusEffect(
    useCallback(() => {
      screenActiveRef.current = true;
      return () => {
        screenActiveRef.current = false;
      };
    }, [])
  );

  const [showAvailabilityManagement, setShowAvailabilityManagement] =
    useState<boolean>(false);
  const [showAdminAvailabilityManagement, setShowAdminAvailabilityManagement] =
    useState<boolean>(false);
  const [selectedAvailabilityForActions, setSelectedAvailabilityForActions] =
    useState<Availability | null>(null);
  const [selectedAvailability, setSelectedAvailability] =
    useState<Availability | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(true);
  const [isSubmittingEvent, setIsSubmittingEvent] = useState<boolean>(false);
  const [isSubmittingAvailability, setIsSubmittingAvailability] =
    useState<boolean>(false);
  const [sessions, setSessions] = useState<SessionDetailed[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);

  const [showCreateEventModal, setShowCreateEventModal] =
    useState<boolean>(false);
  const [showAvailabilityModal, setShowAvailabilityModal] =
    useState<boolean>(false);
  const [availabilityModalMode, setAvailabilityModalMode] = useState<
    "create" | "edit" | "delete"
  >("create");
  const [showSessionBookingModal, setShowSessionBookingModal] =
    useState<boolean>(false);
  const [selectedAvailabilityForBooking, setSelectedAvailabilityForBooking] =
    useState<Availability | null>(null);
  const [showSessionDetailsModal, setShowSessionDetailsModal] =
    useState<boolean>(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<SessionDetailed | null>(null);
  const [isCancellingSession, setIsCancellingSession] =
    useState<boolean>(false);
  const [instructorFilterId, setInstructorFilterId] = useState<number | null>(
    null
  );
  const [companyInstructors, setCompanyInstructors] = useState<User[]>([]);
  const [selectedInstructorForAdmin, setSelectedInstructorForAdmin] = useState<
    number | null
  >(null);
  const [studentEnrollment, setStudentEnrollment] = useState<EnrollmentWithCourse | null>(null);
  const [studentSessionToCancel, setStudentSessionToCancel] = useState<SessionDetailed | null>(null);
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [timeOffInstructorId, setTimeOffInstructorId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promises = [];

      if (user?.company_id) {
        promises.push(loadEventsForDateRange());
        promises.push(loadSessionsForMonth());
      }

      promises.push(loadCalendarAvailabilities());
      if (user?.role === UserRole.STUDENT) {
        promises.push(loadStudentEnrollment());
      }
      if (canManageOtherInstructorAvailability && user?.company_id) {
        promises.push(loadCompanyInstructors(user.company_id));
      }

      await Promise.all(promises);
    } catch (error) {
      console.error("Error loading initial data:", error);
      setError("Failed to load calendar data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventsForDateRange = async () => {
    if (!user?.company_id) return;

    setIsLoadingEvents(true);
    try {
      const selectedDateObject = createLocalDate(selectedDate);
      const startOfMonth = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );

      const response = await eventService.getEventsByCompanyAndTimeRange(
        user.company_id,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
      );

      if (response.success && response.data) {
        setEvents(response.data);
      } else {
        console.error("Failed to load events:", response.error);
      }
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const loadSessionsForMonth = async () => {
    if (!user) return;
    setIsLoadingSessions(true);

    try {
      const { start, end } = getPaddedMonthRange(selectedDate);

      const response = await sessionService.getMyCalendarSessions({
        start_date: formatDateForAPI(start),
        end_date: formatDateForAPI(end),
      });

      if (response.success && response.data) {
        setSessions(response.data);
      } else {
        console.error("Failed to load sessions:", response.error);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadMyAvailabilities = async () => {
    try {
      const response = await instructorAvailabilityService.getMyAvailability();

      if (response.success && response.data) {
        setAvailabilities(response.data);
      } else {
        console.error("Failed to load availabilities:", response.error);
      }
    } catch (error) {
      console.error("Error loading availabilities:", error);
    }
  };

  const loadCompanyAvailabilities = async () => {
    try {
      const { start, end } = getPaddedMonthRange(selectedDate);
      const startDateString = formatDateForAPI(start);
      const endDateString = formatDateForAPI(end);
      const response =
        await instructorAvailabilityService.getCompanyAvailability(
          startDateString,
          endDateString
        );

      if (response.success && response.data) {
        setAvailabilities(response.data);
      } else {
        console.error(
          "Failed to load company availabilities:",
          response.error
        );
      }
    } catch (error) {
      console.error("Error loading company availabilities:", error);
    }
  };

  const loadStudentEnrollment = async () => {
    const response = await courseService.getMyEnrolledCourse();
    setStudentEnrollment(response.success && response.data ? response.data : null);
  };

  const loadAssignedInstructorAvailabilities = async (instructorId: number) => {
    try {
      const { start, end } = getPaddedMonthRange(selectedDate);
      const response = await instructorAvailabilityService.getAvailabilityForCalendar(
        instructorId,
        formatDateForAPI(start),
        formatDateForAPI(end)
      );
      if (response.success && response.data) {
        setAvailabilities(response.data);
      } else {
        console.error("Failed to load instructor availabilities:", response.error);
      }
    } catch (loadError) {
      console.error("Error loading instructor availabilities:", loadError);
    }
  };

  /** What the calendar view shows outside of the manage panels (mirrors web CalendarPage). */
  const loadCalendarAvailabilities = async () => {
    if (canManageOtherInstructorAvailability) return loadCompanyAvailabilities();
    if (isInstructor) return loadMyAvailabilities();
    if (user?.role === UserRole.STUDENT && user.instructor_id) {
      return loadAssignedInstructorAvailabilities(user.instructor_id);
    }
    return loadCompanyAvailabilities();
  };

  const loadCompanyInstructors = async (companyId: number) => {
    try {
      const response = await userService.getInstructorsByCompany(companyId);
      if (response.success && response.data) {
        setCompanyInstructors(response.data);
        if (!selectedInstructorForAdmin && response.data.length > 0) {
          setSelectedInstructorForAdmin(response.data[0].id);
        }
      }
    } catch (loadError) {
      console.error("Error loading company instructors:", loadError);
    }
  };

  const loadAdminInstructorAvailabilities = async (instructorId: number) => {
    try {
      const response =
        await instructorAvailabilityService.getInstructorAvailabilityForAdmin(
          instructorId
        );
      if (response.success && response.data) {
        setAvailabilities(response.data);
      }
    } catch (loadError) {
      console.error("Error loading admin instructor availability:", loadError);
    }
  };

  const handleSelectDate = (day: any) => {
    setSelectedDate(day.dateString);
    if (showAvailabilityManagement && canManageOtherInstructorAvailability) {
      loadCalendarAvailabilities();
    }
    setShowAvailabilityManagement(false);
    setSelectedAvailabilityForActions(null);
  };

  const handleCreateEvent = () => {
    if (!selectedDate) {
      Alert.alert("Select Date", "Please select a date first");
      return;
    }

    if (user?.role !== UserRole.ADMIN) {
      Alert.alert("Permission Denied", "Only admins can create events");
      return;
    }

    setShowCreateEventModal(true);
  };

  const handleManageOwnAvailability = () => {
    if (!canManageOwnAvailability) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to manage availability."
      );
      return;
    }
    const newShowState = !showAvailabilityManagement;
    setShowAvailabilityManagement(newShowState);
    setShowAdminAvailabilityManagement(false);
    setSelectedAvailabilityForActions(null);
    if (newShowState) {
      loadMyAvailabilities();
    } else {
      loadCalendarAvailabilities();
    }
  };

  const handleManageOtherAvailability = () => {
    if (!canManageOtherInstructorAvailability) {
      Alert.alert(
        "Permission Denied",
        "You do not have permission to manage other instructors' availability."
      );
      return;
    }
    if (!selectedInstructorForAdmin) {
      Alert.alert("Select Instructor", "Choose an instructor to manage first.");
      return;
    }
    const newShowState = !showAdminAvailabilityManagement;
    setShowAdminAvailabilityManagement(newShowState);
    setShowAvailabilityManagement(false);
    setSelectedAvailabilityForActions(null);
    if (newShowState) {
      loadAdminInstructorAvailabilities(selectedInstructorForAdmin);
    } else {
      loadCalendarAvailabilities();
    }
  };

  const reloadAfterTimeOff = () => {
    if (showAdminAvailabilityManagement && selectedInstructorForAdmin) {
      loadAdminInstructorAvailabilities(selectedInstructorForAdmin);
    } else if (showAvailabilityManagement) {
      loadMyAvailabilities();
    } else {
      loadCalendarAvailabilities();
    }
    loadSessionsForMonth();
  };

  const handleSelectAvailabilityForActions = (availability: Availability) => {
    if (selectedAvailabilityForActions?.id === availability.id) {
      setSelectedAvailabilityForActions(null);
    } else {
      setSelectedAvailabilityForActions(availability);
    }

    setTimeout(() => {
      availabilityScrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAddAvailability = () => {
    setAvailabilityModalMode("create");
    setSelectedAvailability(null);
    setShowAvailabilityModal(true);
  };

  const handleUpdateAvailability = () => {
    if (!selectedAvailabilityForActions) return;

    setAvailabilityModalMode("edit");
    setSelectedAvailability(selectedAvailabilityForActions);
    setShowAvailabilityModal(true);
  };

  const handleDeleteAvailability = () => {
    if (!selectedAvailabilityForActions) return;
    setAvailabilityModalMode("delete");
    setSelectedAvailability(selectedAvailabilityForActions);
    setShowAvailabilityModal(true);
  };

  const handleCreateEventSubmit = async (data: CreateEventRequest) => {
    setIsSubmittingEvent(true);

    try {
      const response = await eventService.createEvent(data);

      if (response.success && response.data) {
        setEvents((prevEvents) => [...prevEvents, response.data!]);

        setShowCreateEventModal(false);
        Alert.alert("Success", "Event created successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleCreateAvailabilitySubmit = async (
    availabilityRequests: CreateAvailabilityRequest[]
  ) => {
    if (availabilityRequests.length === 0) return;
    setIsSubmittingAvailability(true);
    const isAdminCreate =
      showAdminAvailabilityManagement && !!selectedInstructorForAdmin;
    try {
      const responses = await Promise.all(
        availabilityRequests.map((availabilityData) =>
          isAdminCreate
            ? instructorAvailabilityService.createAvailabilityAsAdmin({
                ...availabilityData,
                instructor_id: selectedInstructorForAdmin!,
              })
            : instructorAvailabilityService.createAvailability(availabilityData)
        )
      );

      const created = responses
        .map((response) => (response.success ? response.data : undefined))
        .filter((availability): availability is Availability => !!availability);
      const failures = responses.filter((response) => !response.success);

      if (created.length > 0) {
        if (isAdminCreate) {
          await loadAdminInstructorAvailabilities(selectedInstructorForAdmin!);
        } else {
          setAvailabilities((prev) => [...prev, ...created]);
        }
      }

      if (failures.length === 0) {
        setShowAvailabilityModal(false);
        Alert.alert(
          "Success",
          created.length > 1
            ? `${created.length} availability windows created`
            : "Availability created successfully"
        );
      } else {
        const reasons = Array.from(
          new Set(failures.map((f) => f.error || "Failed to create availability"))
        ).join("\n");
        Alert.alert(
          created.length > 0 ? "Some days failed" : "Error",
          created.length > 0
            ? `${created.length} created, ${failures.length} failed:\n${reasons}`
            : reasons
        );
      }
    } catch (error) {
      console.error("Error creating availability:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingAvailability(false);
    }
  };

  const handleUpdateAvailabilitySubmit = async (
    id: number,
    data: AvailabilityUpdate
  ) => {
    setIsSubmittingAvailability(true);
    try {
      const response = await instructorAvailabilityService.updateAvailability(
        id,
        data
      );
      if (response.success && response.data) {
        setAvailabilities((prev) =>
          prev.map((availability) =>
            availability.id === id ? response.data! : availability
          )
        );

        setShowAvailabilityModal(false);
        Alert.alert("Success", "Availability updated successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to update availability");
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingAvailability(false);
    }
  };

  const handleDeleteAvailabilityConfirm = async (id: number) => {
    setIsSubmittingAvailability(true);
    try {
      const response = await instructorAvailabilityService.deleteAvailability(
        id
      );
      if (response.success) {
        setAvailabilities((prev) =>
          prev.filter((availability) => availability.id !== id)
        );
        setShowAvailabilityModal(false);
        Alert.alert("Success", "Availability deleted successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to delete availability");
      }
    } catch (error) {
      console.error("Error deleting availability:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmittingAvailability(false);
    }
  };

  const eventsForSelectedDate = events.filter(
    (event) => toLocalDateKey(event.start_time) === selectedDate
  );

  const getDateObject = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  /** Backend uses Python weekday: Monday=0, Sunday=6. JS getDay() is Sunday=0, Saturday=6. */
  const toBackendDayOfWeek = (date: Date) => (date.getDay() + 6) % 7;
  const weekdayIndexToBackendDayOfWeek = (dayIndex: number) => (dayIndex + 6) % 7;

  const selectedDateObject = getDateObject(selectedDate);
  const selectedDayOfWeek = toBackendDayOfWeek(selectedDateObject);
  const getAvailabilitiesForSelectedDate = () => {
    return availabilities.filter((availability) => {
      if (availability.day_of_week !== selectedDayOfWeek) {
        return false;
      }

      const selectedDateObj = new Date(selectedDate + "T00:00:00");
      const startDate = new Date(availability.start_date + "T00:00:00");

      if (selectedDateObj < startDate) {
        return false;
      }

      if (availability.end_date) {
        const endDate = new Date(availability.end_date + "T00:00:00");
        if (selectedDateObj > endDate) {
          return false;
        }
      }
      return true;
    });
  };
  const availabilitiesForSelectedDate = getAvailabilitiesForSelectedDate();

  const instructorsFromAvailability = React.useMemo(() => {
    const seen = new Map<number, string>();
    availabilities.forEach((a) => {
      if (a.instructor_id && !seen.has(a.instructor_id)) {
        seen.set(
          a.instructor_id,
          a.instructor_name ?? `Instructor ${a.instructor_id}`
        );
      }
    });
    return Array.from(seen.entries(), ([id, name]) => ({ id, name })).sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [availabilities]);

  const showInstructorFilter =
    ((user?.role === UserRole.STUDENT && !user.instructor_id) ||
      canManageOtherInstructorAvailability) &&
    instructorsFromAvailability.length > 1;

  const unavailableBlocksForSelectedDate =
    availabilitiesForSelectedDate.filter(isUnavailableRow);

  /** A slot is blocked only when it lies fully inside an unavailable window (matches backend). */
  const isCoveredByTimeOff = (a: Availability) => {
    const start = timeToMinutes(a.start_time);
    const end = timeToMinutes(a.end_time);
    return unavailableBlocksForSelectedDate.some(
      (u) =>
        u.instructor_id === a.instructor_id &&
        timeToMinutes(u.start_time) <= start &&
        timeToMinutes(u.end_time) >= end
    );
  };

  const displayAvailabilitiesForSelectedDate = availabilitiesForSelectedDate.filter(
    (a) =>
      (isUnavailableRow(a)
        ? user?.role !== UserRole.STUDENT
        : !isCoveredByTimeOff(a)) &&
      (instructorFilterId == null || a.instructor_id === instructorFilterId)
  );

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.company_id) {
      loadEventsForDateRange();
      loadSessionsForMonth();
    }
  }, [selectedDate, user]);

  const selectedMonthKey = selectedDate.slice(0, 7);
  const loadedAvailabilityMonthRef = useRef<string | null>(null);
  useEffect(() => {
    if (!user) return;
    if (loadedAvailabilityMonthRef.current === null) {
      loadedAvailabilityMonthRef.current = selectedMonthKey;
      return;
    }
    if (loadedAvailabilityMonthRef.current === selectedMonthKey) return;
    loadedAvailabilityMonthRef.current = selectedMonthKey;
    if (!showAvailabilityManagement && !showAdminAvailabilityManagement) {
      loadCalendarAvailabilities();
    }
  }, [selectedMonthKey, user]);

  const handleAvailabilityPress = (availability: Availability) => {
    if (user?.role === UserRole.STUDENT) {
      setSelectedAvailabilityForBooking(availability);
      setShowSessionBookingModal(true);
    }
  };

  const handleSessionPress = (session: SessionDetailed) => {
    setSelectedSessionForDetails(session);
    setShowSessionDetailsModal(true);
  };

  const handleBookingSuccess = (session: SessionDetailed) => {
    setSessions((prevSessions) => [
      ...prevSessions.filter((s) => s.id !== session.id),
      session,
    ]);
    setShowSessionBookingModal(false);
    loadSessionsForMonth();
    if (user?.role === UserRole.STUDENT) loadStudentEnrollment();
  };

  /** After any cancel the API may also cancel later bookings, so reload rather than patch state. */
  const reloadAfterCancel = () => {
    loadSessionsForMonth();
    if (user?.role === UserRole.STUDENT) loadStudentEnrollment();
    if (!showAvailabilityManagement && !showAdminAvailabilityManagement) {
      loadCalendarAvailabilities();
    }
  };

  const handleStudentRequestCancel = (session: SessionDetailed) => {
    setShowSessionDetailsModal(false);
    setStudentSessionToCancel(session);
  };

  const handleSessionCancel = async (sessionId: number) => {
    setIsCancellingSession(true);
    try {
      const response = await sessionService.cancelSession(sessionId);

      if (response.success) {
        setSessions((prevSessions) =>
          prevSessions.filter((session) => session.id !== sessionId)
        );
        setShowSessionDetailsModal(false);
        Alert.alert("Success", "Session cancelled successfully");
        reloadAfterCancel();
      } else {
        Alert.alert("Error", response.error || "Failed to cancel session");
      }
    } catch (error) {
      console.error("Error cancelling session:", error);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsCancellingSession(false);
    }
  };

  const handleReviewMaterials = () => {
    router.push({
      pathname: "/company/courses",
      params: {
        courseId: selectedSessionForDetails?.course_id,
      },
    });
    setShowSessionDetailsModal(false);
  };

  const handleBeginSession = (sessionId: number) => {
    router.push({
      pathname: "/company/session-form",
      params: { sessionId: sessionId.toString() },
    });
    setShowSessionDetailsModal(false);
  };

  const handleCheckIn = (sessionId: number) => {
    router.push({
      pathname: "/company/session-check-in",
      params: { sessionId: String(sessionId) },
    });
    setShowSessionDetailsModal(false);
  };

  const datesWithActivity = new Set<string>();
  events.forEach((event) => {
    datesWithActivity.add(toLocalDateKey(event.start_time));
  });
  sessions.forEach((session) => {
    datesWithActivity.add(toLocalDateKey(session.start_time));
  });

  const isStudentCalendar = user?.role === UserRole.STUDENT && !!studentEnrollment;
  const visibleMonthStartWeek = getWeekBounds(createLocalDate(visibleMonth)).startDate;
  const visibleMonthEndWeek = (() => {
    const d = createLocalDate(visibleMonth);
    return getWeekBounds(new Date(d.getFullYear(), d.getMonth() + 1, 0)).startDate;
  })();
  const studentWeeksWithSession = useMemo(() => buildWeeksWithSession(sessions), [sessions]);
  const studentWeekStateMap = useMemo(() => {
    if (!isStudentCalendar || !studentEnrollment) return new Map<string, BookingWeekState>();
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(visibleMonthStartWeek) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(visibleMonthEndWeek)
    ) {
      return new Map<string, BookingWeekState>();
    }
    const todayWeekStart = getWeekBounds(new Date()).startDate;
    const context: BookingTrackContext = {
      currentWeekStart: todayWeekStart,
      cadence: studentEnrollment.program_cadence === "BIWEEKLY" ? "BIWEEKLY" : "WEEKLY",
      anchorWeekStart: resolveAnchorWeekStart(
        studentEnrollment.cadence_anchor_date,
        studentEnrollment.enrolled_at,
        todayWeekStart
      ),
      baselineWeeksMissed:
        typeof studentEnrollment.weeks_missed === "number" ? studentEnrollment.weeks_missed : 0,
      weeksWithSession: studentWeeksWithSession,
    };
    const recommended = resolveRecommendedWeekStart(studentEnrollment.next_week_to_book, context);
    return buildWeekStateMap(visibleMonthStartWeek, visibleMonthEndWeek, context, recommended);
  }, [isStudentCalendar, studentEnrollment, studentWeeksWithSession, visibleMonthStartWeek, visibleMonthEndWeek]);

  const getTrackMarker = (weekStart: string): TrackMarker => {
    if (!isStudentCalendar) return null;
    if (studentWeeksWithSession.has(weekStart)) return "booked";
    const state = studentWeekStateMap.get(weekStart);
    if (state === "upcomingAtRisk" || state === "currentWeek") return "bookNow";
    if (state === "upcomingGapMiss" || state === "pastMissed") return "skipRisk";
    return null;
  };

  const markedDates: Record<
    string,
    {
      selected?: boolean;
      selectedColor?: string;
      marked?: boolean;
      dotColor?: string;
      customStyles?: { container?: object; text?: object };
    }
  > = {};
  if (isStudentCalendar) {
    let weekStart = visibleMonthStartWeek;
    let steps = 0;
    while (weekStart && weekStart <= visibleMonthEndWeek && steps < 8) {
      const marker = getTrackMarker(weekStart);
      if (marker) {
        for (let i = 0; i < 7; i += 1) {
          markedDates[addDays(weekStart, i)] = {
            customStyles: {
              container: {
                borderBottomWidth: 3,
                borderBottomColor: TRACK_MARKER_COLORS[marker],
                // react-native-calendars writes borderRadius onto this object during render.
                borderRadius: 8,
              },
            },
          };
        }
      }
      const nextWeek = addDays(weekStart, 7);
      if (!nextWeek || nextWeek <= weekStart) break;
      weekStart = nextWeek;
      steps += 1;
    }
  }
  datesWithActivity.forEach((dateStr) => {
    markedDates[dateStr] = {
      ...markedDates[dateStr],
      marked: true,
      dotColor: themes.vegasGold,
    };
  });
  const selectedTrack = markedDates[selectedDate]?.customStyles?.container as
    | { borderBottomColor?: string }
    | undefined;
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: themes.goldMedium,
    customStyles: {
      container: {
        backgroundColor: themes.goldLight,
        borderWidth: 1.5,
        borderColor: themes.vegasGold,
        ...(selectedTrack?.borderBottomColor
          ? { borderBottomWidth: 3, borderBottomColor: selectedTrack.borderBottomColor }
          : null),
        borderRadius: 8,
      },
      text: { color: themes.vegasGold, fontFamily: "Archivo_700Bold" },
    },
  };

  const sessionsForSelectedDate = sessions.filter(
    (session) => toLocalDateKey(session.start_time) === selectedDate
  );

  const renderActionButtons = () => {
    const buttons = [];

    if (user?.role === UserRole.ADMIN) {
      buttons.push(
        <TouchableOpacity
          key="create-event"
          style={styles.actionButton}
          onPress={handleCreateEvent}
        >
          <Text style={styles.actionButtonText}>Create Event</Text>
        </TouchableOpacity>
      );
    }

    if (canManageOwnAvailability) {
      buttons.push(
        <TouchableOpacity
          key="manage-availability"
          style={[
            styles.actionButton,
            showAvailabilityManagement && styles.actionButtonActive,
          ]}
          onPress={handleManageOwnAvailability}
        >
          <Text
            style={[
              styles.actionButtonText,
              showAvailabilityManagement && styles.actionButtonTextActive,
            ]}
          >
            {showAvailabilityManagement
              ? "Hide Availability"
              : "Manage Availability"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (canManageOwnTimeOff) {
      buttons.push(
        <TouchableOpacity
          key="own-time-off"
          style={styles.actionButton}
          onPress={() => {
            setTimeOffInstructorId(null);
            setShowTimeOffModal(true);
          }}
        >
          <Text style={styles.actionButtonText}>Block Time Off</Text>
        </TouchableOpacity>
      );
    }

    if (canManageOtherInstructorAvailability && showAdminAvailabilityManagement && selectedInstructorForAdmin) {
      buttons.push(
        <TouchableOpacity
          key="instructor-time-off"
          style={styles.actionButton}
          onPress={() => {
            setTimeOffInstructorId(selectedInstructorForAdmin);
            setShowTimeOffModal(true);
          }}
        >
          <Text style={styles.actionButtonText}>Block Instructor Time Off</Text>
        </TouchableOpacity>
      );
    }

    if (canManageOtherInstructorAvailability) {
      buttons.push(
        <TouchableOpacity
          key="manage-instructor-availability"
          style={[
            styles.actionButton,
            showAdminAvailabilityManagement && styles.actionButtonActive,
          ]}
          onPress={handleManageOtherAvailability}
        >
          <Text
            style={[
              styles.actionButtonText,
              showAdminAvailabilityManagement && styles.actionButtonTextActive,
            ]}
          >
            {showAdminAvailabilityManagement
              ? "Hide Instructor Schedule"
              : "Manage Instructor Schedule"}
          </Text>
        </TouchableOpacity>
      );
    }

    if (buttons.length === 0) return null;

    return (
      <>
        {canManageOtherInstructorAvailability && (
          <View style={styles.instructorFilterRow}>
            <Text style={styles.instructorFilterLabel}>Instructor</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.instructorChipRow}
            >
              {companyInstructors.length === 0 ? (
                <Text style={styles.instructorFilterLabel}>No instructors found</Text>
              ) : (
                companyInstructors.map((instructor) => {
                  const selected = selectedInstructorForAdmin === instructor.id;
                  return (
                    <TouchableOpacity
                      key={instructor.id}
                      style={[
                        styles.instructorChip,
                        selected && styles.instructorChipSelected,
                      ]}
                      onPress={() => {
                        setSelectedInstructorForAdmin(instructor.id);
                        if (showAdminAvailabilityManagement) {
                          loadAdminInstructorAvailabilities(instructor.id);
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.instructorChipText,
                          selected && styles.instructorChipTextSelected,
                        ]}
                      >
                        {instructor.first_name} {instructor.last_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        )}
        <View style={styles.buttonContainer}>{buttons}</View>
      </>
    );
  };

  const renderAvailabilityManagement = () => {
    return (
      <View>
        <Text style={styles.scheduleText}>
          {showAdminAvailabilityManagement
            ? "Manage Instructor Availability"
            : "Manage Availability"}
        </Text>

        <ScrollView
          ref={availabilityScrollViewRef}
          style={styles.scheduleList}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <View style={styles.addButtonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAvailability}
            >
              <Text style={styles.addButtonText}>Add Availability</Text>
            </TouchableOpacity>
          </View>
          {availabilities.length > 0 ? (
            renderAvailabilityByDay()
          ) : (
            <Text style={styles.noAvailabilityText}>
              No availability set. Tap Add Availability to create one.
            </Text>
          )}
          {selectedAvailabilityForActions && (
            <View style={styles.availabilityActionButtons}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={handleUpdateAvailability}
              >
                <Text style={styles.updateButtonText}>Update Availability</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteAvailability}
              >
                <Text style={styles.deleteButtonText}>Delete Availability</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderAvailabilityByDay = () => {
    const dayOfWeek = [
      { day: 0, name: "Sunday" },
      { day: 1, name: "Monday" },
      { day: 2, name: "Tuesday" },
      { day: 3, name: "Wednesday" },
      { day: 4, name: "Thursday" },
      { day: 5, name: "Friday" },
      { day: 6, name: "Saturday" },
    ];

    const daysWithAvailability = dayOfWeek.filter(({ day }) => {
      return availabilities.some(
        (availability) =>
          availability.day_of_week === weekdayIndexToBackendDayOfWeek(day)
      );
    });

    return (
      <View style={styles.weeklyScheduleContainer}>
        {daysWithAvailability.map(({ day, name }) => {
          const dayAvailabilities = availabilities.filter(
            (availability) =>
              availability.day_of_week === weekdayIndexToBackendDayOfWeek(day)
          );
          return (
            <View key={day} style={styles.dayScheduleContainer}>
              <Text style={styles.dayTitle}>{name}</Text>
              {dayAvailabilities.length > 0 ? (
                dayAvailabilities.map((availability) => (
                  <TouchableOpacity
                    key={availability.id}
                    style={[
                      styles.sessionCard,
                      selectedAvailabilityForActions?.id === availability.id &&
                        styles.availabilityCardSelected,
                    ]}
                    onPress={() =>
                      handleSelectAvailabilityForActions(availability)
                    }
                  >
                    <View style={styles.availabilityInfo}>
                      <Text style={styles.sessionText}>
                        {isUnavailableRow(availability) ? "Unavailable: " : ""}
                        {formatTimeString(availability.start_time)} -{" "}
                        {formatTimeString(availability.end_time)}{" "}
                        {formatDateRange(
                          availability.start_date,
                          availability.end_date
                        )}
                      </Text>
                    </View>

                    {selectedAvailabilityForActions?.id === availability.id && (
                      <View style={styles.selectionIndicator}>
                        <Text style={styles.selectionIndicatorText}>
                          Selected
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noAvailabilityText}>No availability</Text>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.safeArea}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={loadInitialData}
            >
              <Text style={styles.actionButtonText}>Retry</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <BackgroundGradient>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.scheduleContainer}>
              <ActivityIndicator size="large" color={themes.vegasGold} />
              <Text style={styles.scheduleText}>Loading Calendar</Text>
            </View>
          </SafeAreaView>
        </BackgroundGradient>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <BackgroundGradient>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.pageScroll}
            contentContainerStyle={[
              styles.pageScrollContent,
              { paddingBottom: bottomContentPadding },
            ]}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            <View style={styles.calendarContainer}>
              <Calendar
                initialDate={visibleMonth}
                current={selectedDate}
                markingType={isStudentCalendar ? "custom" : "dot"}
                markedDates={markedDates}
                theme={{
                  calendarBackground: "transparent",
                  textSectionTitleColor: themes.textMuted,
                  selectedDayBackgroundColor: themes.goldMedium,
                  selectedDayTextColor: themes.vegasGold,
                  todayTextColor: themes.vegasGold,
                  dayTextColor: themes.textPrimary,
                  textDisabledColor: themes.textMuted,
                  monthTextColor: themes.vegasGold,
                  arrowColor: themes.vegasGold,
                  textMonthFontSize: monthTitleFontSize,
                  textDayFontSize: Math.max(13, daySize * 0.2),
                  textDayHeaderFontSize: 12,
                  textDayFontFamily: "Archivo_600SemiBold",
                  textDayHeaderFontFamily: "Archivo_500Medium",
                  ...({
                    "stylesheet.day.basic": {
                      base: {
                        width: daySize,
                        height: daySize,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: themes.borderSubtle,
                        backgroundColor: themes.backgroundSoft,
                      },
                    },
                  } as any),
                  ...({
                    // Let the custom month header span the full width so the arrows sit at the edges.
                    "stylesheet.calendar.header": {
                      headerContainer: { flex: 1, flexDirection: "row" },
                    },
                  } as any),
                  ...({
                    "stylesheet.day.header": {
                      base: {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 8,
                        color: themes.white,
                      },
                    },
                  } as any),
                }}
                enableSwipeMonths={false}
                hideArrows={true}
                onMonthChange={(month) => {
                  // Swipe is off because its gesture handler calls this while Android is
                  // removing the screen, and that update crashes the app. Prev/Next still work.
                  if (!screenActiveRef.current) return;
                  const dateString = month?.dateString;
                  if (!dateString || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return;
                  const nextMonth = `${dateString.slice(0, 7)}-01`;
                  setVisibleMonth((current) => (current === nextMonth ? current : nextMonth));
                }}
                renderHeader={() => {
                  const d = new Date(visibleMonth + "T00:00:00");
                  const monthYear = d.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <View style={styles.monthNavRow}>
                      <TouchableOpacity
                        style={styles.monthNavButton}
                        onPress={goToPrevMonth}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Previous month"
                      >
                        <Feather name="chevron-left" size={18} color={themes.textSecondary} />
                      </TouchableOpacity>
                      <Text style={styles.monthTitle}>{monthYear}</Text>
                      <TouchableOpacity
                        style={styles.monthNavButton}
                        onPress={goToNextMonth}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel="Next month"
                      >
                        <Feather name="chevron-right" size={18} color={themes.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  );
                }}
                onDayPress={handleSelectDate}
              />
            </View>

            {isStudentCalendar && (
              <View
                style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 12 }}
                accessibilityLabel="Booking track legend"
              >
                {(
                  [
                    ["booked", "Booked week"],
                    ["bookNow", "Book this week"],
                    ["skipRisk", "Skipped/missed"],
                  ] as const
                ).map(([marker, label]) => (
                  <View key={marker} style={styles.legendItem}>
                    <View style={[styles.legendSwatch, { backgroundColor: TRACK_MARKER_COLORS[marker] }]} />
                    <Text style={styles.legendText}>{label}</Text>
                  </View>
                ))}
              </View>
            )}

            {renderActionButtons()}

            <View style={styles.scheduleContainer}>
              {(canManageOwnAvailability && showAvailabilityManagement) ||
              (canManageOtherInstructorAvailability && showAdminAvailabilityManagement) ? (
                renderAvailabilityManagement()
              ) : (
                <>
                  <Text style={styles.scheduleText}>Schedule</Text>
                  <ScrollView
                    style={styles.scheduleList}
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  >
                    {eventsForSelectedDate.length > 0 && (
                      <>
                        <Text style={styles.sectionSubtitle}>Events</Text>
                        {eventsForSelectedDate.map((event) => (
                          <View key={event.id} style={styles.sessionCard}>
                            <Text style={styles.sessionText}>
                              {event.title}: {""}
                              {formatTimeString(event.start_time)} -{" "}
                              {formatTimeString(event.end_time)}
                            </Text>
                          </View>
                        ))}
                      </>
                    )}
                    {sessionsForSelectedDate.length > 0 && (
                      <>
                        <Text style={styles.sectionSubtitle}>
                          Training Sessions
                        </Text>
                        {sessionsForSelectedDate.map((session) => (
                          <TouchableOpacity
                            key={session.id}
                            style={styles.sessionCard}
                            onPress={() => handleSessionPress(session)}
                          >
                            <View style={styles.sessionInfo}>
                              <Text style={styles.sessionTitleText}>
                                {session.course_title || session.title} From {formatTimeString(session.start_time)} -{" "}{formatTimeString(session.end_time)}
                              </Text>
                              <Text style={styles.sessionText}>
                                Progress: {session.enrollment_progress_display}
                              </Text>
                              {user?.role === UserRole.INSTRUCTOR ? (
                                <Text style={styles.sessionText}>
                                  Student: {session.student_name} 
                                </Text>
                              ) : (
                                <Text style={styles.sessionText}>
                                  Instructor: {session.instructor_name}
                                </Text>
                              )}
                            </View>
                            <View style={styles.bookingActionWrap}>
                              <Text style={styles.actionButtonText}>
                                VIEW
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </>
                    )}

                    {eventsForSelectedDate.length === 0 &&
                      sessionsForSelectedDate.length === 0 &&
                      displayAvailabilitiesForSelectedDate.length === 0 && (
                        <Text style={styles.noAvailabilityText}>
                          No schedule items for this date.
                        </Text>
                      )}

                    {canManageOwnAvailability &&
                      availabilities.length === 0 && (
                        <>
                          <Text style={styles.sectionSubtitle}>
                            Your Availability
                          </Text>
                          <Text style={styles.noAvailabilityText}>
                            No availability set. Tap Manage Availability to
                            create your schedule.
                          </Text>
                        </>
                      )}

                    {availabilities.length > 0 && (
                      <>
                        {showInstructorFilter && (
                          <View style={styles.instructorFilterRow}>
                            <Text style={styles.instructorFilterLabel}>
                              Filter by instructor
                            </Text>
                            <ScrollView
                              horizontal
                              showsHorizontalScrollIndicator={false}
                              contentContainerStyle={styles.instructorChipRow}
                            >
                              <TouchableOpacity
                                style={[
                                  styles.instructorChip,
                                  instructorFilterId == null &&
                                    styles.instructorChipSelected,
                                ]}
                                onPress={() => setInstructorFilterId(null)}
                              >
                                <Text
                                  style={[
                                    styles.instructorChipText,
                                    instructorFilterId == null &&
                                      styles.instructorChipTextSelected,
                                  ]}
                                >
                                  All
                                </Text>
                              </TouchableOpacity>
                              {instructorsFromAvailability.map(({ id, name }) => {
                                const selected = instructorFilterId === id;
                                return (
                                  <TouchableOpacity
                                    key={id}
                                    style={[
                                      styles.instructorChip,
                                      selected && styles.instructorChipSelected,
                                    ]}
                                    onPress={() => setInstructorFilterId(id)}
                                  >
                                    <Text
                                      style={[
                                        styles.instructorChipText,
                                        selected &&
                                          styles.instructorChipTextSelected,
                                      ]}
                                    >
                                      {name}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                            </ScrollView>
                          </View>
                        )}
                        <Text style={styles.sectionSubtitle}>
                          {canManageOtherInstructorAvailability
                            ? "Company Availability"
                            : user?.role === UserRole.INSTRUCTOR
                            ? "Your Availability"
                            : "Instructor's Availability"}
                        </Text>
                        {displayAvailabilitiesForSelectedDate.length > 0 ? (
                          displayAvailabilitiesForSelectedDate.map((availability) => (
                            <TouchableOpacity
                              key={availability.id}
                              style={[
                                styles.sessionCard,
                              ]}
                              onPress={() =>
                                user?.role === UserRole.STUDENT &&
                                handleAvailabilityPress(availability)
                              }
                              disabled={user?.role !== UserRole.STUDENT}
                            >
                              <View >
                                <Text style={styles.sessionText}>
                                  {isUnavailableRow(availability) ? "Unavailable" : "Available"}:{" "}
                                  {formatTimeString(availability.start_time)} -{" "}
                                  {formatTimeString(availability.end_time)}
                                </Text>
                                {availability.instructor_name &&
                                  (user?.role === UserRole.STUDENT ||
                                    canManageOtherInstructorAvailability) && (
                                  <Text style={styles.sessionText}>
                                    Instructor: {availability.instructor_name}
                                  </Text>
                                )}
                                {user?.role === UserRole.STUDENT && (
                                  <Text style={styles.hintText}>
                                    Tap to book a session
                                  </Text>
                                )}
                              </View>
                              {user?.role === UserRole.STUDENT && (
                                <View style={styles.bookingActionWrap}>
                                  <Text style={styles.actionButtonText}>
                                    BOOK
                                  </Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          ))
                        ) : (
                          <Text style={styles.noAvailabilityText}>
                            No availability for{" "}
                            {
                              [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                                "Saturday",
                                "Sunday",
                              ][selectedDayOfWeek]
                            }{" "}
                            {formatDateString(selectedDate)}
                          </Text>
                        )}
                        {canManageOwnAvailability && (
                          <Text style={styles.hintText}>
                            Tap Manage Availability to see your full weekly
                            schedule
                          </Text>
                        )}
                      </>
                    )}
                  </ScrollView>
                </>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>

        {user?.role === UserRole.ADMIN && (
          <CreateEventModal
            visible={showCreateEventModal}
            isSubmitting={isSubmittingEvent}
            selectedDate={selectedDate}
            onClose={() => setShowCreateEventModal(false)}
            onSubmit={handleCreateEventSubmit}
          />
        )}

        {(canManageOwnTimeOff || canManageOtherInstructorAvailability) && (
          <TimeOffModal
            visible={showTimeOffModal}
            selectedDate={selectedDate}
            instructorId={timeOffInstructorId}
            instructorName={(() => {
              const inst = companyInstructors.find((u) => u.id === timeOffInstructorId);
              return inst ? `${inst.first_name} ${inst.last_name}` : undefined;
            })()}
            onClose={() => setShowTimeOffModal(false)}
            onSuccess={(cancelledCount) => {
              reloadAfterTimeOff();
              Alert.alert(
                "Time off applied",
                cancelledCount > 0
                  ? `${cancelledCount} session(s) cancelled. Students were emailed to reschedule.`
                  : "Students can no longer book that time."
              );
            }}
          />
        )}

        {(canManageOwnAvailability || canManageOtherInstructorAvailability) && (
          <InstructorAvailabilityModal
            visible={showAvailabilityModal}
            isSubmitting={isSubmittingAvailability}
            availabilities={availabilities}
            mode={availabilityModalMode}
            selectedAvailability={selectedAvailability}
            onClose={() => setShowAvailabilityModal(false)}
            onCreate={handleCreateAvailabilitySubmit}
            onUpdate={handleUpdateAvailabilitySubmit}
            onDelete={handleDeleteAvailabilityConfirm}
          />
        )}

        {user?.role === UserRole.STUDENT && (
          <SessionBookingModal
            visible={showSessionBookingModal}
            availability={selectedAvailabilityForBooking}
            unavailableBlocks={unavailableBlocksForSelectedDate}
            selectedDate={selectedDate}
            instructorId={selectedAvailabilityForBooking?.instructor_id ?? 0}
            onClose={() => {
              setShowSessionBookingModal(false);
              setSelectedAvailabilityForBooking(null);
            }}
            onBookingSuccess={handleBookingSuccess}
          />
        )}

        <SessionDetailsModal
          visible={showSessionDetailsModal}
          session={selectedSessionForDetails}
          onClose={() => {
            setShowSessionDetailsModal(false);
            setSelectedSessionForDetails(null);
          }}
          onCancel={handleSessionCancel}
          onRequestCancel={
            user?.role === UserRole.STUDENT ? handleStudentRequestCancel : undefined
          }
          onReviewMaterials={handleReviewMaterials}
          onBeginSession={
            user?.role === UserRole.INSTRUCTOR ? handleBeginSession : undefined
          }
          onCheckIn={user?.role === UserRole.STUDENT ? handleCheckIn : undefined}
          isCancelling={isCancellingSession}
        />
        {studentSessionToCancel && (
          <StudentCancelSessionModal
            session={studentSessionToCancel}
            onClose={() => setStudentSessionToCancel(null)}
            onCancelled={() => {
              setStudentSessionToCancel(null);
              setSelectedSessionForDetails(null);
              reloadAfterCancel();
            }}
            onReschedule={(date) => {
              setStudentSessionToCancel(null);
              setSelectedSessionForDetails(null);
              setSelectedDate(date);
              setVisibleMonth(`${date.slice(0, 7)}-01`);
              reloadAfterCancel();
            }}
          />
        )}
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
