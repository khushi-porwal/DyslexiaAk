import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function ReadingAssistantRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/main/solutions/writing");
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-[#F9D976] px-6">
      <ActivityIndicator size="large" color="#7D3C98" />
      <Text className="mt-3 text-base text-black">
        Loading the writing coach…
      </Text>
    </View>
  );
}
