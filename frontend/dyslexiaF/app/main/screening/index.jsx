import { View, Text, TouchableOpacity, Image, Platform } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={()=>router.back("/HomeDashboard/index")} activeOpacity={0.8}>
          <LinearGradient
            colors={["#FFFFFF", "#EDE5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#3A175A",
              shadowOpacity: 0.18,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#2B0F4A" />
          </LinearGradient>
        </TouchableOpacity>


        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="person" size={30} color="green" />
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-center text-gray-800">
        Screening Test
      </Text>



      {/* Owl Section */}
      <View className="rounded-3xl items-center justify-center">
        <Image
          source={require("../../../assets/images/Owls.png")}
          className="w-[350px] h-[260px]"
          resizeMode="contain"
        />
      </View>
      <View className="items-center mt-[-40] mb-4">
  <Image
    source={require("../../../assets/images/lines.png")}
    className="w-50 h-30"
    resizeMode="contain"
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
