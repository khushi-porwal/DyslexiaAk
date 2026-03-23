import React, { useRef, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Image,
  ActivityIndicator,
  PanResponder,
  Alert,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import ViewShot from "react-native-view-shot";
import axios from "axios";
import { getBackendUrl } from "../../../constants/api";
import { saveScreeningResult } from "../../../constants/progressStorage";

const CANVAS_SIZE = 280;

const TARGETS = {
  apple: require("../../../assets/images/sketches/apple.png"),
  banana: require("../../../assets/images/sketches/banana.png"),
  circle: require("../../../assets/images/sketches/circle.png"),
};

export default function RapidDrawing() {
  const [currentTarget, setCurrentTarget] = useState("apple");
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const currentPath = useRef("");
  const viewShotRef = useRef(null);

  /* ================= DRAWING ================= */

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPath.current = `M ${locationX} ${locationY}`;
      setPaths((prev) => [...prev, currentPath.current]);
    },

    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      currentPath.current += ` L ${locationX} ${locationY}`;

      setPaths((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = currentPath.current;
        return updated;
      });
    },
  });

  /* ================= SEND TO BACKEND ================= */

  const submitDrawing = async () => {
    try {
      if (paths.length === 0) {
        Alert.alert("Draw something first!");
        return;
      }

      setLoading(true);
      setResult(null);

      const base64 = await viewShotRef.current.capture({
        format: "png",
        quality: 1,
        result: "base64",
      });

      console.log("Image size:", base64.length);

      const backend = getBackendUrl();
      const res = await axios.post(
        `${backend}/api/drawings/check`,
        {
          image: base64,
          target: currentTarget,
        },
        { timeout: 15000 }
      );

      const payload = res.data;
      setResult(payload);

      if (payload?.success) {
        await saveScreeningResult("rapid_automation", {
          target: currentTarget,
          predicted: payload.predicted,
          correct: !!payload.correct,
        });
      }
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      setResult({ error: true, message: err.response?.data?.message || "Could not check drawing" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-green-300">

      {/* HEADER */}

      <View className="bg-green-700 py-4 rounded-b-3xl">
        <Text className="text-center text-xl font-bold text-white">
          Rapid Automated Writing
        </Text>
      </View>

      {/* TARGET IMAGE */}

      <View className="bg-white mx-4 mt-4 rounded-2xl p-3 items-center">
        <Text className="text-sm text-gray-600 mb-2">Draw this</Text>

        <Image
          source={TARGETS[currentTarget]}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
      </View>

      {/* DRAWING CANVAS */}

      <ViewShot
  ref={viewShotRef}
  collapsable={false}
  options={{ format: "png", quality: 1, result: "base64" }}
>
  <View
    {...panResponder.panHandlers}
    style={{
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: "white",
      borderRadius: 20,
      marginTop: 16,
      alignSelf: "center",
      elevation: 5,
    }}
  >
    <Svg width="100%" height="100%">
      {paths.map((p, i) => (
        <Path
          key={i}
          d={p}
          stroke="black"
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  </View>
</ViewShot>

      {/* WORD SELECTOR */}

      <View className="flex-row justify-center flex-wrap mt-4 gap-3">

        {Object.keys(TARGETS).map((key) => (
          <Pressable
            key={key}
            onPress={() => {
              setCurrentTarget(key);
              setPaths([]);
              setResult(null);
            }}
            className={`px-4 py-2 rounded-full ${
              currentTarget === key ? "bg-green-700" : "bg-white"
            }`}
          >
            <Text
              className={`font-semibold ${
                currentTarget === key ? "text-white" : "text-black"
              }`}
            >
              {key}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* SUBMIT BUTTON */}

      <Pressable
        onPress={submitDrawing}
        className="bg-green-800 mx-6 py-4 rounded-2xl mt-6"
      >
        <Text className="text-white text-center text-lg font-bold">
          Show me the result
        </Text>
      </Pressable>

      {/* CLEAR BUTTON */}

      <Pressable
        onPress={() => {
          setPaths([]);
          setResult(null);
        }}
        className="bg-red-500 mx-6 py-3 rounded-xl mt-3"
      >
        <Text className="text-white text-center font-semibold">
          Clear Canvas
        </Text>
      </Pressable>

      {/* LOADING */}

      {loading && (
        <View className="mt-4">
          <ActivityIndicator size="large" color="#064e3b" />
          <Text className="text-center mt-2 text-white font-semibold">
            Checking your drawing…
          </Text>
        </View>
      )}

      {/* RESULT */}

      {result && !loading && result.success && (
        <View className="mx-6 mt-4 bg-white rounded-xl p-4">

          <Text className="text-lg font-bold">
            {result.correct ? "✅ Correct!" : "❌ Wrong"}
          </Text>

          <Text className="mt-2">
            Expected: <Text className="font-semibold">{currentTarget}</Text>
          </Text>

          <Text className="mt-1">
            You drew: <Text className="font-semibold">{result.predicted}</Text>
          </Text>

          <View className="mt-3 bg-gray-100 rounded-lg p-3">
            <Text className="text-sm text-gray-700">
              {result.correct
                ? "Great job! Your drawing matches the target."
                : "Nice attempt! Try focusing on the overall shape and proportions."}
            </Text>
          </View>
        </View>
      )}

      {/* ERROR */}

      {result && !result.success && (
        <View className="mx-6 mt-4 bg-red-100 rounded-xl p-4">
          <Text className="text-red-700 font-semibold text-center">
            {result.message || "Could not check drawing. Please try again."}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
