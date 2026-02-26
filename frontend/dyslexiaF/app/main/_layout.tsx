// app/(main)/_layout.tsx
import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F9D976" }, // Matches your UI theme
      }}
    >
      <Stack.Screen name="HomeDashboard/index" />
      <Stack.Screen name="screening/index" />
      {/* <Stack.Screen name="solutions/index" />
      <Stack.Screen name="profile/index" /> */}
      
      {/* Extra hidden child pages */}
      {/* <Stack.Screen name="screening/phonological" />
      <Stack.Screen name="screening/greyReading" />
      <Stack.Screen name="screening/workingMemory" />
      <Stack.Screen name="screening/rapidWriting" />

      <Stack.Screen name="solutions/reading" />
      <Stack.Screen name="solutions/writing" />
      <Stack.Screen name="solutions/sequencing" />
      <Stack.Screen name="solutions/gamified" />

      <Stack.Screen name="profile/history" /> */}
    </Stack>
  );
}
