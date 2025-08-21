import React from 'react';
import { Slot, Redirect } from 'expo-router';
import { View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { themes } from '@/src/context/themes';

export default function AppLayout() {
  const { user, isLoading } = useAuth();
  
  console.log('App Layout - Authentication Check for:', user?.email);

  if (isLoading) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: themes.black,
      }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
        <Text style={{
          marginTop: 16,
          color: themes.white,
          fontSize: 16,
          fontFamily: 'Chakra-Regular',
        }}>
          Loading application...
        </Text>
      </View>
    );
  }

  if (!user) {
    console.log('App Layout: No authenticated user, redirecting to login');
    return <Redirect href="/login" />;
  }

  console.log('App Layout: Authenticated user, allowing access to app');

  return (
    <View style={{ flex: 1 }}>
      <Slot />
    </View>
  );
}
