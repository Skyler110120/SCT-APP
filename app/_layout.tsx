// app/_layout.tsx
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Chakra-Regular': require('../src/assets/fonts/ChakraPetch-Regular.ttf'),
    'Chakra-Italic': require('../src/assets/fonts/ChakraPetch-Italic.ttf'),
    'Chakra-Bold': require('../src/assets/fonts/ChakraPetch-Bold.ttf'),
    'Chakra-BoldItalic': require('../src/assets/fonts/ChakraPetch-BoldItalic.ttf'),
    'Chakra-semiBoldItalic': require('../src/assets/fonts/ChakraPetch-SemiBoldItalic.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />; // renders your actual pages (login, dashboard, etc.)
}
