import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";
import { getBackendUrl } from "../../../constants/api";
import { saveScreeningResult } from "../../../constants/progressStorage";

export default function WorkingMemory() {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [feedback, setFeedback] = useState({});
  const [scoreSummary, setScoreSummary] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const backend = getBackendUrl();
      const res = await axios.get(`${backend}/api/working-memory`);
      setQuestions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.log("Failed to load working-memory questions:", error?.message || error);
      setQuestions([]);
    }
  };

  const shuffleArray = (arr) => {
  return [...arr].sort(() => Math.random() - 0.5);
};


  const speakWord = (word) => {
    Speech.speak(word);
  };

  const handleSelect = (qIndex, option) => {
    setSelected({ ...selected, [qIndex]: option });

    if (option === questions[qIndex].correctAnswer) {
      setFeedback({ ...feedback, [qIndex]: "correct" });
    } else {
      setFeedback({ ...feedback, [qIndex]: "wrong" });
    }
  };

  const handleSubmitResults = async () => {
    if (!questions.length) {
      Alert.alert("No questions", "Please load questions first.");
      return;
    }

    if (Object.keys(selected).length < questions.length) {
      Alert.alert("Incomplete", "Answer every word before saving progress.");
      return;
    }

    const correct = questions.reduce((acc, q, idx) => {
      return acc + (selected[idx] === q.correctAnswer ? 1 : 0);
    }, 0);
    const total = questions.length;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;

    const summary = { correct, total, accuracy };
    setScoreSummary(summary);

    await saveScreeningResult("working_memory", summary);

    Alert.alert("Progress saved", `You answered ${correct} of ${total} correctly.`);
  };

  const allAnswered =
    questions.length > 0 && Object.keys(selected).length === questions.length;

  return (
    <ScrollView className="flex-1 bg-[#FFE08A] px-4 pt-10">

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
      
      
              <TouchableOpacity onPress={() => router.push("/main/profile")}>
                <Ionicons name="person" size={30} color="orange" />
              </TouchableOpacity>
            </View>

            <Text className="text-3xl font-bold text-center text-gray-800 mt-5 mb-4">
                 Working Memory Test
            </Text>

      {/* <View className="flex-row justify-between items-center mb-6">
        <Ionicons name="arrow-back" size={26} />
        <Text className="text-2xl font-bold">Working Memory Test</Text>
        <TouchableOpacity onPress={() => router.push("/main/profile")}>
            <Ionicons name="person" size={30} color="orange" />
        </TouchableOpacity>
      </View> */}

      {questions.map((q, qIndex) => (
        <View key={q._id} className="bg-white rounded-3xl p-5 mb-6 shadow-md">

          <Text className="text-center text-lg font-semibold mb-4 text-[#4C7A3E]">
            Try to pronounce the word "{q.word}"
          </Text>

          <View className="flex-row justify-between">

            {shuffleArray(q.options).map((option, index) => {

              const isSelected = selected[qIndex] === option;
              const isCorrect = option === q.correctAnswer;

              let border = "border-gray-300";
              if (isSelected && isCorrect) border = "border-green-400";
              if (isSelected && !isCorrect) border = "border-red-400";

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSelect(qIndex, option)}
                  className={`border-2 ${border} rounded-2xl p-3 items-center w-[30%]`}
                >
                  <Image
                    source={{ uri: q.image }}
                    className="w-16 h-16 mb-2"
                  />

                  {isSelected && (
                    <Ionicons
                      name={isCorrect ? "checkmark-circle" : "close-circle"}
                      size={26}
                      color={isCorrect ? "green" : "red"}
                    />
                  )}

                  <Text className="text-blue-500 mt-1">
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}

          </View>

          <TouchableOpacity
            onPress={() => speakWord(q.word)}
            className="flex-row items-center mt-4"
          >
            <Ionicons name="volume-medium" size={22} color="#3A7F4E" />
            <Text className="ml-2 text-[#3A7F4E] font-semibold">
              Auditory Feedback
            </Text>
          </TouchableOpacity>

          {feedback[qIndex] && (
            <View className={`border rounded-xl p-3 mt-3 ${
              feedback[qIndex] === "correct" 
                ? "border-green-400" 
                : "border-red-400"
            }`}>
              <Text className={`text-center font-semibold ${
                feedback[qIndex] === "correct" 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {feedback[qIndex] === "correct"
                  ? "You pronounced the word correctly!"
                  : "Try again!"}
              </Text>
            </View>
          )}

        </View>
      ))}

      <View className="mt-4 mb-20">
        <TouchableOpacity
          onPress={handleSubmitResults}
          disabled={!allAnswered}
          className={`py-4 rounded-2xl items-center ${
            allAnswered ? "bg-[#4C7A3E]" : "bg-gray-300"
          }`}
        >
          <Text className="text-white font-semibold text-lg">
            Save Progress
          </Text>
          {!allAnswered && (
            <Text className="text-white mt-1 text-xs">
              Answer all words to enable
            </Text>
          )}
        </TouchableOpacity>

        {scoreSummary && (
          <View className="mt-3 bg-white rounded-2xl p-4 border border-[#4C7A3E]">
            <Text className="text-lg font-bold text-[#4C7A3E] text-center">
              Accuracy: {scoreSummary.accuracy}%
            </Text>
            <Text className="text-center text-gray-700 mt-1">
              {scoreSummary.correct} of {scoreSummary.total} words correct
            </Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}
