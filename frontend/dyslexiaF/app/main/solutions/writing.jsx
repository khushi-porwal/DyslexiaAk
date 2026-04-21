import { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import API from "../../api/axios";
import * as Speech from "expo-speech";
import { LinearGradient } from "expo-linear-gradient";

export default function WritingAssistant() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [corrections, setCorrections] = useState([]);
  const [corrected, setCorrected] = useState("");
  const [response, setResponse] = useState("");
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveError, setLiveError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [speakWordIndex, setSpeakWordIndex] = useState(-1);
  const speakCancelled = useRef(false);
  const stopSpeaking = () => {
    speakCancelled.current = true;
    Speech.stop();
    setSpeaking(false);
    setSpeakWordIndex(-1);
  };

  // Debounced live spellcheck
  useEffect(() => {
    if (!text.trim()) {
      setCorrections([]);
      setCorrected("");
      setLiveError("");
      return;
    }

    const timer = setTimeout(async () => {
      setChecking(true);
      try {
        const res = await API.post("/api/ai/spellcheck", { text });
        setCorrections(res.data?.corrections || []);
        setCorrected(res.data?.corrected || "");
        setLiveError("");
      } catch (err) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Live spellcheck failed";
        setLiveError(message);
      } finally {
        setChecking(false);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please enter some writing to improve.");
      return;
    }
    setError("");
    setLoading(true);
    setResponse("");

    try {
      const res = await API.post("/api/ai/writing", { text });
      setResponse(res.data?.content || "No feedback returned.");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Unable to reach the writing assistant.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const highlightedText = useMemo(() => {
    if (!corrections.length) {
      return text
        ? [
          <Text key="plain-all" className="text-black">
            {text}
          </Text>,
        ]
        : null;
    }

    const sorted = [...corrections].filter(
      (c) =>
        Number.isFinite(c.start) &&
        Number.isFinite(c.end) &&
        c.start >= 0 &&
        c.end > c.start &&
        c.end <= text.length
    );
    sorted.sort((a, b) => a.start - b.start);

    const pieces = [];
    let cursor = 0;

    sorted.forEach((c, idx) => {
      if (c.start > cursor) {
        pieces.push(
          <Text key={`plain-${idx}-${cursor}`} className="text-black">
            {text.slice(cursor, c.start)}
          </Text>
        );
      }
      pieces.push(
        <Text
          key={`err-${idx}`}
          style={{
            color: "#dc2626",
            textDecorationLine: "underline",
            textDecorationColor: "#dc2626",
          }}
        >
          {text.slice(c.start, c.end) || c.original || ""}
        </Text>
      );
      cursor = c.end;
    });

    if (cursor < text.length) {
      pieces.push(
        <Text key="tail" className="text-black">
          {text.slice(cursor)}
        </Text>
      );
    }
    return pieces;
  }, [corrections, text]);

  const displayCorrected = corrected || text;

  const correctedWithHighlight = useMemo(() => {
    if (!displayCorrected) return null;
    const parts = displayCorrected.split(/(\s+)/); // keep spaces
    return parts.map((part, idx) => {
      const isWord = /\S/.test(part) && !/^\s+$/.test(part);
      const wordNumber = parts
        .slice(0, idx + 1)
        .filter((p) => /\S/.test(p) && !/^\s+$/.test(p)).length - 1;
      const active = isWord && wordNumber === speakWordIndex;
      return (
        <Text
          key={`cw-${idx}`}
          style={{
            color: active ? "#fff" : "#f5f3ff",
            textDecorationLine: active ? "underline" : "none",
            textDecorationColor: "#fff",
          }}
        >
          {part}
        </Text>
      );
    });
  }, [displayCorrected, speakWordIndex]);

  const speakText = () => {
    const textToSpeak = displayCorrected?.trim();
    if (!textToSpeak) {
      setError("Nothing to read yet.");
      return;
    }

    const words = textToSpeak.split(/\s+/).filter(Boolean);
    if (!words.length) return;

    // Cancel any ongoing speech and start fresh
    Speech.stop();
    speakCancelled.current = false;
    setSpeaking(true);
    setSpeakWordIndex(-1);

    const speakWord = (index) => {
      if (speakCancelled.current || index >= words.length) {
        setSpeaking(false);
        setSpeakWordIndex(-1);
        return;
      }
      setSpeakWordIndex(index);
      Speech.speak(words[index], {
        language: "en-US",
        rate: 0.95,
        pitch: 1.0,
        onDone: () => speakWord(index + 1),
        onStopped: () => {
          speakCancelled.current = true;
          setSpeaking(false);
          setSpeakWordIndex(-1);
        },
        onError: () => {
          speakCancelled.current = true;
          setSpeaking(false);
          setSpeakWordIndex(-1);
          setError("Speech playback failed.");
        },
      });
    };

    speakWord(0);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#EBD9FF]"
    >
      <ScrollView
        className="flex-1 px-5 pt-10"
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
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
          <Ionicons name="person" size={30} color="purple" />
        </TouchableOpacity>
      </View>
      <Text className="text-3xl font-bold text-center text-gray-800">
       Writing Assistant
      </Text>
          <Text className="text-sm text-center text-[#4A3F6D]">
              Friendly helper for spelling & speaking
            </Text>
                
          
            
        

        {/* Mascot hero */}
        
        <View className="bg-white rounded-3xl p-4 mb-4 shadow-md border border-[#F0D7FF] mt-3">
          <View className="flex-row items-center">
            <View className="bg-[#F3E8FF] rounded-3xl p-3 mr-3">
              <Image
                source={require("../../../assets/images/hamster.png")}
                className="w-24 h-24"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-[#231942]">
                Hi, I’m Nibbles!
              </Text>
              <Text className="text-sm text-[#4B5563] mt-1">
                I’ll underline tricky words, fix them with you, and read them
                aloud. Let’s practice together. ✨
              </Text>
            </View>
          </View>
          <View className="flex-row space-x-2 mt-3">
            <View className="bg-[#E9D5FF] px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-[#5B21B6]">
                Spell check
              </Text>
            </View>
            <View className="bg-[#C7D2FE] px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-[#1D4ED8]">
                Read aloud
              </Text>
            </View>
            <View className="bg-[#FEE2E2] px-3 py-1 rounded-full">
              <Text className="text-xs font-semibold text-[#DC2626]">
                Red = fix
              </Text>
            </View>
          </View>
        </View>

        {/* Input */}
        <View className="bg-white rounded-3xl p-4 shadow-md border border-[#F0D7FF]">
          <Text className="text-base font-semibold text-[#1F2937] mb-2">
            Type here ✍️
          </Text>
          <View className="rounded-2xl border border-dashed border-[#7D3C98] bg-[#f9f5ff]">
            <TextInput
              multiline
              numberOfLines={6}
              value={text}
              onChangeText={setText}
              placeholder="Try a sentence. Mistakes will glow below."
              placeholderTextColor="#6b7280"
              className="text-base text-black min-h-[150px] px-3 py-3"
            />
          </View>
          <View className="flex-row items-center mt-3 space-x-2">
            <View className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <Text className="text-xs text-[#374151]">
              Instant spellcheck is on
            </Text>
          </View>
          {checking ? (
            <View className="flex-row items-center mt-2">
              <ActivityIndicator size="small" color="#7D3C98" />
              <Text className="text-sm text-black ml-2">Checking…</Text>
            </View>
          ) : null}
          {liveError ? (
            <Text className="text-red-700 mt-2 text-sm">{liveError}</Text>
          ) : null}
        </View>

        {/* Live highlights */}
        <View className="bg-white rounded-3xl p-4 mt-4 border border-[#F0D7FF] shadow-sm">
          <View className="flex-row items-center mb-2">
            <Text className="text-lg font-semibold text-[#1F2937] flex-1">
              Live underlines
            </Text>
            <Text className="text-xs text-[#6B7280]">red = needs fixing</Text>
          </View>
          {highlightedText ? (
            <Text className="text-base leading-6">{highlightedText}</Text>
          ) : (
            <Text className="text-slate-600">
              Start typing above to see misspelled words in red.
            </Text>
          )}
        </View>

        {/* Corrected box */}
        <View className="bg-[#7D3C98] rounded-3xl p-4 mt-4 shadow-lg border border-[#6B21A8]">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold text-white">
              Corrected text
            </Text>
            <View className="bg-white/20 px-2 py-1 rounded-full">
              <Text className="text-xs text-white">Tap to listen</Text>
            </View>
          </View>
          <Text className="text-white text-base leading-6">
            {correctedWithHighlight ||
              "We'll mirror a cleaned-up version here as you type."}
          </Text>
          <TouchableOpacity
            onPress={speaking ? stopSpeaking : speakText}
            className="bg-white mt-3 rounded-xl py-3 items-center"
          >
            <Text className="text-[#7D3C98] font-semibold">
              {speaking ? "Stop reading" : "🔊 Read aloud"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Button-driven full feedback */}
        <View className="bg-white rounded-3xl p-4 mt-4 shadow-sm border border-[#F0D7FF]">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-[#7D3C98] rounded-xl py-4 items-center"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Get full suggestions
              </Text>
            )}
          </TouchableOpacity>
          {error ? (
            <Text className="text-red-700 mt-2 text-sm">{error}</Text>
          ) : null}
        </View>

        {/* Output */}
        <View className="bg-white rounded-2xl p-4 mt-4 shadow-sm border border-[#F0D7FF]">
          <Text className="text-base font-semibold text-black mb-2">
            AI Feedback
          </Text>
          {loading && !response ? (
            <Text className="text-black">Thinking...</Text>
          ) : (
            <Text className="text-black">
              {response || "Your feedback will appear here."}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
