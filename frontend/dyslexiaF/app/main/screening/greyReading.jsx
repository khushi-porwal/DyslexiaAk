import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import API from "../../api/axios";
import { saveScreeningResult } from "../../../constants/progressStorage";
import { useRouter } from "expo-router";
export default function GreyReadingScreen({ navigation }) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const router = useRouter();
  
   
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => interval && clearInterval(interval);
  }, [isRunning]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return { m, s };
  };

  const { m, s } = formatTime(seconds);

  const handleFinish = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");

      if (!storedToken) {
        console.log("Token missing — login again");
        return;
      }

      if (seconds === 0) return;

      setIsRunning(false);

      const res = await API.post(
        "/api/history",
        {
          activityType: "grey_reading",
          duration: seconds,
        },
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      console.log("Saved:", res.data);

      await saveScreeningResult("grey_reading", {
        duration: seconds,
      });
    } catch (error) {
      console.log("API error:", error.response?.data || error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#DDA6F6]">
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full px-5 pt-4">

          {/* 🔥 HEADER */}
          <View className="flex-row justify-between items-center">
            
            {/* Back */}
            <TouchableOpacity
             onPress={()=>router.back("/index")}  activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FFFFFF", "#EDE5FF"]}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 6,
                }}
              >
                <Ionicons name="chevron-back" size={24} color="#2B0F4A" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              onPress={() => router.push("/profile/index")}
            >
              <Ionicons name="person" size={30} color="purple" />
            </TouchableOpacity>

          </View>
        </View>

        {/* Title */}
        <Text className="text-3xl font-bold text-black text-center mt-4">
          Grey Oral Test
        </Text>

        {/* Image */}
        <View className="mt-6 w-[85%] h-[190px] items-center justify-center">
          <Image
            source={require("../../../assets/images/girl.png")}
            className="w-80 h-80"
    resizeMode="contain"
          />
        </View>

        {/* Subtitle */}
        <Text className="mt-5 text-[16px] font-bold text-black">
          Read the above written text
        </Text>

        {/* Poem */}
        <View className="mt-3 w-[92%]">
          <Text className="text-[14px] text-center leading-[18px] text-black">
            Twinkle, twinkle, little star,{"\n"}
            Up above, so bright and far,{"\n"}
            Winking softly in the night,{"\n"}
            <Text className="text-blue-600 font-bold">Sprinkling</Text> the sky
            with your light.{"\n"}
            You guide the ships and make them sail,{"\n"}
            Through every storm, wind, and gale.{"\n"}
            With a <Text className="text-blue-600 font-bold">sparkle</Text>, near
            or far,{"\n"}
            You're the brightest little star!
          </Text>
        </View>

        {/* Timer */}
        <View className="mt-5 w-[200px] h-[60px] bg-[#EED9F7] rounded-[10px] items-center justify-center">
          <View className="w-[160px] h-[40px] bg-white rounded-md border border-[#CFA5E3] flex-row items-center justify-center">
            <Text className="text-[18px] font-extrabold">{m}</Text>
            <Text className="text-[18px] font-extrabold"> : </Text>
            <Text className="text-[18px] font-extrabold">{s}</Text>
          </View>
        </View>

        <Text className="mt-3 text-[16px] font-extrabold text-black">
          Time Taken
        </Text>

        {/* Buttons */}
        <View className="flex-row mt-4 space-x-3">
          <TouchableOpacity
            className="bg-black px-6 py-3 rounded-xl mr-3"
            onPress={() => setIsRunning((prev) => !prev)}
          >
            <Text className="text-white font-bold">
              {isRunning ? "Pause" : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white px-6 py-3 rounded-xl border border-black"
            onPress={() => {
              setIsRunning(false);
              setSeconds(0);
            }}
          >
            <Text className="text-black font-bold">Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Finish */}
        <TouchableOpacity
          className="bg-black px-10 py-3 rounded-xl mt-6"
          onPress={handleFinish}
        >
          <Text className="text-white font-bold">Finish Test</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}