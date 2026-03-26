import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { markGameProgress } from "./progressStore";

const WORDS = ["cat", "frog", "star", "moon", "light", "run", "play", "tree"];

const RHYMES = {
  cat: ["hat", "bat", "rat", "mat"],
  frog: ["log", "dog", "bog", "clog"],
  star: ["car", "far", "bar", "guitar"],
  moon: ["spoon", "tune", "balloon", "soon"],
  light: ["bright", "fight", "sight", "night"],
  run: ["fun", "sun", "done", "bun"],
  play: ["day", "way", "say", "gray"],
  tree: ["bee", "see", "free", "glee"],
};

const IMAGE_URLS = {
  cat: "https://i.pinimg.com/736x/bd/36/0f/bd360fd2ae4fbe3ef98a6abfafb19fbb.jpg",
  frog: "https://i.pinimg.com/736x/61/c8/8c/61c88c2a90c64abdf181f9f34d564128.jpg",
  star: "https://i.pinimg.com/736x/63/27/55/6327556d99f161ed33f4180385e8ea8c.jpg",
  moon: "https://i.pinimg.com/736x/78/59/e3/7859e39f7635584462f210ba74a58bf3.jpg",
  light: "https://i.pinimg.com/736x/76/8f/cc/768fcc2025218a44a96ad1598dbd2dc1.jpg",
  run: "https://i.pinimg.com/736x/48/f5/12/48f5123917ffe14517d99809024826ce.jpg",
  play: "https://i.pinimg.com/736x/ad/dc/92/addc9272d7ba87939d4f7a0db64d3a9e.jpg",
  tree: "https://i.pinimg.com/736x/38/0e/c1/380ec17fdf582677307c38321ac17e4d.jpg",
  boy: "https://i.pinimg.com/736x/85/62/37/856237f5132178e5db73078ca8df31e1.jpg",
  girl: "https://i.pinimg.com/736x/53/3f/aa/533faa6584279a5fe5d0e330a41d2e5c.jpg",
};

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const buildOptions = (word) => {
  const correct = pickRandom(RHYMES[word]);

  const shuffledWrong = WORDS.filter((w) => w !== word)
    .map((w) => pickRandom(RHYMES[w]))
    .sort(() => Math.random() - 0.5);

  return [correct, ...shuffledWrong.slice(0, 2)].sort(() => Math.random() - 0.5);
};

