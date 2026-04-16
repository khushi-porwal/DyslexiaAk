import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { markGameProgress } from "./progressStore";

const WORDS = [
  {
    scrambled: "ltebat",
    correct: "tablet",
    image: "https://th.bing.com/th/id/OIP.yMwBzPZYU2G0rAdrr8D2ogHaHD?rs=1&pid=ImgDetMain",
  },
  {
    scrambled: "ract",
    correct: "cart",
    image: "https://i.pinimg.com/originals/8a/81/f4/8a81f4869b242074c396dddbb7ad67bb.jpg",
  },
  {
    scrambled: "osueh",
    correct: "house",
    image: "https://th.bing.com/th/id/OIP.jvaxavmxg_a-5bRe8HKGWAHaFY?rs=1&pid=ImgDetMain",
  },
  {
    scrambled: "ipano",
    correct: "piano",
    image: "https://th.bing.com/th/id/OIP.xzS4slVxemUHEagYK_BjsAHaF7?rs=1&pid=ImgDetMain",
  },
  {
    scrambled: "klcoc",
    correct: "clock",
    image: "https://th.bing.com/th/id/R.81e2020a553aae6a8e6aa6dee5394227",
  },
];

export default function ScrambleGame() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState(Array(WORDS[0].scrambled.length).fill(""));
  const [score, setScore] = useState(0);
  const [promptMessage, setPromptMessage] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  const inputsRef = useRef([]);

  const currentWord = WORDS[currentIndex];

  const handleLetterChange = (text, index) => {
    const nextInput = [...userInput];
    nextInput[index] = text;
    setUserInput(nextInput);

    if (text !== "" && index < userInput.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const formed = userInput.join("").toLowerCase();
    const correct = currentWord.correct.toLowerCase();

    if (formed === correct) {
      setScore((prev) => {
        const next = prev + 1;
        markGameProgress("scramble", { score: next });
        return next;
      });
      setPromptMessage("🎉 Great job! That spells it right.");
      setShowPrompt(true);
      setTimeout(() => goNextWord(), 900);
    } else {
      setPromptMessage("❌ Oops! Try again.");
      setShowPrompt(true);
    }
  };

  const goNextWord = () => {
    if (currentIndex < WORDS.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      setUserInput(Array(WORDS[next].scrambled.length).fill(""));
      setShowPrompt(false);
      markGameProgress("scramble", { score, completed: false });
    } else {
      setPromptMessage("🎊 You finished the game!");
      setShowPrompt(true);
      markGameProgress("scramble", { score, completed: true });
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setUserInput(Array(WORDS[0].scrambled.length).fill(""));
    setScore(0);
    setShowPrompt(false);
    setPromptMessage("");
    inputsRef.current[0]?.focus();
  };

  return (
    <LinearGradient colors={["#c7d2fe", "#fef3c7", "#fecdd3"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>🔠 Picture Scramble</Text>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Word {currentIndex + 1} / {WORDS.length}</Text>
        <Text style={styles.progressHint}>Look carefully at the picture, then build the word.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.pictureBadge}>
          <Ionicons name="sparkles" size={14} color="#f97316" />
          <Text style={styles.badgeText}>Look at the picture</Text>
        </View>
        <Image source={{ uri: currentWord.image }} style={styles.image} />
        <Text style={styles.scrambled}>{currentWord.scrambled}</Text>
        <View style={styles.hintRow}>
          <View style={styles.bubble}>
            <Ionicons name="hand-left" size={14} color="#16a34a" />
            <Text style={styles.bubbleText}>Tap a box</Text>
          </View>
          <View style={styles.bubble}>
            <Ionicons name="arrow-forward" size={14} color="#2563eb" />
            <Text style={styles.bubbleText}>Type the letter</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        {currentWord.scrambled.split("").map((_, idx) => (
          <TextInput
            key={idx}
            ref={(ref) => (inputsRef.current[idx] = ref)}
            value={userInput[idx]}
            onChangeText={(txt) => handleLetterChange(txt, idx)}
            maxLength={1}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#22c55e"
          />
        ))}
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleReset}>
          <Text style={styles.secondaryText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleSubmit}>
          <Text style={styles.primaryText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {showPrompt && <Text style={styles.prompt}>{promptMessage}</Text>}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 64,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: "rgba(15,23,42,0.08)",
    padding: 10,
    borderRadius: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  scoreValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "800",
  },
  progressRow: {
    marginBottom: 16,
  },
  progressText: {
    fontWeight: "800",
    color: "#14532d",
    fontSize: 16,
  },
  progressHint: {
    color: "#334155",
    marginTop: 4,
  },
  card: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 18,
    borderRadius: 20,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 18,
  },
  pictureBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249,115,22,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 10,
    gap: 6,
  },
  image: {
    width: 180,
    height: 180,
    borderRadius: 18,
    marginBottom: 12,
  },
  scrambled: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#7c3aed",
    letterSpacing: 2,
    marginBottom: 6,
  },
  scrambleHint: {
    color: "#334155",
    fontWeight: "600",
    textAlign: "center",
  },
  hintRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15,23,42,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bubbleText: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 18,
  },
  input: {
    width: 54,
    height: 54,
    textAlign: "center",
    fontSize: 20,
    backgroundColor: "#0f172a",
    color: "#fff",
    borderRadius: 12,
    fontWeight: "800",
    elevation: 2,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#22c55e",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryBtn: {
    backgroundColor: "rgba(15,23,42,0.06)",
  },
  secondaryText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
  prompt: {
    textAlign: "center",
    marginTop: 16,
    backgroundColor: "rgba(34,197,94,0.15)",
    color: "#0f172a",
    padding: 12,
    borderRadius: 12,
    fontWeight: "700",
  },
});
