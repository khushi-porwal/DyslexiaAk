import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import * as Speech from "expo-speech";
import { useRouter } from "expo-router";

export default function WorkingMemory() {
  const router = useRouter();

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState({});
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://192.168.0.126:5000/api/working-memory");
      setQuestions(res.data);
    } catch (error) {
      console.log(error);
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

  return (
    <ScrollView className="flex-1 bg-[#FFE08A] px-4 pt-10">

      <View className="flex-row justify-between items-center mb-6">
        <Ionicons name="arrow-back" size={26} />
        <Text className="text-2xl font-bold">Working Memory Test</Text>
        <TouchableOpacity onPress={() => router.push("/main/profile")}>
            <Ionicons name="person-circle" size={32} />
        </TouchableOpacity>
      </View>

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

    </ScrollView>
  );
}
