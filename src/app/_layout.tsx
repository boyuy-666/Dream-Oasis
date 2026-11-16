import {
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  useFonts,
} from '@expo-google-fonts/cormorant-garamond';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DreamsProvider, useDreams } from '@/store/DreamsContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const [fontsLoaded, fontError] = useFonts({ CormorantGaramond_600SemiBold, CormorantGaramond_500Medium_Italic });
  const { ready } = useDreams();
  const done = (fontsLoaded || !!fontError) && ready;

  useEffect(() => {
    if (done) SplashScreen.hideAsync().catch(() => {});
  }, [done]);

  if (!done) return null;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="reveal/[id]" options={{ animation: 'fade', presentation: 'fullScreenModal', gestureEnabled: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <DreamsProvider>
        <Shell />
      </DreamsProvider>
    </SafeAreaProvider>
  );
}
