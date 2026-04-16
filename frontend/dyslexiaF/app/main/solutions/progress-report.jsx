import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { readGameProgress } from "./progressStore";

const GAME_LIST = [
  { id: "frog-rhyme", name: "Frog Rhyming" },
  { id: "anagram", name: "Anagram Builder" },
  { id: "scramble", name: "Scramble" },
  { id: "all-b-circle", name: "Circle the Letter" },
  { id: "word-match", name: "Letter Match" },
];

export default function ProgressReport() {
  const router = useRouter();
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const load = async () => {
      const stored = await readGameProgress();
      setProgress(stored);
    };
    const unsubscribe = router.addListener?.("focus", load);
    load();
    return unsubscribe;
  }, [router]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Not played";
    const d = new Date(dateStr);
    return d.toLocaleString();
  };

  return (
    <LinearGradient colors={["#ecfeff", "#fef3c7", "#ffe4e6"]} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#0f172a" />
          </TouchableOpacity>
          <Text style={styles.title}>Game Progress</Text>
          <View style={styles.placeholder} />
        </View>

        {GAME_LIST.map((game) => {
          const data = progress[game.id] || {};
          return (
            <View key={game.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.gameName}>{game.name}</Text>
                <View style={[styles.statusPill, data.completed && styles.statusDone]}>
                  <Text style={[styles.statusText, data.completed && styles.statusTextDone]}>
                    {data.completed ? "Completed" : data.score ? "In progress" : "Not started"}
                  </Text>
                </View>
              </View>
              <Text style={styles.metaText}>Score: {data.score ?? 0}</Text>
              <Text style={styles.metaText}>Updated: {formatDate(data.updatedAt)}</Text>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 18, paddingTop: 52, paddingBottom: 28, gap: 12 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: "rgba(15,23,42,0.08)",
    padding: 10,
    borderRadius: 14,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  placeholder: { width: 44 },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  gameName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.12)",
  },
  statusDone: { backgroundColor: "rgba(34,197,94,0.2)" },
  statusText: { fontWeight: "700", color: "#2563eb" },
  statusTextDone: { color: "#15803d" },
  metaText: { color: "#334155", marginTop: 2 },
});