export default function FrogRhymingGame() {
  const router = useRouter();

  const [currentWord, setCurrentWord] = useState(WORDS[0]);
  const [options, setOptions] = useState(() => buildOptions(WORDS[0]));
  const [isCorrect, setIsCorrect] = useState(null);
  const [message, setMessage] = useState("");
  const [feedbackImage, setFeedbackImage] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const handleOptionSelect = (selectedOption) => {
    const correct = RHYMES[currentWord].includes(selectedOption);

    if (correct) {
      setIsCorrect(true);
      setMessage("Ribbit! That rhymes. 🐸");
      setFeedbackImage(IMAGE_URLS.girl);
      setScore((prev) => {
        const next = prev + 1;
        markGameProgress("frog-rhyme", { score: next });
        return next;
      });
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
      setTimeout(() => resetGame(), 900);
    } else {
      setIsCorrect(false);
      setMessage("Oops! Try again.");
      setFeedbackImage(IMAGE_URLS.boy);
      setStreak(0);
    }
  };

  const resetGame = () => {
    const nextWord = pickRandom(WORDS);
    setCurrentWord(nextWord);
    setOptions(buildOptions(nextWord));
    setIsCorrect(null);
    setMessage("");
    setFeedbackImage(null);
  };

  const hintEnding = useMemo(
    () => RHYMES[currentWord][0].slice(-2),
    [currentWord]
  );

  const optionStyle = useMemo(
    () => ({
      default: [styles.button, styles.defaultBtn],
      correct: [styles.button, styles.correctBtn],
      wrong: [styles.button, styles.wrongBtn],
    }),
    []
  );

  return (
    <LinearGradient colors={["#bbf7d0", "#22c55e"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Floating decor */}
      <View style={[styles.lily, styles.lilyOne]} />
      <View style={[styles.lily, styles.lilyTwo]} />
      <View style={[styles.lily, styles.lilyThree]} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={1}>
          🐸 Frog Rhyming Game
        </Text>

        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="flame" size={16} color="#f97316" />
            <Text style={styles.badgeText}>{streak} streak</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="trophy" size={16} color="#facc15" />
            <Text style={styles.badgeText}>Best {bestStreak}</Text>
          </View>
        </View>

        <View style={styles.imageWrap}>
          <Image source={{ uri: IMAGE_URLS[currentWord] }} style={styles.image} />
          <View style={styles.hintPill}>
            <Text style={styles.hintLabel}>Hint</Text>
            <Text style={styles.hintText}>Ends with "{hintEnding}"</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Find a word that rhymes with:</Text>
        <Text style={styles.word}>{currentWord}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.pickLabel}>Tap a lily pad to answer</Text>

        <View style={styles.optionsContainer}>
          {options.map((option, index) => {
            const state =
              isCorrect === null
                ? "default"
                : RHYMES[currentWord].includes(option)
                ? "correct"
                : "wrong";
            return (
              <TouchableOpacity
                key={`${option}-${index}`}
                style={optionStyle[state]}
                onPress={() => handleOptionSelect(option)}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {message ? (
          <Text style={[styles.message, isCorrect ? styles.correctText : styles.wrongText]}>
            {message}
          </Text>
        ) : null}

        {feedbackImage && <Image source={{ uri: feedbackImage }} style={styles.feedbackImage} />}

        <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
          <Ionicons name="refresh" size={18} color="#0f172a" />
          <Text style={styles.resetText}>New word</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 20,
    paddingTop: 110, // room for pinned header
  },
  lily: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
  },
  lilyOne: { width: 180, height: 180, top: 40, left: -30, transform: [{ rotate: "8deg" }] },
  lilyTwo: { width: 140, height: 140, bottom: 90, right: -20, transform: [{ rotate: "-12deg" }] },
  lilyThree: { width: 90, height: 90, bottom: 20, left: 30, transform: [{ rotate: "18deg" }] },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: "rgba(15,23,42,0.06)",
    padding: 10,
    borderRadius: 14,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    minWidth: 92,
    justifyContent: "center",
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
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#14532d",
    flex: 1,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  heroCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    marginTop: 20,
  },
  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(20,83,45,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: "700",
    color: "#14532d",
  },
  imageWrap: {
    alignItems: "center",
    marginBottom: 6,
  },
  image: {
    width: 130,
    height: 130,
    marginBottom: 10,
    borderRadius: 14,
  },
  hintPill: {
    position: "absolute",
    bottom: 4,
    right: 14,
    backgroundColor: "#fefce8",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#fcd34d",
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  hintLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#a16207",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  hintText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#854d0e",
  },
  subtitle: {
    fontSize: 18,
    color: "#1f2937",
    textAlign: "center",
    marginTop: 4,
  },
  word: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#166534",
    marginVertical: 8,
    textTransform: "capitalize",
    textAlign: "center",
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 12,
  },
  pickLabel: {
    textAlign: "center",
    color: "#0f172a",
    fontWeight: "700",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  optionsContainer: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 18,
    minWidth: 120,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  defaultBtn: {
    backgroundColor: "#16a34a",
  },
  correctBtn: {
    backgroundColor: "#facc15",
  },
  wrongBtn: {
    backgroundColor: "#ef4444",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "capitalize",
  },
  message: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  correctText: {
    color: "#14532d",
  },
  wrongText: {
    color: "#b91c1c",
  },
  feedbackImage: {
    width: 90,
    height: 90,
    marginTop: 10,
    borderRadius: 12,
    alignSelf: "center",
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
    backgroundColor: "rgba(15,23,42,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: "center",
  },
  resetText: {
    color: "#0f172a",
    fontWeight: "700",
  },
});
