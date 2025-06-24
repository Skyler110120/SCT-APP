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
import { useRouter } from "expo-router";
import { themes } from "@/src/context/themes";
import Images from "@/src/assets/images";
import BottomNavBar from "@/src/components/NavBar";

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
                textDayFontSize: 14,
                textDayHeaderFontSize: 14,
                ...({
                  "stylesheet.day.basic": {
                    base: {
                      width: 70,
                      height: 70,
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  },
                } as any),
              }}
              onDayPress={(day) => {
                setSelectedDate(day.dateString);
              }}
            />
            <View>
              
            </View>
          </View>
        </SafeAreaView>
        <BottomNavBar/>
      </BackgroundGradient>
    </View>
  );
}
