import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { Text, View, ActivityIndicator } from "react-native";
import { useAuth } from '@/src/context/AuthContext';
import { themes } from '@/src/context/themes';

export default function RootIndex() {
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themes.black }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
        <Text style={{
            marginTop: 16,
            color: themes.white,
            fontSize: 16,
            fontFamily: 'Chakra-Regular'
        }}>
            Loading...
        </Text>
      </View>
    );
  }
  
  if (!isAuthenticated || !user) {
    console.log("Not authenticated, redirecting to welcom page")
    return <Redirect href="/welcome" />;
  }

  if (!user.has_completed_onboarding) {
    console.log("User exists but has not completed onboarding - this should not happen")
    return <Redirect href="/dashboard" />;
  }

  console.log("User authenticated and onboarded, redirection to dashboard")
    return <Redirect href="/dashboard" />;
}
