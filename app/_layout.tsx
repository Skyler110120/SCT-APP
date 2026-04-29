import React from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider } from '@/src/context/AuthContext';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import GlobalErrorReporter from '@/src/components/GlobalErrorReporter';
import { themes } from '@/src/context/themes';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Chakra-Regular': require('../src/assets/fonts/chakra-petch-regular.ttf'),
    'Chakra-Italic': require('../src/assets/fonts/chakra-petch-italic.ttf'),
    'Chakra-Bold': require('../src/assets/fonts/chakra-petch-bold.ttf'),
    'Chakra-BoldItalic': require('../src/assets/fonts/chakra-petch-bold-italic.ttf'),
    'Chakra-semiBoldItalic': require('../src/assets/fonts/chakra-petch-semi-bold-italic.ttf'),
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
