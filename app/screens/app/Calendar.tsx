import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Calendar } from "react-native-calendars";

import BackgroundGradient from "@/src/components/BackgroundGradient";
import BottomNavBar from "@/src/components/NavBar";
import InstructorAvailabilityModal from "@/src/components/instructor/instructorAvailability";
import CreateEventModal from "@/src/components/admin/CreateEventModal";

import { calendarScreenStyles as styles } from "@/src/styles/calendarScreen";
import { themes } from "@/src/context/themes";
import { useAuth } from "@/src/context/AuthContext";

import { eventService } from "@/src/services/eventService";
import { instructorAvailabilityService } from "@/src/services/instructorAvailabilityService";

import {
  CreateAvailabilityRequest,
  AvailabilityUpdate,
  Availability,
} from "@/src/types/availability.types";
import { Event, CreateEventRequest } from "@/src/types/event.types";
import { is } from "date-fns/locale";

interface Session {
  id: number;
  time: string;
  student: string;
  instructor: string;
  date: string;
}

export default function CalendarScreen() {
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [showAvailabilityManagement, setShowAvailabilityManagement] =
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

  const [showCreateEventModal, setShowCreateEventModal] =
    useState<boolean>(false);
  const [showAvailabilityModal, setShowAvailabilityModal] =
    useState<boolean>(false);
  const [availabilityModalMode, setAvailabilityModalMode] = useState<
    "create" | "edit" | "delete"
  >("create");

  const [error, setError] = useState<string | null>(null);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const promises = [];

      if (user?.company_id) {
        promises.push(loadEventsForDateRange());
      }

      if (user?.role === "instructor") {
        promises.push(loadMyAvailabilities());
      } else if (user?.role === "student" && user?.instructor_id) {
        promises.push(loadInstructorAvailabilities(user.instructor_id));
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
        0
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

  const loadInstructorAvailabilities = async (instructorId: number) => {
    try {
      const response =
        await instructorAvailabilityService.getAvailabilityForCalendar(
          instructorId
        );

      if (response.success && response.data) {
        setAvailabilities(response.data);
      } else {
        console.error(
          "Failed to load instructor availablities:",
          response.error
        );
      }
    } catch (error) {
      console.error("Error loading instructor availabilities:", error);
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

    if (user?.role !== "admin") {
      Alert.alert("Permission Denied", "Only admins can create events");
      return;
    }

    setShowCreateEventModal(true);
  };

  const handleManageAvailability = () => {
    if (user?.role !== "instructor") {
      Alert.alert(
        "Permission Denied",
        "Only instructors can manage availability"
      );
      return;
    }

    setShowAvailabilityManagement(true);
    setSelectedAvailabilityForActions(null);
  };

  const handleSelectAvailabilityForActions = (availability: Availability) => {
    if (selectedAvailabilityForActions?.id === availability.id) {
      setSelectedAvailabilityForActions(null);
    } else {
      setSelectedAvailabilityForActions(availability);
    }
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
      const response = await instructorAvailabilityService.createAvailability(
        availabilityData
      );

      if (response.success && response.data) {
        setAvailabilities((prev) => [...prev, response.data!]);
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
    const eventDate = new Date(event.start_time).toISOString().split("T")[0];
    return eventDate === selectedDate;
  });

  const selectedDateObject = new Date(selectedDate);
  const selectedDayOfWeek = selectedDateObject.getDay();
  const availabilitiesForSelectedDate = availabilities.filter(
    (availability) => availability.day_of_week === selectedDayOfWeek
  );

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  useEffect(() => {
    if (user && user.company_id) {
      loadEventsForDateRange();
    }
  }, [selectedDate, user]);

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: themes.vegasGold,
    },
  };

  const renderActionButtons = () => {
    const buttons = [];

    if (user?.role === "admin") {
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

    if (user?.role === "instructor") {
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

    if (buttons.length === 0) return null;

    return <View style={styles.buttonContainer}>{buttons}</View>;
  };

  const renderAvailabilityManagement = () => {
    return (
      <View>
        <Text style={styles.scheduleText}>Manage Availability</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddAvailability}
        >
          <Text style={styles.addButtonText}>+ Add Availability</Text>
        </TouchableOpacity>
        {availabilities.length > 0 ? (
          renderAvailabilityByDay()
        ) : (
          <Text style={styles.noAvailabilityText}>
            No availability set. Click "Add Availability" to create one.
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

    return (
      <View style={styles.weeklyScheduleContainer}>
        {dayOfWeek.map(({ day, name }) => {
          const dayAvailabilities = availabilities.filter(
            (availability) => availability.day_of_week === day
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
                      styles.compactAvailabilityCard,
                      selectedAvailabilityForActions?.id === availability.id &&
                        styles.availabilityCardSelected,
                    ]}
                    onPress={() =>
                      handleSelectAvailabilityForActions(availability)
                    }
                  >
                    <View style={styles.availabilityInfo}>
                      <Text style={styles.availabilityTimeText}>
                        {availability.start_time} - {availability.end_time}
                      </Text>
                      <Text style={styles.availabilityDateText}>
                        {availability.start_date}
                        {availability.end_date &&
                          ` to ${availability.end_date}`}
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

  const sessions: Session[] = [
    {
      id: 1,
      time: "12:00 - 1:00 PM",
      student: "Alan Honor",
      instructor: "John Doe",
      date: "2025-06-24",
    },
    {
      id: 2,
      time: "3:00 - 4:00 PM",
      student: "Jeff Watts",
      instructor: "John Doe",
      date: "2025-06-24",
    },
    {
      id: 3,
      time: "4:00 - 5:00 PM",
      student: "Tim Hardy",
      instructor: "John Doe",
      date: "2025-06-24",
    },
    {
      id: 4,
      time: "5:00 - 6:00 PM",
      student: "Jim Hardy",
      instructor: "John Doe",
      date: "2025-06-24",
    },
  ];

  const sessionsForSelectedDate = sessions.filter(
    (sessions) => sessions.date === selectedDate
  );

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
          <View style={styles.calendarContainer}>
            <Calendar
              current={selectedDate}
              markingType={"custom"}
              markedDates={{
                [selectedDate]: {
                  selected: true,
                },
              }}
              theme={{
                calendarBackground: "transparent",
                textSectionTitleColor: themes.vegasGold,
                selectedDayBackgroundColor: themes.vegasGold,
                selectedDayTextColor: themes.black,
                todayTextColor: themes.vegasGold,
                dayTextColor: themes.vegasGold,
                textDisabledColor: themes.white,
                monthTextColor: themes.vegasGold,
                arrowColor: themes.vegasGold,
                textMonthFontSize: 48,
                textDayFontSize: 16,
                textDayHeaderFontSize: 16,
                ...({
                  "stylesheet.day.basic": {
                    base: {
                      width: 70,
                      height: 70,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: themes.white,
                    },
                  },
                } as any),
                ...({
                  "stylesheet.day.header": {
                    base: {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingHorizontal: 20,
                      color: themes.white,
                    },
                  },
                } as any),
              }}
              onDayPress={handleSelectDate}
            />
          </View>

          {renderActionButtons()}

          <View style={styles.scheduleContainer}>
            <ScrollView>
              {user?.role === "instructor" && showAvailabilityManagement ? (
                renderAvailabilityManagement()
              ) : (
                <>
                  <Text style={styles.scheduleText}>Schedule</Text>

                  {eventsForSelectedDate.length > 0 && (
                    <>
                      <Text style={styles.sectionSubtitle}>Events</Text>
                      {eventsForSelectedDate.map((event) => (
                        <View key={event.id} style={styles.sessionCard}>
                          <View>
                            <Text style={styles.sessionText}>
                              {event.title}
                            </Text>
                            <Text style={styles.availabilityTimeText}>
                              {new Date(event.start_time).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {new Date(event.end_time).toLocaleString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                  {sessionsForSelectedDate.length > 0 && (
                    <>
                      <Text style={styles.sectionSubtitle}>Sessions</Text>
                      {sessionsForSelectedDate.map((session) => (
                        <View key={session.id} style={styles.sessionCard}>
                          <Text style={styles.sessionText}>
                            {user?.role === "instructor" ? (
                              <Text>
                                {session.time} with {session.student}
                              </Text>
                            ) : (
                              <Text>
                                {session.time} with {session.instructor}
                              </Text>
                            )}
                          </Text>
                          <TouchableOpacity>
                            <Text style={styles.actionButtonText}>VIEW</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </>
                  )}

                  {availabilities.length > 0 && (
                    <>
                      <Text style={styles.sectionSubtitle}>
                        {user?.role === "instructor"
                          ? "Your Availability"
                          : "Instructor's Availability"}
                      </Text>
                      {availabilitiesForSelectedDate.length > 0 ? (
                        availabilitiesForSelectedDate.map((availability) => (
                          <View
                            key={availability.id}
                            style={styles.sessionCard}
                          >
                            <Text style={styles.sessionText}>
                              Available: {availability.start_time} -{" "}
                              {availability.end_time}
                            </Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.noAvailabilityText}>
                          No availability for{" "}
                          {
                            [
                              "Sunday",
                              "Monday",
                              "Tuesday",
                              "Wednesday",
                              "Thursday",
                              "Friday",
                              "Saturday",
                            ][selectedDayOfWeek]
                          }
                        </Text>
                      )}
                      {user?.role === "instructor" && (
                        <Text style={styles.hintText}>
                          Click "Manage Availability" to see your full weekly
                          scheudle
                        </Text>
                      )}
                    </>
                  )}

                  {eventsForSelectedDate.length === 0 &&
                    sessionsForSelectedDate.length === 0 &&
                    availabilitiesForSelectedDate.length === 0 && (
                      <Text style={styles.noAvailabilityText}>
                        No schedule items for this date.
                      </Text>
                    )}
                </>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>

        {user?.role === "admin" && (
          <CreateEventModal
            visible={showCreateEventModal}
            isSubmitting={isSubmittingEvent}
            selectedDate={`${selectedDate}T09:00:00.000Z`}
            onClose={() => setShowCreateEventModal(false)}
            onSubmit={handleCreateEventSubmit}
          />
        )}

        {user?.role === "instructor" && (
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
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
