import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import BottomNavBar from "@/src/components/NavBar";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { studentScreenStyles } from "@/src/styles/studentScreen";

export default function InstructorStudents() {
  return (
    <View style={studentScreenStyles.container}>
      <SafeAreaView style={studentScreenStyles.safeArea}>
        <BackgroundGradient>
          <Text>Students Screen</Text>
        </BackgroundGradient>
      </SafeAreaView>
      <BottomNavBar />
    </View>
  );
}
