import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function HomeModal() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text className="text-xl font-bold text-black mb-4">
        Home Dashboard Modal
      </Text>
      <Text className="text-center text-gray-700 mb-6">
        This is a placeholder modal screen. Replace with your content or remove
        the file if you don&apos;t need it.
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        className="flex-row items-center bg-black px-4 py-3 rounded-xl"
      >
        <Ionicons name="close" size={20} color="white" />
        <Text className="text-white ml-2 font-semibold">Close</Text>
      </TouchableOpacity>
    </View>
  );
}
