import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { calendarScreenStyles } from "@/src/styles/calendarScreen";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { Calendar } from "react-native-calendars";
import { useState } from "react";
import { themes } from "@/src/context/themes";
import BottomNavBar from "@/src/components/NavBar";

interface Session {
  id: number;
  time: string;
  student: string;
  date: string;
}

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: themes.vegasGold,
    },
  };

  const sessions: Session[] = [
    {
      id: 1,
      time: "12:00 - 1:00 PM",
      student: "Alan Honor",
      date: "2025-06-24",
    },
    {
      id: 2,
      time: "3:00 - 4:00 PM",
      student: "Jeff Watts",
      date: "2025-06-24",
    },
    {
      id: 3,
      time: "4:00 - 5:00 PM",
      student: "Tim Hardy",
      date: "2025-06-24",
    },
    {
      id: 4,
      time: "5:00 - 6:00 PM",
      student: "Jim Hardy",
      date: "2025-06-24",
    },
  ];

  const sessionsForSelectedDate = sessions.filter(
    (sessions) => sessions.date === selectedDate
  );
  return (
    <View style={calendarScreenStyles.container}>
      <BackgroundGradient>
        <SafeAreaView style={calendarScreenStyles.safeArea}>
          <View style={calendarScreenStyles.calendarContainer}>
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
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
            />
          </View>
          <View style={calendarScreenStyles.scheduleContainer}>
            <Text style={calendarScreenStyles.scheduleText}>Schedule</Text>
            {sessionsForSelectedDate.length > 0 ? (
              <ScrollView>
                {sessionsForSelectedDate.map((session) => (
                  <View
                    key={session.id}
                    style={calendarScreenStyles.sessionCard}
                  >
                    <Text style={calendarScreenStyles.sessionText}>
                      {session.time} {session.student}
                    </Text>
                    <TouchableOpacity>
                      <Text>VIEW</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text>No sessions scheduled for this date</Text>
            )}
          </View>
        </SafeAreaView>
        <BottomNavBar />
      </BackgroundGradient>
    </View>
  );
}
