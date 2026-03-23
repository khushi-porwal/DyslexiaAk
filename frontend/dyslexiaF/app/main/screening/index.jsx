import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getScreeningProgress } from "../../../constants/progressStorage";

export default function ScreeningTest() {
  const router = useRouter();
  const [hasProgress, setHasProgress] = useState(false);

  // Refresh progress availability each time we land on this screen
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        const progress = await getScreeningProgress();
        if (isActive) {
          setHasProgress(Object.keys(progress || {}).length > 0);
        }
      })();
      return () => {
        isActive = false;
      };
    }, [])
  );

  // When leaving this screen (Expo Router hides it with aria-hidden), blur any focused element
  // to avoid "aria-hidden ancestor retains focus" warnings on web.
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (typeof document !== "undefined") {
          const active = document.activeElement;
          if (active && typeof active.blur === "function") {
            active.blur();
          }
        }
      };
    }, [])
  );

  return (
    <View className="flex-1 bg-[#9CD67D] px-5 pt-12">
      
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>

        <Text className="text-xl font-bold text-gray-800">
          Screening Test
        </Text>

        <TouchableOpacity>
          <Ionicons name="person-circle-outline" size={28} color="#1F2937" />
        </TouchableOpacity>
      </View>

      {/* Owl Section */}
      <View className="rounded-3xl   items-center">
        <Image
          source={require("../../../assets/images/Owls.png")}
          className="w-64 h-28"
          resizeMode="contain"
        />
      </View>
      <View className="items-center   mb-8">
        <Image
          source={require("../../../assets/images/lines.png")}
        />
      </View>

      {/* Test Cards - Row 1 */}
      <View className="flex-row justify-between mb-6">
        <TestCard
          title="Phonological Awareness Test"
          icon="volume-high-outline"
          onPress={() => router.push("/main/screening/phonological")}
        />
        <TestCard
          title="Grey Oral Reading Test"
          icon="apps-outline"
          onPress={() => router.push("/main/screening/greyReading")}
        />
      </View>

      {/* Test Cards - Row 2 */}
      <View className="flex-row justify-between">
        <TestCard
          title="Working Memory Test"
          icon="bulb-outline"
          onPress={() => router.push("/main/screening/workingMemory")}
        />
        <TestCard
          title="Rapid Automated Writing"
          icon="text-outline"
          onPress={() => router.push("/main/screening/rapid-automation")}
        />
      </View>

      {hasProgress && (
        <TouchableOpacity
          onPress={() => router.push("/main/screening/progress-report")}
          className="mt-8 bg-white flex-row items-center justify-center rounded-2xl py-4 px-4 shadow-md border border-green-200"
        >
          <Ionicons name="stats-chart" size={22} color="#1F2937" />
          <Text className="text-base font-semibold text-gray-800 ml-2">
            View Progress Report
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* 🔹 Reusable Test Card */
function TestCard({ title, icon, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      focusable={Platform.OS !== "web"} // prevent lingering web focus when the screen gets hidden
      tabIndex={Platform.OS === "web" ? -1 : undefined}
      className="
        bg-white
        w-[48%]
        h-40
        rounded-2xl
        px-3
        py-6
        items-center
        justify-center
        shadow-md
      "
    >
      <Ionicons name={icon} size={32} color="#6C63FF" />

      <Text
        className="text-center text-gray-700 mt-4 font-medium text-sm"
        numberOfLines={2}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
