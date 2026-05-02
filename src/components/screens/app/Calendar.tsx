import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Calendar } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CreateEventModal from "@/src/components/admin/CreateEventModal";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import InstructorAvailabilityModal from "@/src/components/instructor/InstructorAvailabilityModal";
import BottomNavBar from "@/src/components/NavBar";
import SessionBookingModal from "@/src/components/SessionBookingModal";
import SessionDetailsModal from "@/src/components/SessionDetailsModal";

import { useAuth } from "@/src/context/AuthContext";
import { themes } from "@/src/context/themes";
import { calendarScreenStyles as styles } from "@/src/styles/CalendarPageStyles/calendarScreen";

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

import {
  formatDateForAPI,
  formatDateRange,
  formatDateString,
  formatTimeString
} from "@/src/utils/dateTimeUtils";
import { isTestSessionRequired } from "@/src/utils/sessionRules";

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
  const canManageOwnAvailability =
    user?.role === UserRole.INSTRUCTOR &&
    Boolean(user.can_manage_own_availability);
  const availabilityScrollViewRef = useRef<ScrollView>(null);
  const bottomContentPadding = insets.bottom + 150;

  const goToPrevMonth = () => {
    const d = new Date(visibleMonth + "T00:00:00");
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    setVisibleMonth(d.toISOString().split("T")[0]);
  };
  const goToNextMonth = () => {
    const d = new Date(visibleMonth + "T00:00:00");
    d.setDate(1);
    d.setMonth(d.getMonth() + 1);
    setVisibleMonth(d.toISOString().split("T")[0]);
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
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const firstOfThisMonth = (() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split("T")[0];
  })();
  const [visibleMonth, setVisibleMonth] = useState(firstOfThisMonth);

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

      if (canManageOwnAvailability) {
        promises.push(loadMyAvailabilities());
      } else if (user?.role === UserRole.STUDENT || user?.role === UserRole.ADMIN) {
        promises.push(loadCompanyAvailabilities());
      }
      if (user?.role === UserRole.ADMIN && user?.company_id) {
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
      const selectedDateObject = new Date(selectedDate);
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
        99,
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
      const selectedDateObject = new Date(selectedDate);
      const startOfMonth = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth() + 1,
        0
      );

      const response = await sessionService.getMyCalendarSessions({
        start_date: formatDateForAPI(startOfMonth),
        end_date: formatDateForAPI(endOfMonth),
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
      const selectedDateObject = new Date(selectedDate);
      const startOfMonth = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth(),
        1
      );
      const endOfMonth = new Date(
        selectedDateObject.getFullYear(),
        selectedDateObject.getMonth() + 1,
        0
      );
      const startDateString = formatDateForAPI(startOfMonth);
      const endDateString = formatDateForAPI(endOfMonth);
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

  const handleManageAvailability = () => {
    if (user?.role === UserRole.INSTRUCTOR) {
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
      if (!newShowState) {
        setSelectedAvailabilityForActions(null);
      }
      return;
    }

    if (user?.role === UserRole.ADMIN) {
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
        loadCompanyAvailabilities();
      }
      return;
    }

    Alert.alert(
      "Permission Denied",
      "Only instructors or admins can manage availability"
    );
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
    availabilityData: CreateAvailabilityRequest
  ) => {
    setIsSubmittingAvailability(true);
    try {
      const response =
        user?.role === UserRole.ADMIN && selectedInstructorForAdmin
          ? await instructorAvailabilityService.createAvailabilityAsAdmin({
              ...availabilityData,
              instructor_id: selectedInstructorForAdmin,
            })
          : await instructorAvailabilityService.createAvailability(
              availabilityData
            );

      if (response.success && response.data) {
        if (user?.role === UserRole.ADMIN && selectedInstructorForAdmin) {
          await loadAdminInstructorAvailabilities(selectedInstructorForAdmin);
        } else {
          setAvailabilities((prev) => [...prev, response.data!]);
        }
        setShowAvailabilityModal(false);
        Alert.alert("Success", "Availability created successfully");
      } else {
        Alert.alert("Error", response.error || "Failed to create availability");
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

  const eventsForSelectedDate = events.filter((event) => {
    const eventDate = new Date(event.start_time);
    const selectedDateObj = new Date(selectedDate + "T00:00:00");

    const eventDateString = eventDate.toISOString().split("T")[0];
    const selectedDateString = selectedDateObj.toISOString().split("T")[0];
    return eventDateString === selectedDateString;
  });

  const getDateObject = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  /** Backend uses Python weekday: Monday=0, Sunday=6. JS getDay() is Sunday=0, Saturday=6. */
  const toBackendDayOfWeek = (date: Date) => (date.getDay() + 6) % 7;

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
    user?.role === UserRole.STUDENT && instructorsFromAvailability.length > 1;

  const displayAvailabilitiesForSelectedDate =
    instructorFilterId == null
      ? availabilitiesForSelectedDate
      : availabilitiesForSelectedDate.filter(
          (a) => a.instructor_id === instructorFilterId
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
    setSessions((prevSessions) => [...prevSessions, session]);
    setShowSessionBookingModal(false);
    Alert.alert("Success", "Training session booked successfully");
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

        if (user?.role === UserRole.INSTRUCTOR) {
          await loadMyAvailabilities();
        } else if (user?.instructor_id) {
          await loadCompanyAvailabilities();
        }
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
    const selectedSession = sessions.find((session) => session.id === sessionId);
    const weekNumber =
      selectedSession?.week_number ?? selectedSession?.enrollment_current_week;
    const useTestSession =
      selectedSession?.is_test_session_required ??
      isTestSessionRequired(
        weekNumber,
        selectedSession?.course_total_weeks,
        selectedSession?.final_month_initial_test_passed
      );

    router.push({
      pathname: useTestSession ? "/company/test-session-form" : "/company/session-form",
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
    const dateStr = new Date(event.start_time).toISOString().split("T")[0];
    datesWithActivity.add(dateStr);
  });
  sessions.forEach((session) => {
    const dateStr = new Date(session.start_time).toISOString().split("T")[0];
    datesWithActivity.add(dateStr);
  });

  const markedDates: Record<
    string,
    { selected?: boolean; selectedColor?: string; marked?: boolean; dotColor?: string }
  > = {};
  datesWithActivity.forEach((dateStr) => {
    markedDates[dateStr] = {
      ...(dateStr === selectedDate && {
        selected: true,
        selectedColor: themes.vegasGold,
      }),
      marked: true,
      dotColor: themes.vegasGold,
    };
  });
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: themes.vegasGold,
    };
  }

  const sessionsForSelectedDate = sessions.filter((session) => {
    const sessionDate = new Date(session.start_time);
    const selectedDateObj = new Date(selectedDate + "T00:00:00");

    const sessionDateString = sessionDate.toISOString().split("T")[0];
    const selectedDateString = selectedDateObj.toISOString().split("T")[0];

    return sessionDateString === selectedDateString;
  });

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
          onPress={handleManageAvailability}
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

    if (user?.role === UserRole.ADMIN) {
      buttons.push(
        <TouchableOpacity
          key="manage-instructor-availability"
          style={[
            styles.actionButton,
            showAdminAvailabilityManagement && styles.actionButtonActive,
          ]}
          onPress={handleManageAvailability}
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
        {user?.role === UserRole.ADMIN && (
          <View style={styles.instructorFilterRow}>
            <Text style={styles.instructorFilterLabel}>Instructor</Text>
            <View style={styles.instructorFilterPickerWrap}>
              <Picker
                selectedValue={selectedInstructorForAdmin ?? "none"}
                onValueChange={(value) => {
                  const nextValue = value === "none" ? null : (value as number);
                  setSelectedInstructorForAdmin(nextValue);
                  if (nextValue && showAdminAvailabilityManagement) {
                    loadAdminInstructorAvailabilities(nextValue);
                  }
                }}
                style={styles.instructorFilterPicker}
                dropdownIconColor={themes.vegasGold}
              >
                {companyInstructors.length === 0 ? (
                  <Picker.Item label="No instructors found" value="none" />
                ) : (
                  companyInstructors.map((instructor) => (
                    <Picker.Item
                      key={instructor.id}
                      label={`${instructor.first_name} ${instructor.last_name}`}
                      value={instructor.id}
                    />
                  ))
                )}
              </Picker>
            </View>
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
          {user?.role === UserRole.ADMIN
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
        (availability) => availability.day_of_week === toBackendDayOfWeek(day)
      );
    });

    return (
      <View style={styles.weeklyScheduleContainer}>
        {daysWithAvailability.map(({ day, name }) => {
          const dayAvailabilities = availabilities.filter(
            (availability) => availability.day_of_week === toBackendDayOfWeek(day)
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
                key={visibleMonth}
                initialDate={visibleMonth}
                current={selectedDate}
                markingType={"dot"}
                markedDates={markedDates}
                theme={{
                  calendarBackground: "transparent",
                  textSectionTitleColor: themes.vegasGold,
                  selectedDayBackgroundColor: themes.vegasGold,
                  selectedDayTextColor: themes.black,
                  todayTextColor: themes.vegasGold,
                  dayTextColor: themes.textPrimary,
                  textDisabledColor: themes.textMuted,
                  monthTextColor: themes.vegasGold,
                  arrowColor: themes.vegasGold,
                  textMonthFontSize: monthTitleFontSize,
                  textDayFontSize: Math.max(13, daySize * 0.2),
                  textDayHeaderFontSize: 12,
                  ...({
                    "stylesheet.day.basic": {
                      base: {
                        width: daySize,
                        height: daySize,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: Math.min(14, daySize * 0.25),
                        borderWidth: 1,
                        borderColor: themes.border,
                      },
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
                enableSwipeMonths={true}
                hideArrows={true}
                onMonthChange={(month) => {
                  if (month?.dateString) {
                    const d = new Date(month.dateString + "T00:00:00");
                    d.setDate(1);
                    setVisibleMonth(d.toISOString().split("T")[0]);
                  }
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
                      >
                        <Text style={styles.monthNavButtonText}>‹ Prev</Text>
                      </TouchableOpacity>
                      <Text style={styles.monthTitle}>{monthYear}</Text>
                      <TouchableOpacity
                        style={styles.monthNavButton}
                        onPress={goToNextMonth}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.monthNavButtonText}>Next ›</Text>
                      </TouchableOpacity>
                    </View>
                  );
                }}
                onDayPress={handleSelectDate}
              />
            </View>

            {renderActionButtons()}

            <View style={styles.scheduleContainer}>
              {(user?.role === UserRole.INSTRUCTOR && showAvailabilityManagement) ||
              (user?.role === UserRole.ADMIN && showAdminAvailabilityManagement) ? (
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
                            <TouchableOpacity>
                              <Text style={styles.actionButtonText}>
                                VIEW
                              </Text>
                            </TouchableOpacity>
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
                            <View style={styles.instructorFilterPickerWrap}>
                              <Picker
                                selectedValue={
                                  instructorFilterId ?? "all"
                                }
                                onValueChange={(value) =>
                                  setInstructorFilterId(
                                    value === "all" ? null : (value as number)
                                  )
                                }
                                style={styles.instructorFilterPicker}
                                dropdownIconColor={themes.vegasGold}
                              >
                                <Picker.Item
                                  label="All instructors"
                                  value="all"
                                />
                                {instructorsFromAvailability.map(({ id, name }) => (
                                  <Picker.Item
                                    key={id}
                                    label={name}
                                    value={id}
                                  />
                                ))}
                              </Picker>
                            </View>
                          </View>
                        )}
                        <Text style={styles.sectionSubtitle}>
                          {user?.role === UserRole.INSTRUCTOR
                            ? "Your Availability"
                            : user?.role === UserRole.ADMIN
                            ? "Company Availability"
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
                                  Available:{" "}
                                  {formatTimeString(availability.start_time)} -{" "}
                                  {formatTimeString(availability.end_time)}
                                </Text>
                                {availability.instructor_name && user?.role === UserRole.STUDENT && (
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

        {((user?.role === UserRole.INSTRUCTOR && canManageOwnAvailability) ||
          user?.role === UserRole.ADMIN) && (
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
          onReviewMaterials={handleReviewMaterials}
          onBeginSession={
            user?.role === UserRole.INSTRUCTOR ? handleBeginSession : undefined
          }
          onCheckIn={user?.role === UserRole.STUDENT ? handleCheckIn : undefined}
          isCancelling={isCancellingSession}
        />
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
