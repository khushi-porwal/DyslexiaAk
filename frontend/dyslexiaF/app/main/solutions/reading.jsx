import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import * as ImagePicker from "expo-image-picker";
// Using legacy FS API to avoid v54 migration issues
import * as FileSystem from "expo-file-system/legacy";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import API from "../../api/axios";
import { ScrollView } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const articles = [
  {
    id: "1",
    title: "Dyslexia and the Brain: What Does Current Research Tell Us?",
    authors: [
      "Roxanne F. Hudson",
      "Leslie High",
      "Stephanie Al Otaiba",
    ],
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    url: "https://www.readingrockets.org/article/dyslexia-and-brain-what-does-current-research-tell-us",
  },
  {
    id: "2",
    title: "Too Many Schools Are Misdiagnosing Dyslexia",
    authors: ["Sarah Carr"],
    image:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80",
    url: "https://hechingerreport.org/too-many-schools-are-misdiagnosing-dyslexia/",
  },
];

const purpleButton = {
  borderRadius: 18,
  padding: 16,
  alignItems: "center",
  height: 64,
  justifyContent: "center",
  backgroundColor: "#A86DFC",
};
const sideButton = {
  backgroundColor: "#A86DFC",
  borderRadius: 14,
  height: 44,
  width: 44,
  alignItems: "center",
  justifyContent: "center",
};

