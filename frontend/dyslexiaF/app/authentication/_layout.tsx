import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="authentication/login" />
      <Stack.Screen name="authentication/signup" />
    </Stack>
  );
}
