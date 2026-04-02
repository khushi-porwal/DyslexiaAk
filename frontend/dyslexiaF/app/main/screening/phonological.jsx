import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Image,
} from "react-native";
import axios from "../../api/axios";
import { Ionicons } from "@expo/vector-icons";
import { saveScreeningResult } from "../../../constants/progressStorage";
import { TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function PhonologicalTest() {
  // ✅ IMPORTANT:
  // Android Emulator => http://10.0.2.2:5000
  // iOS Simulator => http://localhost:5000
  // Real device => use laptop IP like http://192.168.1.10:5000
  const API_URL = "/api/phonological/submit";

  const [step, setStep] = useState(1);

  // TASK 1
  const baseWord = "bat";
  const rhymeWords = ["cat", "sun", "hat", "dog", "mat", "pen"];
  const [selectedWords, setSelectedWords] = useState([]);

  const router = useRouter();
  
  const toggleWord = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter((w) => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  // TASK 2
  const syllableQuestionWord = "elephant";
  const [syllableCount, setSyllableCount] = useState("");

  // TASK 3
  const letterQuestionWord = "education";
  const [letterCount, setLetterCount] = useState("");

  // TASK 4
  const firstSoundWord = "sun";
  const [firstSound, setFirstSound] = useState("");

  // TASK 5
  const lastSoundWord = "fish";
  const [lastSound, setLastSound] = useState("");

  // TASK 6
  const blendPrompt = "/d/ /o/ /g/";
  const [blendedWord, setBlendedWord] = useState("");

  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  const totalSteps = 6;

  const progressText = useMemo(() => `${step}/${totalSteps}`, [step]);
  const progressPercent = useMemo(
    () => Math.round((step / totalSteps) * 100),
    [step]
  );

  // ✅ Step validation (strong)
  const validateCurrentStep = () => {
    if (step === 1) {
      if (!selectedWords || selectedWords.length === 0) {
        Alert.alert("Task 1", "Please select at least 1 word.");
        return false;
      }
    }

    if (step === 2) {
      const val = syllableCount?.trim();
      if (!val) {
        Alert.alert("Task 2", "Please enter syllable count.");
        return false;
      }
      if (isNaN(Number(val))) {
        Alert.alert("Task 2", "Please enter a valid number.");
        return false;
      }
    }

    if (step === 3) {
      const val = letterCount?.trim();
      if (!val) {
        Alert.alert("Task 3", "Please enter letter count.");
        return false;
      }
      if (isNaN(Number(val))) {
        Alert.alert("Task 3", "Please enter a valid number.");
        return false;
      }
    }

    if (step === 4) {
      if (!firstSound || !firstSound.trim()) {
        Alert.alert("Task 4", "Please enter the first sound.");
        return false;
      }
    }

    if (step === 5) {
      if (!lastSound || !lastSound.trim()) {
        Alert.alert("Task 5", "Please enter the last sound.");
        return false;
      }
    }

    if (step === 6) {
      if (!blendedWord || !blendedWord.trim()) {
        Alert.alert("Task 6", "Please enter the blended word.");
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    try {
      setLoading(true);

      const payload = {
        selectedWords,
        syllableCount: Number(syllableCount.trim()),
        letterCount: Number(letterCount.trim()),
        firstSound: firstSound.trim().toLowerCase(),
        lastSound: lastSound.trim().toLowerCase(),
        blendedWord: blendedWord.trim().toLowerCase(),
      };

      const response = await axios.post(API_URL, payload);

      const finalScore = response.data.score;
      setScore(finalScore);

      await saveScreeningResult("phonological", {
        score: finalScore,
        totalTasks: totalSteps,
      });

      Alert.alert("✅ Test Completed", `Your Score: ${finalScore}`);
    } catch (error) {
      console.log("❌ Submit Error:", error?.response?.data || error.message);

      Alert.alert(
        "Submit Failed",
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetTest = () => {
    setStep(1);
    setSelectedWords([]);
    setSyllableCount("");
    setLetterCount("");
    setFirstSound("");
    setLastSound("");
    setBlendedWord("");
    setScore(null);
  };

  // ✅ Reusable styles
  const Card = ({ children }) => (
    <View className="bg-white rounded-3xl p-5 shadow-lg border border-pink-100">
      {children}
    </View>
  );

  const PrimaryBtn = ({
    title,
    onPress,
    disabled,
    color = "bg-purple-600",
  }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`py-4 rounded-2xl items-center ${
        disabled ? "bg-gray-400" : color
      }`}
    >
      <Text className="text-white font-bold text-lg">{title}</Text>
    </Pressable>
  );

  return (
    <ScrollView className="flex-1 bg-pink-200">
      {/* ✅ TOP HEADER (Back + Title + Profile) */}
       <View className="px-5 pt-10 pb-4">
        <View className="flex-row justify-between items-center">
          {/* Back */}
          <TouchableOpacity onPress={()=>router.back("/index")} activeOpacity={0.8}>
            <LinearGradient
              colors={["#FFFFFF", "#EDE5FF"]}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                elevation: 6,
              }}
            >
              <Ionicons name="chevron-back" size={24} color="#2B0F4A" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Title */}
          

          {/* Profile */}
          <TouchableOpacity>
            <Ionicons name="person" size={30} color="purple" />
          </TouchableOpacity>
        </View>


        <View className="items-center">
            <Text className="text-2xl font-extrabold text-purple-900">
              Phonological Test
            </Text>
            <Text className="text-purple-700 text-lg font-semibold">
              {progressText} ({progressPercent}%)
            </Text>
          </View>
        {/* ✅ Progress Bar */}
        <View className="w-full h-3 bg-pink-100 rounded-full mt-4 overflow-hidden">
          <View
            style={{ width: `${progressPercent}%` }}
            className="h-3 bg-purple-600 rounded-full"
          />
        </View>
      </View>

      
      {/* ✅ Image */}
      <View className="px-5 mb-6">
        <View className="items-center">
          <Image
            source={require("../../../assets/images/phonological.png")}
            className="w-50 h-30"
    resizeMode="contain"
          />
          <Text className="mt-2 text-gray-600 text-center">
            Answer each task carefully ✅
          </Text>
        </View>
      </View>

      {/* ✅ Main Container */}
      <View className="px-5 pb-10">
        {/* STEP 1 */}
        {step === 1 && (
          <Card>
            <Text className="text-lg font-bold text-purple-900">
              Task 1: Rhyming Words
            </Text>
            <Text className="text-gray-600 mt-1 mb-4">
              Select all words that rhyme with{" "}
              <Text className="font-bold">“{baseWord}”</Text>
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {rhymeWords.map((word) => {
                const isSelected = selectedWords.includes(word);
                return (
                  <Pressable
                    key={word}
                    onPress={() => toggleWord(word)}
                    className={`w-[30%] py-3 mb-3 rounded-2xl items-center border ${
                      isSelected
                        ? "bg-green-200 border-green-400"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text className="text-base font-semibold text-gray-800">
                      {word}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Card>
            <Text className="text-lg font-bold text-purple-900">
              Task 2: Syllable Count
            </Text>
            <Text className="text-gray-600 mt-2 mb-4">
              How many syllables are in the word{" "}
              <Text className="font-bold">“{syllableQuestionWord}”</Text>?
            </Text>

            <TextInput
              value={syllableCount}
              onChangeText={setSyllableCount}
              keyboardType="numeric"
              placeholder="Enter number (ex: 3)"
              className="bg-gray-50 px-4 py-4 rounded-2xl border border-gray-200 text-base"
            />
          </Card>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Card>
            <Text className="text-lg font-bold text-purple-900">
              Task 3: Letter Count
            </Text>
            <Text className="text-gray-600 mt-2 mb-4">
              How many letters are in the word{" "}
              <Text className="font-bold">“{letterQuestionWord}”</Text>?
            </Text>

            <TextInput
              value={letterCount}
              onChangeText={setLetterCount}
              keyboardType="numeric"
              placeholder="Enter number"
              className="bg-gray-50 px-4 py-4 rounded-2xl border border-gray-200 text-base"
            />
          </Card>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <Card>
            <Text className="text-lg font-bold text-purple-900">
              Task 4: First Sound
            </Text>
            <Text className="text-gray-600 mt-2 mb-4">
              What is the FIRST sound in the word{" "}
              <Text className="font-bold">“{firstSoundWord}”</Text>?
            </Text>

            <TextInput
              value={firstSound}
              onChangeText={setFirstSound}
              placeholder="Example: s"
              className="bg-gray-50 px-4 py-4 rounded-2xl border border-gray-200 text-base"
            />
          </Card>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <Card>
            <Text className="text-lg font-bold text-purple-900">
              Task 5: Last Sound
            </Text>
            <Text className="text-gray-600 mt-2 mb-4">
              What is the LAST sound in the word{" "}
              <Text className="font-bold">“{lastSoundWord}”</Text>?
            </Text>

            <TextInput
              value={lastSound}
              onChangeText={setLastSound}
              placeholder="Example: sh"
              className="bg-gray-50 px-4 py-4 rounded-2xl border border-gray-200 text-base"
            />
          </Card>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <Card>
            <Text className="text-lg font-bold text-purple-900">
              Task 6: Blending Sounds
            </Text>
            <Text className="text-gray-600 mt-2 mb-4">
              Blend these sounds:{" "}
              <Text className="font-bold text-purple-700">{blendPrompt}</Text>
            </Text>

            <TextInput
              value={blendedWord}
              onChangeText={setBlendedWord}
              placeholder="Enter word (ex: dog)"
              className="bg-gray-50 px-4 py-4 rounded-2xl border border-gray-200 text-base"
            />

            {score !== null && (
              <View className="mt-6 bg-green-100 border border-green-300 rounded-2xl p-4">
                <Text className="text-center text-lg font-extrabold text-green-800">
                  ✅ Your Score: {score}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* ✅ Next / Submit Button */}
        <View className="mt-8">
          {step < totalSteps ? (
            <PrimaryBtn title="Next" onPress={goNext} />
          ) : (
            <PrimaryBtn
              title={loading ? "Submitting..." : "Submit"}
              onPress={handleSubmit}
              disabled={loading}
              color="bg-green-600"
            />
          )}
        </View>

        {/* ✅ Reset Button */}
        <View className="mt-4">
          <Pressable
            onPress={resetTest}
            className="py-4 rounded-2xl items-center bg-white border border-pink-200"
          >
            <Text className="text-pink-600 font-bold text-lg">Reset Test</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
