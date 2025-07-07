import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { Text, View, ActivityIndicator } from "react-native";
import { useAuth } from '@/src/context/AuthContext';
import { themes } from '@/src/context/themes';
import { navigateByRole } from '@/src/utils/navigationUtil';

export default function Index() {
  const { isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user){
      navigateByRole(
        user.role, 
        user.hasCompletedOnboarding ?? false
      );
    }
  }, [isLoading, isAuthenticated])

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themes.white }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
      </View>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect href="/screens/auth/Dashboard" />;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themes.white }}>
      <ActivityIndicator size="large" color={themes.vegasGold} />
      <Text style={{ marginTop: 10 }}>Preparing your dashboard...</Text>
    </View>
  )
}
