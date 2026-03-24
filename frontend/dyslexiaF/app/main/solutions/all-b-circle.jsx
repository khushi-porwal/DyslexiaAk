import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const LEVELS = [
  { target: "b", options: ["b", "d", "p", "q", "h", "g", "l", "b"] },
  { target: "p", options: ["q", "p", "b", "d", "p", "o", "r", "a"] },
  { target: "d", options: ["b", "p", "q", "d", "d", "c", "a", "g"] },
  { target: "q", options: ["b", "p", "q", "d", "c", "q", "o", "g"] },
  { target: "b", options: ["h", "k", "b", "d", "p", "q", "b", "f"] },
  { target: "p", options: ["p", "g", "b", "d", "q", "p", "y", "j"] },
  { target: "d", options: ["c", "d", "b", "p", "q", "d", "e", "o"] },
];

const LETTER_IMAGES = {
  b: "https://i.pinimg.com/564x/71/71/c7/7171c704ab0cb3c502c7b49601c4a8e8.jpg",
  d: "https://i.pinimg.com/564x/1f/f6/0c/1ff60cf92a5b68aab0cc829af9da6af7.jpg",
  p: "https://i.pinimg.com/564x/2d/4e/68/2d4e68da88df0e3d02558c6720b12135.jpg",
  q: "https://i.pinimg.com/564x/69/d5/53/69d553a2f51e1fed2c5b433c60ab40f2.jpg",
};

export default function AllBCircleGame() {
  const router = useRouter();
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [locked, setLocked] = useState(false);
  const [selected, setSelected] = useState([]);

  const { target, options } = LEVELS[level];
  const optionsWithIndex = useMemo(
    () => options.map((letter, idx) => ({ letter, key: `${letter}-${idx}` })),
    [options, level]
  );

  const totalTargets = useMemo(() => options.filter((l) => l === target).length, [options, target]);

  const handlePick = (letter, index) => {
    if (locked) return;
    if (selected.includes(index)) return;

    const correct = letter === target;
    if (correct) {
      const nextSelected = [...selected, index];
      setSelected(nextSelected);

      const foundAll = nextSelected.length === totalTargets;
      if (foundAll) {
        setScore((s) => s + 1);
        setFeedback("Great spot! Next level →");
        setLocked(true);
        setTimeout(() => {
          const next = level + 1;
          if (next < LEVELS.length) {
            setLevel(next);
            setFeedback("");
            setLocked(false);
            setSelected([]);
          } else {
            setFeedback("All levels done! 🏆");
          }
        }, 900);
      } else {
        const remaining = totalTargets - nextSelected.length;
        setFeedback(`Nice! ${remaining} more "${target}" to find.`);
      }
    } else {
      setFeedback("Try again! Look closely.");
    }
  };

  const handleReset = () => {
    setLevel(0);
    setScore(0);
    setFeedback("");
    setLocked(false);
    setSelected([]);
  };

  return (
    <LinearGradient colors={["#e0f2fe", "#c7d2fe", "#fdf2f8"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.title}>🔵 Circle the Letter</Text>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={styles.scoreValue}>{score}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>Level {level + 1} / {LEVELS.length}</Text>
        <Text style={styles.hintText}>Circle all the "{target}" letters.</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <Ionicons name="eye" size={16} color="#f59e0b" />
          <Text style={styles.heroBadgeText}>Watch out for look-alikes!</Text>
        </View>
        <View style={styles.heroRow}>
          <View style={styles.imageCard}>
            <Text style={styles.imageLabel}>Target</Text>
            <View style={styles.bigLetter}>
              <Text style={styles.bigLetterText}>{target.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.imageCard}>
            <Text style={styles.imageLabel}>Letter card</Text>
            <View style={styles.imageWrap}>
              {LETTER_IMAGES[target] ? (
                <Image source={{ uri: LETTER_IMAGES[target] }} style={styles.image} />
              ) : (
                <Text style={styles.imageFallback}>{target.toUpperCase()}</Text>
              )}
            </View>
          </View>
        </View>
      </View>

      <View style={styles.board}>
        {optionsWithIndex.map(({ letter, key }, idx) => {
          const isCorrect = letter === target;
          const isSelected = selected.includes(idx);
          return (
            <TouchableOpacity
              key={key}
              style={[
                styles.cell,
                isSelected && isCorrect && styles.cellCorrect,
                isSelected && !isCorrect && styles.cellWrong,
              ]}
              onPress={() => handlePick(letter, idx)}
              activeOpacity={0.85}
            >
              <Text style={styles.cellText}>{letter}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleReset}>
          <Text style={styles.secondaryText}>Restart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.primaryBtn]}
          onPress={handleReset}
          disabled={false}
        >
          <Text style={styles.primaryText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop:-20
  },
  backButton: {
    backgroundColor: "rgba(15,23,42,0.08)",
    padding: 10,
    borderRadius: 14,
  },
  title: {
    fontSize: 20,
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
    marginBottom: 14,
  },
  progressText: {
    fontWeight: "800",
    color: "#14532d",
    fontSize: 16,
  },
  hintText: {
    color: "#334155",
    marginTop: 4,
    fontWeight: "600",
  },
  hero: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(245,158,11,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontWeight: "700",
    color: "#92400e",
  },
  heroRow: {
    flexDirection: "row",
    gap: 12,
  },
  imageCard: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.04)",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  imageLabel: {
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  bigLetter: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  bigLetterText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#fff",
  },
  imageWrap: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "rgba(15,23,42,0.08)",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageFallback: {
    fontSize: 50,
    fontWeight: "800",
    color: "#0f172a",
  },
  board: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cell: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  cellCorrect: {
    backgroundColor: "#22c55e",
  },
  cellWrong: {
    backgroundColor: "#f97316",
  },
  cellText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },
  feedback: {
    textAlign: "center",
    marginTop: 14,
    fontWeight: "800",
    color: "#0f172a",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
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
  secondaryBtn: {
    backgroundColor: "rgba(15,23,42,0.08)",
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  secondaryText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 15,
  },
});