export default function ReadingAssistantScreen() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [helperText, setHelperText] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [chunks, setChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pendingChunk, setPendingChunk] = useState(null);

  const baseURL = useMemo(() => API?.defaults?.baseURL || "", []);
  const hasText = useMemo(
    () => extractedText.trim().length > 0,
    [extractedText]
  );

  const speakText = (text) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  };

  const getAuthHeader = async () => {
    const token = await AsyncStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const updateExtracted = (newChunk) => {
    const updated = extractedText ? `${extractedText}\n${newChunk}` : newChunk;
    setExtractedText(updated);
    setChunks(chunkText(updated));
    setCurrentChunk(null);
    setPendingChunk(null);
  };

  const pickImageAndScan = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setHelperText("Gallery permission is required to scan text.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        await sendImageForScan(uri);
      }
    } catch (error) {
      setHelperText(error.message);
    }
  };

  const captureImageAndScan = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setHelperText("Camera permission is required to scan text.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        await sendImageForScan(uri);
      }
    } catch (error) {
      setHelperText(error.message || "Camera scan failed.");
    }
  };

  const sendImageForScan = async (uri) => {
    try {
      setLoading(true);
      setHelperText("Scanning image...");

      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "scan.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(
        `${baseURL}/api/reading-assistant/scan`,
        {
          method: "POST",
          headers: await getAuthHeader(),
          body: formData,
        }
      );

      const data = await response.json();

      if (data?.text) {
        updateExtracted(data.text);
        setHelperText("Image scanned successfully.");
      } else {
        setHelperText(data?.message || "Could not read text.");
      }
    } catch (error) {
      setHelperText(error.message || "Scan failed.");
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (permission.status !== "granted") {
      setHelperText("Microphone permission is required.");
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: rec } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    setRecording(rec);
    setVoiceStatus("Listening...");
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setVoiceStatus("Processing voice...");
      await sendAudioForTranscription(uri);
    } catch (error) {
      setHelperText(error.message || "Could not stop recording.");
      setRecording(null);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const sendAudioForTranscription = async (uri) => {
    try {
      setLoading(true);
      const info = await FileSystem.getInfoAsync(uri);
      const formData = new FormData();

      formData.append("audio", {
        uri,
        name: `voice.${info.uri.split(".").pop() || "m4a"}`,
        type: "audio/m4a",
      });

      const response = await fetch(
        `${baseURL}/api/reading-assistant/transcribe`,
        {
          method: "POST",
          headers: await getAuthHeader(),
          body: formData,
        }
      );

      const data = await response.json();
      if (data?.text) {
        updateExtracted(data.text);
        setHelperText("Voice transcribed.");
      } else {
        setHelperText(data?.message || "Could not transcribe audio.");
      }
    } catch (error) {
      setHelperText(error.message || "Transcription failed.");
    } finally {
      setLoading(false);
      setVoiceStatus("");
    }
  };

  const handleTranslate = async () => {
    const textToTranslate = extractedText.trim() || inputText.trim();
    if (!textToTranslate) {
      setHelperText("Add some text first.");
      return;
    }

    try {
      setLoading(true);
      setHelperText("Translating to Hindi...");
      const { data } = await API.post(
        "/api/reading-assistant/translate",
        { text: textToTranslate, targetLang: "hi" },
        { headers: await getAuthHeader() }
      );

      if (data?.text) {
        setHelperText("Translated to Hindi.");
        setExtractedText(data.text);
        setChunks(chunkText(data.text));
        setCurrentChunk(null);
      } else {
        setHelperText(data?.message || "Translation issue.");
      }
    } catch (error) {
      setHelperText(
        error.response?.data?.message || "Translation failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (item) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      onPress={() => item.url && Linking.openURL(item.url)}
    >
      <View className="bg-[#D9A8FF] rounded-2xl overflow-hidden mb-4 shadow-md">
        <Image
          source={{ uri: item.image }}
          className="w-full h-44"
          resizeMode="cover"
        />
        <View className="p-3">
          <Text className="text-[16px] font-bold text-[#2f0a44] mb-1">
            {item.title}
          </Text>
          <Text className="text-[13px] text-[#2f0a44] underline">
            By: {item.authors.join(", ")}
          </Text>
          <Text className="text-[12px] text-[#4b2c69] mt-2">Tap to read</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const chunkText = (text) => {
    if (!text) return [];
    const pieces = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return pieces.length ? pieces : [text.trim()];
  };

  const speakChunks = (startIndex = 0) => {
    if (!chunks.length || startIndex >= chunks.length) {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentChunk(null);
      return;
    }
    const text = chunks[startIndex];
    setCurrentChunk(startIndex);
    setPendingChunk(startIndex);
    setIsSpeaking(true);
    Speech.speak(text, {
      rate: 1.0,
      pitch: 1.0,
      onDone: () => speakChunks(startIndex + 1),
      onStopped: () => {},
    });
  };

  const handleStartReading = () => {
    const text = extractedText.trim() || inputText.trim();
    if (!text) {
      setHelperText("Add some text first to read aloud.");
      return;
    }
    Speech.stop();
    const newChunks = chunkText(text);
    setChunks(newChunks);
    setIsPaused(false);
    speakChunks(0);
  };

  const handlePause = () => {
    Speech.stop();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleResume = () => {
    const resumeIndex =
      pendingChunk !== null ? pendingChunk : currentChunk !== null ? currentChunk : 0;
    speakChunks(resumeIndex);
    setIsPaused(false);
  };

  const handleStop = () => {
    Speech.stop();
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentChunk(null);
    setPendingChunk(null);
  };

  const handleSkip = () => {
    const nextIndex =
      (pendingChunk !== null ? pendingChunk : currentChunk !== null ? currentChunk : -1) + 1;
    Speech.stop();
    speakChunks(nextIndex);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#CFA7FF]">
      <StatusBar style="dark" backgroundColor="#CFA7FF" />

      <LinearGradient
        colors={["#D8B7FF", "#CFA7FF"]}
        style={{ flex: 1 }}
      >
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row justify-between items-center mb-2">
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

          <TouchableOpacity 
          onPress={() => router.push("/main/profile")}
          className="w-10 h-10 rounded-full items-center justify-center">
            <Ionicons name="person" size={30} color="#521b71" />
          </TouchableOpacity>
        </View>

        <Text className="text-[26px] font-extrabold text-center text-[#2f0a44]">
          Reading Assistant
        </Text>

        <View className="mt-5 bg-white/95 rounded-3xl px-4 py-3 flex-row items-center shadow-lg">
          <TextInput
            className="flex-1 text-base text-[#2f0a44]"
            placeholder="Typing"
            placeholderTextColor="#8760c7"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity onPress={captureImageAndScan}>
            <Ionicons name="scan" size={22} color="#7D3BCF" />
          </TouchableOpacity>
        </View>

        {helperText ? (
          <Text className="mt-2 text-sm text-[#2f0a44]">
            {helperText}
          </Text>
        ) : null}

        <View className="flex-row justify-between mt-4">
          <TouchableOpacity
            className="flex-1 mx-1"
            onPress={pickImageAndScan}
          >
            <LinearGradient colors={["#B87BFF", "#7D3BCF"]} style={purpleButton}>
              <MaterialCommunityIcons
                name="camera-enhance"
                size={26}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 mx-1"
            onPress={handleTranslate}
          >
            <LinearGradient colors={["#7BC5FF", "#7D3BCF"]} style={purpleButton}>
              <MaterialCommunityIcons
                name="translate"
                size={26}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 mx-1"
            onPress={toggleRecording}
          >
            <LinearGradient colors={["#FF9A9E", "#7D3BCF"]} style={purpleButton}>
              <Ionicons
                name={recording ? "stop-circle" : "mic"}
                size={26}
                color="#fff"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {voiceStatus ? (
          <Text className="text-sm mt-2 text-[#2f0a44]">
            {voiceStatus}
          </Text>
        ) : null}

        {loading ? (
          <View className="mt-3 flex-row items-center">
            <ActivityIndicator color="#7D3BCF" />
            <Text className="ml-2 text-[#2f0a44]">Working...</Text>
          </View>
        ) : null}

        {/* Extracted text area */}
        <View className="mt-4 bg-white/95 rounded-3xl p-3 shadow-lg">
          <Text className="text-base font-semibold text-[#2f0a44] mb-2">
            Extracted Text
          </Text>
          {(!extractedText && chunks.length === 0) ? (
            <Text className="text-sm text-[#6b4a99]">
              Scan from camera or gallery to see text here.
            </Text>
          ) : (
            <View className="flex-row">
              <ScrollView
                style={{ maxHeight: 260, flex: 1 }}
                contentContainerStyle={{ paddingBottom: 6 }}
                showsVerticalScrollIndicator={true}
              >
                {(chunks.length ? chunks : extractedText.split(/\n+/))?.map((t, idx) => (
                  <View
                    key={`${idx}-${t.slice(0, 8)}`}
                    className="mb-2"
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      backgroundColor:
                        currentChunk === idx ? "#E9D7FF" : "transparent",
                    }}
                  >
                    <Text
                      className="text-sm text-[#2f0a44]"
                      style={{
                        fontWeight: currentChunk === idx ? "700" : "400",
                      }}
                    >
                      {t}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View className="ml-2 justify-between items-center py-2">
                <TouchableOpacity onPress={handleStartReading}>
                  <View style={sideButton}>
                    <Ionicons name="play" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePause}>
                  <View style={sideButton}>
                    <Ionicons name="pause" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResume}>
                  <View style={sideButton}>
                    <Ionicons name="play-forward" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSkip}>
                  <View style={sideButton}>
                    <Ionicons name="play-skip-forward" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleStop}>
                  <View style={sideButton}>
                    <Ionicons name="stop" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* News section scrolls independently */}
        <View className="mt-5 flex-1">
          <Text className="text-lg font-semibold text-[#2f0a44] mb-2">
            Reading News
          </Text>
          <ScrollView
            style={{ maxHeight: 360 }}
            showsVerticalScrollIndicator={false}
          >
            {articles.map((item) => renderCard(item))}
          </ScrollView>
        </View>
      </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
