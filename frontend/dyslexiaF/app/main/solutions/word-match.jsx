import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { markGameProgress } from "./progressStore";

// Pairs of similar-looking or often-confused letters
const LETTER_SETS = [
  ["b", "d"],
  ["p", "q"],
  ["m", "n"],
  ["u", "v"],
  ["i", "l"],
  ["c", "e"],
  ["g", "q"],
  ["t", "f"],
];

const buildCards = () => {
  const pairs = LETTER_SETS.map((pair, idx) =>
    pair.map((text) => ({ text, pairId: idx }))
  ).flat();

  return pairs
    .sort(() => Math.random() - 0.5)
    .map((card, i) => ({
      id: i,
      ...card,
      flipped: true, // always visible
      matched: false,
    }));
};

export default function WordMatchGame() {
  const router = useRouter();
  const [cards, setCards] = useState(buildCards());
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  const allMatched = useMemo(() => cards.every((c) => c.matched), [cards]);
  const totalPairs = LETTER_SETS.length;
  const matchedPairs = useMemo(
    () => Math.floor(cards.filter((c) => c.matched).length / 2),
    [cards]
  );

  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      const first = cards.find((c) => c.id === a);
      const second = cards.find((c) => c.id === b);

      const isMatch = first?.pairId === second?.pairId;
      if (isMatch) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === a || c.id === b ? { ...c, matched: true } : c
          )
        );
        setScore((s) => {
          const next = s + 1;
          markGameProgress("word-match", { score: next });
          return next;
        }); // 1 mark per correct pair
      }
      setTimeout(() => setSelected([]), 200);
      setMoves((m) => m + 1);
    }
  }, [selected, cards]);

  useEffect(() => {
    if (allMatched) {
      markGameProgress("word-match", { score, completed: true });
    } else {
      markGameProgress("word-match", { score, completed: false });
    }
  }, [allMatched, score]);

  const handlePress = (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.matched || selected.length === 2 || selected.includes(cardId)) return;
    setSelected((s) => [...s, cardId]);
  };

  const resetGame = () => {
    setCards(buildCards());
    setSelected([]);
    setMoves(0);
    setScore(0);
  };

  return (
    <LinearGradient
      colors={["#c7d2fe", "#ecfeff", "#fef3c7", "#ffe4e6"]}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Letter Look-Alike Match</Text>
          <View style={styles.scorePill}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroBadges}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={14} color="#f97316" />
              <Text style={styles.badgeText}>Upper + lower</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="stopwatch" size={14} color="#2563eb" />
              <Text style={styles.badgeText}>Find pairs fast</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Tap matching letters</Text>
          <Text style={styles.heroSub}>
            Letters that look alike (b/d, p/q, m/n...). Pick any case to make a pair.
          </Text>
          <View style={styles.heroProgress}>
            <Text style={styles.infoText}>Pairs: {matchedPairs} / {totalPairs}</Text>
            <Text style={styles.infoText}>Moves: {moves}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          {allMatched ? (
            <Text style={styles.success}>All pairs matched! 🎉</Text>
          ) : (
            <Text style={styles.tip}>Tap two cards that show the same letter (upper/lower mix).</Text>
          )}
        </View>

        <View style={styles.grid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[
                styles.card,
                card.matched ? styles.cardMatched : styles.cardIdle,
                selected.includes(card.id) && !card.matched ? styles.cardSelected : null,
              ]}
              onPress={() => handlePress(card.id)}
              activeOpacity={0.9}
            >
              <Text style={styles.cardText}>
                {card.id % 2 === 0 ? card.text.toUpperCase() : card.text.toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
          <Ionicons name="refresh" size={18} color="#fff" />
          <Text style={styles.resetText}>Play Again</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 52,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
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
  },
  scorePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.12)",
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
  hero: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  heroBadges: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(124,58,237,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontWeight: "700",
    color: "#4338ca",
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  heroSub: {
    color: "#334155",
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
  heroProgress: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  infoText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  success: {
    color: "#16a34a",
    fontWeight: "800",
  },
  tip: {
    color: "#334155",
    fontWeight: "700",
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.92)",
    padding: 14,
    borderRadius: 16,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    width: 88,
    height: 88,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    paddingHorizontal: 6,
  },
  cardIdle: {
    backgroundColor: "#7c3aed",
  },
  cardSelected: {
    backgroundColor: "#38bdf8",
  },
  cardMatched: {
    backgroundColor: "#22c55e",
  },
  cardText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    textTransform: "uppercase",
    textAlign: "center",
  },
  resetBtn: {
    marginTop: 16,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
