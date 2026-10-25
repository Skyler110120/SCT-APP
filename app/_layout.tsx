import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { View, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from '@/src/context/AuthContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import GlobalErrorReporter from '@/src/components/GlobalErrorReporter';
import { themes } from '@/src/context/themes';
import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_600SemiBold,
  Archivo_700Bold,
} from "@expo-google-fonts/archivo";
import {
  ArchivoNarrow_500Medium,
  ArchivoNarrow_600SemiBold,
  ArchivoNarrow_700Bold,
} from "@expo-google-fonts/archivo-narrow";

if (!__DEV__) {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    Archivo_700Bold,
    ArchivoNarrow_500Medium,
    ArchivoNarrow_600SemiBold,
    ArchivoNarrow_700Bold,
  });

  // Older builds persisted the full signup form, including the plaintext password, under this key.
  useEffect(() => {
    AsyncStorage.removeItem('onboarding_registrationData').catch(() => {});
  }, []);

  // iOS keeps the Stripe in-app browser on top when its page deep-links back into the app.
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    const subscription = Linking.addEventListener('url', () => {
      WebBrowser.dismissBrowser()?.catch(() => {});
    });
    return () => subscription.remove();
  }, []);

  // If a font fails to load, carry on with system fonts rather than spinning forever.
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themes.background }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={themes.vegasGold} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <StatusBar style="light" />
      <AuthProvider>
          <Slot />
          <GlobalErrorReporter />
      </AuthProvider>
    </ErrorBoundary>
  );
}
