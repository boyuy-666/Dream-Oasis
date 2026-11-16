import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/theme';

const icon = (glyph: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={[styles.icon, { opacity: focused ? 1 : 0.45 }]}>{glyph}</Text>;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: { backgroundColor: 'rgba(11,7,32,0.96)', borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, letterSpacing: 0.4 },
        sceneStyle: { backgroundColor: colors.midnight },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: icon('🌙') }} />
      <Tabs.Screen name="record" options={{ title: 'Record', tabBarIcon: icon('✍️') }} />
      <Tabs.Screen name="collection" options={{ title: 'Collection', tabBarIcon: icon('🃏') }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({ icon: { fontSize: 20 } });
