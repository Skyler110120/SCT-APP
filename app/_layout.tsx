import React from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import GlobalErrorReporter from '@/src/components/GlobalErrorReporter';
import { themes } from '@/src/context/themes';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
} from "@expo-google-fonts/oswald";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    // Backward compatibility aliases so existing style modules continue working.
    "Chakra-Regular": Inter_400Regular,
    "Chakra-Italic": Inter_400Regular,
    "Chakra-Bold": Oswald_600SemiBold,
    "Chakra-BoldItalic": Oswald_600SemiBold,
    "Chakra-semiBoldItalic": Inter_600SemiBold,
    "Chakra-Medium": Inter_500Medium,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={themes.vegasGold} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
          <Slot />
          <GlobalErrorReporter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
