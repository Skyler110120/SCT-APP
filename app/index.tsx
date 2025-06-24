import React from 'react';
import { Redirect } from 'expo-router';
import { Text, View, Button, ActivityIndicator } from "react-native";
import { useAuth } from '@/src/context/AuthContext';
import { themes } from '@/src/context/themes';
export default function Index() {
  const { state } = useAuth();

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themes.white }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
      </View>
    );
  }
  
  if (state.isAuthenticated) {
    return <Redirect href="/screens/app/Home" />;
  } else {
    return <Redirect href="/screens/auth/Dashboard" />;
  }
}
