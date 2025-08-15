import { useEffect } from 'react';
import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/admin-login" />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* Ensure system status bar is visible and readable over light backgrounds */}
      <StatusBar style="dark" backgroundColor="#FFFFFF" hidden={false} />
    </>
  );
}