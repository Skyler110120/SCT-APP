import React from "react";
import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import BottomNavBar from "@/src/components/NavBar";
import BackgroundGradient from "@/src/components/BackgroundGradient";
import { profileScreenStyles } from "@/src/styles/profileScreen";

export default function ProfileScreen() {
    return (
        <View style={profileScreenStyles.container}>
            <SafeAreaView style={profileScreenStyles.safeArea}>
                <BackgroundGradient>
                    <Text>Profile Screen</Text>
                </BackgroundGradient>
            </SafeAreaView>
            <BottomNavBar />
        </View>
    )
}