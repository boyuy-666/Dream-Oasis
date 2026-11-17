import {
  InstrumentSans_400Regular,
  InstrumentSans_500Medium,
  InstrumentSans_600SemiBold,
  InstrumentSans_700Bold,
} from '@expo-google-fonts/instrument-sans';
import { InstrumentSerif_400Regular, InstrumentSerif_400Regular_Italic, useFonts } from '@expo-google-fonts/instrument-serif';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DreamsProvider, useDreams } from '@/store/DreamsContext';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    InstrumentSans_400Regular,
    InstrumentSans_500Medium,
    InstrumentSans_600SemiBold,
    InstrumentSans_700Bold,
  });
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
      <Stack.Screen name="card/[id]" options={{ presentation: 'modal', contentStyle: { backgroundColor: colors.surface } }} />
      {/* Dream Calendar: opened from Collection (not a tab). */}
      <Stack.Screen name="calendar" />
      {/* Full-screen so unsaved edits are only left through guarded exits (Cancel / back). */}
      <Stack.Screen name="edit/[id]" options={{ presentation: 'fullScreenModal', gestureEnabled: false }} />
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
