import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";

const SUCCESS_IMAGE = "https://i.pinimg.com/736x/d9/96/8e/d9968eba01a9c61318cc8aef32695902.jpg";
const FAIL_IMAGE = "https://i.pinimg.com/736x/a3/dd/c4/a3ddc47acfdffa977ae812cda60d8ae5.jpg";

const SUCCESS_SOUND = "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg";
const FAIL_SOUND = "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg";

const WORDS = ["pirates", "strap", "spark", "parts", "stair"];
const CIRCLE_SIZE = 220;
const RADIUS = 90;

export default function AnagramGame() {
  const router = useRouter();

  const [currentWord, setCurrentWord] = useState("");
  const [letters, setLetters] = useState([]);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [message, setMessage] = useState("Tap the letters to build the word.");
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [score, setScore] = useState(0);

  const playSound = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      await sound.playAsync();
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  const shuffleArray = useCallback((array) => [...array].sort(() => Math.random() - 0.5), []);

  const startNewGame = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    setLetters(shuffleArray(word.split("")));
    setSelectedLetters([]);
    setUsedIndices([]);
    setFeedbackImage(null);
    setMessage(`Match the letters to spell: ${word.toUpperCase()}`);
  }, [shuffleArray]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const resetSelection = () => {
    setSelectedLetters([]);
    setUsedIndices([]);
  };

  const handleLetterPress = (index) => {
    if (usedIndices.includes(index)) return;

    const letter = letters[index];
    const nextSelected = [...selectedLetters, letter];
    const formed = nextSelected.join("");

    setSelectedLetters(nextSelected);
    setUsedIndices([...usedIndices, index]);

    if (formed === currentWord) {
      setMessage("Great job! New word loading...");
      setFeedbackImage(SUCCESS_IMAGE);
      setScore((prev) => prev + 1);
      playSound(SUCCESS_SOUND);
      setTimeout(startNewGame, 1400);
    } else if (!currentWord.startsWith(formed)) {
      setMessage("Oops, try again from the start.");
      setFeedbackImage(FAIL_IMAGE);
      playSound(FAIL_SOUND);
      resetSelection();
    }
  };

  const renderSlots = () => {
    const slots = Array.from({ length: currentWord.length }, (_, i) => selectedLetters[i] || " ");
    return (
      <View style={styles.slotRow}>
        {slots.map((char, idx) => (
          <View key={idx} style={[styles.slotBox, char.trim() ? styles.slotFilled : null]}>
            <Text style={styles.slotText}>{char.trim() ? char.toUpperCase() : ""}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Anagram Builder</Text>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.card}>
        {feedbackImage && <Image source={{ uri: feedbackImage }} style={styles.feedbackImage} />}

        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subtitle}>
          {currentWord
            ? `${currentWord.length} letters | ${selectedLetters.length}/${currentWord.length} placed`
            : ""}
        </Text>

        {/* Target word reference */}
        <View style={styles.targetBlock}>
          <Text style={styles.targetLabel}>Target word</Text>
          <View style={styles.slotRow}>
            {currentWord.split("").map((char, idx) => (
              <View key={idx} style={[styles.slotBox, styles.targetBox]}>
                <Text style={styles.targetText}>{char.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Attempt */}
        <View style={styles.attemptRow}>
          <Text style={styles.attemptLabel}>Your order:</Text>
          <Text style={styles.attemptText}>
            {selectedLetters.length ? selectedLetters.join(" ").toUpperCase() : "—"}
          </Text>
        </View>

        {renderSlots()}

        <Text style={styles.scrambleLabel}>Scrambled letters:</Text>
        <View style={styles.circle}>
          {/* Decorative rings */}
          <Svg
            width={CIRCLE_SIZE + 30}
            height={CIRCLE_SIZE + 30}
            style={styles.ring}
          >
            <Circle
              cx={(CIRCLE_SIZE + 30) / 2}
              cy={(CIRCLE_SIZE + 30) / 2}
              r={(CIRCLE_SIZE + 30) / 2 - 8}
              stroke="#FBCFE8"
              strokeWidth={3}
              strokeDasharray="6 10"
              fill="none"
            />
            <Circle
              cx={(CIRCLE_SIZE + 30) / 2}
              cy={(CIRCLE_SIZE + 30) / 2}
              r={(CIRCLE_SIZE + 30) / 2 - 16}
              stroke="#C4B5FD"
              strokeWidth={2}
              strokeDasharray="3 8"
              fill="none"
            />
          </Svg>

          {/* Center badge */}
          <View style={styles.centerBadge}>
            <Image
              source={require("../../../assets/images/owl.png")}
              style={styles.centerImage}
              resizeMode="contain"
            />
            <Text style={styles.centerLabel}>Tap letters</Text>
          </View>

          {letters.map((letter, index) => {
            const angle = (2 * Math.PI * index) / letters.length;
            const center = CIRCLE_SIZE / 2;
            const x = center + RADIUS * Math.cos(angle) - 28;
            const y = center + RADIUS * Math.sin(angle) - 28;
            const used = usedIndices.includes(index);

            return (
              <TouchableOpacity
                key={`${letter}-${index}`}
                style={[
                  styles.letterButton,
                  { left: x, top: y, opacity: used ? 0.35 : 1 },
                ]}
                disabled={used}
                onPress={() => handleLetterPress(index)}
              >
                <Text style={styles.letterText}>{letter.toUpperCase()}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={resetSelection}>
            <Text style={styles.secondaryText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={startNewGame}>
            <Text style={styles.primaryText}>New Word</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5D9FF",
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flex: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 12,
  },
  targetBlock: {
    marginBottom: 10,
  },
  targetLabel: {
    textAlign: "center",
    color: "#6b7280",
    fontWeight: "600",
    marginBottom: 6,
  },
  targetBox: {
    backgroundColor: "#EEF2FF",
    borderColor: "#7C3AED",
  },
  targetText: {
    color: "#1F2937",
    fontWeight: "800",
    fontSize: 18,
  },
  feedbackImage: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 14,
    marginBottom: 10,
  },
  attemptRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  attemptLabel: {
    color: "#6b7280",
    fontWeight: "600",
  },
  attemptText: {
    color: "#111827",
    fontWeight: "700",
    letterSpacing: 1,
  },
  scrambleLabel: {
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 8,
    fontWeight: "600",
  },
  circle: {
    alignSelf: "center",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#F3E8FF",
    marginTop: 12,
    marginBottom: 24,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  ring: {
    position: "absolute",
  },
  centerBadge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FDF2F8",
    borderWidth: 2,
    borderColor: "#F9A8D4",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#DB2777",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  centerImage: {
    width: 46,
    height: 46,
  },
  centerLabel: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#7C3AED",
    letterSpacing: 0.5,
  },
  letterButton: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7D3BCF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#C084FC",
  },
  letterText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  slotRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  slotBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  slotFilled: {
    backgroundColor: "#EEF2FF",
    borderColor: "#7C3AED",
  },
  slotText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    gap: 10,
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C7D2FE",
    gap: 6,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4B5563",
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: "#7D3BCF",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  secondaryText: {
    color: "#111827",
    fontWeight: "600",
  },
});
