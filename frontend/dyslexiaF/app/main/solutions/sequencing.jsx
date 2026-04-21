import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../api/axios";

const samplePrompts = [
  {
    id: "1",
    title: "Morning Routine",
    steps: ["Brush your teeth", "Wash your face", "Comb your hair"],
    image: require("../../../assets/images/owl.png"),
  },
  {
    id: "2",
    title: "Classroom Task",
    steps: ["Pick the blue book", "Open page 5", "Underline the title"],
    image: require("../../../assets/images/phonological.png"),
  },
  {
    id: "3",
    title: "Outdoor Play",
    steps: ["Step forward", "Turn left", "Take three small steps"],
    image: require("../../../assets/images/dog.png"),
  },
];

export default function Sequencing() {
  const router = useRouter();
  const [activePrompt, setActivePrompt] = useState(samplePrompts[0]);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setCurrentStep(0);
    Speech.stop();
    persistEvent("started", 0, activePrompt);
  }, [activePrompt]);

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const persistEvent = async (action = "step", idx = currentStep, prompt = activePrompt) => {
    try {
      await API.post(
        "/api/sequencing/log",
        {
          routineTitle: prompt?.title,
          steps: prompt?.steps || [],
          currentStepIndex: idx,
          action,
        },
        { headers: await getAuthHeader() }
      );
    } catch (e) {
      console.log("Sequencing log failed:", e?.message || e);
    }
  };

  const speakStep = (idx = currentStep) => {
    const step = activePrompt.steps[idx];
    if (!step) return;
    Speech.stop();
    Speech.speak(step, { rate: 0.98, pitch: 1.05 });
  };

  const speakAll = () => {
    Speech.stop();
    Speech.speak(activePrompt.steps.join(". "), { rate: 0.98, pitch: 1.05 });
  };

  const nextStep = () => {
    const next = (currentStep + 1) % activePrompt.steps.length;
    setCurrentStep(next);
    speakStep(next);
    persistEvent("step", next);
  };

  const markStep = (idx) => {
    setCurrentStep(idx);
    speakStep(idx);
    persistEvent("step", idx);
  };

  const completeStep = () => {
    setFeedback("👍 Great job!");
    persistEvent("completed", currentStep);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#B8F26C]">
      <StatusBar style="dark" backgroundColor="#B8F26C" />
      <LinearGradient colors={["#D3FF8A", "#9FE85C"]} style={{ flex: 1 }}>
        <View className="flex-1 px-5 pt-4 pb-6" style={{ gap: 10 }}>
          {/* Top bar */}
          <View className="flex-row justify-between items-center">
           <TouchableOpacity onPress={()=>router.back("/HomeDashboard/index")} activeOpacity={0.8}>
          <LinearGradient
            colors={["#FFFFFF", "#EDE5FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 40,
              height: 40,
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
            <TouchableOpacity 
            onPress={() => router.push("/main/profile")}
            className="w-10 h-10 rounded-full items-center justify-center">
              <Ionicons name="person" size={30} color="#2f0a44" />
            </TouchableOpacity>
          </View>

          <Text className="text-[26px] font-extrabold text-center text-[#2f0a44]">
            Sequencing Assistant
          </Text>

          {/* Instruction card */}
          <View className="bg-white/95 rounded-3xl p-4 shadow-lg" style={{ gap: 6 }}>
            <Text className="text-lg font-semibold text-[#2f0a44] mb-2">
              Why this helps
            </Text>
            <Text className="text-sm text-[#3c2d57] leading-5">
              Dyslexic learners often struggle to follow multi-step directions.
              Practicing clear, short, ordered instructions builds working
              memory and confidence. Tap a routine, listen, and act each step
              in order.
            </Text>
          </View>

          {/* Prompt selector */}
          <View style={{ marginTop: 4 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingVertical: 4 }}
              contentContainerStyle={{
                columnGap: 12,
                paddingHorizontal: 6,
                paddingVertical: 6,
              }}
            >
              {samplePrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt.id}
                  onPress={() => setActivePrompt(prompt)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      activePrompt.id === prompt.id
                        ? ["#8E5CFF", "#6E3BCF"]
                        : ["#BFA6FF", "#9C7EF5"]
                    }
                    style={{
                      borderRadius: 20,
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      minWidth: 190,
                    }}
                  >
                    <Text className="text-white font-semibold text-base">
                      {prompt.title}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Steps box */}
          <View className="bg-white/95 rounded-3xl p-4 shadow-lg flex-row">
            <View style={{ flex: 1, rowGap: 10 }}>
              <View className="items-center">
                <Image
                  source={activePrompt.image}
                  className="w-32 h-32"
                  resizeMode="contain"
                />
              </View>
              {!!feedback && (
                <View className="flex-row items-center justify-center">
                  <Text className="text-base font-semibold text-[#2f0a44]">
                    {feedback}
                  </Text>
                </View>
              )}
              {activePrompt.steps.map((step, idx) => (
                <TouchableOpacity
                  key={`${activePrompt.id}-${idx}`}
                  onPress={() => markStep(idx)}
                  activeOpacity={0.8}
                  className="flex-row items-center"
                  style={{ gap: 10 }}
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-3"
                    style={{
                      backgroundColor:
                        currentStep === idx ? "#7D3BCF" : "#BFA6FF",
                    }}
                  >
                    <Text className="text-white font-bold">{idx + 1}</Text>
                  </View>
                  <Text
                    className="text-base text-[#2f0a44] flex-1"
                    style={{
                      fontWeight: currentStep === idx ? "700" : "400",
                    }}
                  >
                    {step}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="justify-between items-center ml-3 py-2" style={{ rowGap: 14 }}>
              <TouchableOpacity onPress={speakAll} activeOpacity={0.85}>
                <View className="w-12 h-12 rounded-full bg-[#A86DFC] items-center justify-center shadow-sm">
                  <MaterialCommunityIcons
                    name="volume-high"
                    size={22}
                    color="#fff"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextStep} activeOpacity={0.85}>
                <View className="w-12 h-12 rounded-full bg-[#7D3BCF] items-center justify-center shadow-sm">
                  <MaterialCommunityIcons
                    name="gesture-tap"
                    size={22}
                    color="#fff"
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={completeStep} activeOpacity={0.85}>
                <View className="w-12 h-12 rounded-full bg-[#A86DFC] items-center justify-center shadow-sm">
                  <MaterialCommunityIcons
                    name="check"
                    size={22}
                    color="#fff"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Practice tips */}
          <View className="bg-white/90 rounded-2xl p-4 shadow" style={{ gap: 8 }}>
            <Text className="text-base font-semibold text-[#2f0a44] mb-2">
              Practice ideas
            </Text>
            <Text className="text-sm text-[#3c2d57] leading-5">
              {"\u2022"} Keep sentences short (1 action at a time).{"\n"}
              {"\u2022"} Pair steps with gestures (point, tap, show).{"\n"}
              {"\u2022"} Let the child repeat each step before doing it.{"\n"}
              {"\u2022"} Celebrate completion of the full sequence!
            </Text>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
