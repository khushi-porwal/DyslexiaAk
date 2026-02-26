// import React, { useRef, useState } from "react";
// import { View, Text, Pressable, Image } from "react-native";
// import Svg, { Path } from "react-native-svg";
// import { PanResponder } from "react-native";

// /* ================= ML-FRIENDLY CONSTANTS ================= */
// const CANVAS_SIZE = 280; // multiple of 28 → perfect for ML resize

// const TARGETS = {
//   apple: require("../../../assets/images/sketches/apple.png"),
//   banana: require("../../../assets/images/sketches/banana.png"),
//   circle: require("../../../assets/images/sketches/circle.png"),
// };
// /* ======================================================== */

// export default function RapidDrawing() {
//   const [currentTarget, setCurrentTarget] = useState("apple");
//   const [paths, setPaths] = useState([]);
//   const currentPath = useRef("");

//   const panResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,

//     onPanResponderGrant: (e) => {
//       const { locationX, locationY } = e.nativeEvent;
//       currentPath.current = `M ${locationX} ${locationY}`;
//       setPaths((prev) => [...prev, currentPath.current]);
//     },

//     onPanResponderMove: (e) => {
//       const { locationX, locationY } = e.nativeEvent;
//       currentPath.current += ` L ${locationX} ${locationY}`;
//       setPaths((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1] = currentPath.current;
//         return updated;
//       });
//     },
//   });

//   return (
//     <View className="flex-1 bg-green-200 p-4">
//       {/* ================= Reference Image ================= */}
//       <Image
//         source={TARGETS[currentTarget]}
//         style={{ width: 140, height: 140, alignSelf: "center" }}
//         resizeMode="contain"
//       />

//       {/* ================= Drawing Canvas ================= */}
//       <View
//         {...panResponder.panHandlers}
//         style={{
//           width: CANVAS_SIZE,
//           height: CANVAS_SIZE,
//           backgroundColor: "white",
//           borderRadius: 16,
//           marginTop: 16,
//           alignSelf: "center",
//         }}
//       >
//         <Svg width="100%" height="100%">
//           {paths.map((p, i) => (
//             <Path
//               key={i}
//               d={p}
//               stroke="black"
//               strokeWidth={8}              // 🔥 ML-safe stroke
//               fill="none"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           ))}
//         </Svg>
//       </View>

//       {/* ================= Controls ================= */}
//       <View className="flex-row justify-around mt-6">
//         {Object.keys(TARGETS).map((key) => (
//           <Pressable
//             key={key}
//             onPress={() => {
//               setCurrentTarget(key);
//               setPaths([]);               // 🔒 REQUIRED for ML accuracy
//             }}
//             className="bg-white px-4 py-2 rounded-full"
//           >
//             <Text className="font-semibold">{key}</Text>
//           </Pressable>
//         ))}
//       </View>
//     </View>
//   );
// }



















import React, { useRef, useState } from "react";
import { View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PanResponder } from "react-native";
import ViewShot from "react-native-view-shot";
import axios from "axios";

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
      setLoading(true);
      setResult(null);

      const base64 = await viewShotRef.current.capture({
        format: "png",
        quality: 1,
        result: "base64",
      });

      const res = await axios.post(
        "http://192.168.0.183:5000/api/drawings/check",
        {
          image: `data:image/png;base64,${base64}`, // 🔥 REQUIRED
          target: currentTarget,
        },
        { timeout: 15000 }
      );

      setResult(res.data);
    } catch (err) {
      console.log("❌ API ERROR:", err.response?.data || err.message);
      setResult({ error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-green-300">
      {/* ================= HEADER ================= */}
      <View className="bg-green-700 py-4 rounded-b-3xl">
        <Text className="text-center text-xl font-bold text-white">
          Rapid Automated Writing
        </Text>
      </View>

      {/* ================= REFERENCE IMAGE ================= */}
      <View className="bg-white mx-4 mt-4 rounded-2xl p-3 items-center shadow">
        <Text className="text-sm text-gray-600 mb-2">Draw this</Text>
        <Image
          source={TARGETS[currentTarget]}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
      </View>

      {/* ================= DRAWING CANVAS ================= */}
      <ViewShot ref={viewShotRef}>
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
                strokeWidth={10} // 🔥 ML-OPTIMAL
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        </View>
      </ViewShot>

      {/* ================= WORD SELECT ================= */}
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

      {/* ================= SUBMIT BUTTON ================= */}
      <Pressable
        onPress={submitDrawing}
        className="bg-green-800 mx-6 py-4 rounded-2xl mt-6"
      >
        <Text className="text-white text-center text-lg font-bold">
          Show me the result
        </Text>
      </Pressable>

      {/* ================= CLEAR BUTTON ================= */}
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

      {/* ================= LOADING ================= */}
      {loading && (
        <View className="mt-4">
          <ActivityIndicator size="large" color="#064e3b" />
          <Text className="text-center mt-2 text-white font-semibold">
            Checking your drawing…
          </Text>
        </View>
      )}

      {/* ================= RESULT CARD ================= */}
      {result && !loading && !result.error && (
        <View className="mx-6 mt-4 bg-white rounded-xl p-4">
          <Text className="text-lg font-bold">
            {result.correct ? "✅ Correct!" : "❌ Try Again"}
          </Text>

          <Text className="mt-1">
            Prediction: {result.predicted}
          </Text>

          {/* Confidence Bar */}
          <View className="h-3 bg-gray-300 rounded-full mt-3">
            <View
              style={{ width: `${result.confidence * 100}%` }}
              className="h-3 bg-green-600 rounded-full"
            />
          </View>

          <Text className="text-sm mt-1">
            Confidence: {Math.round(result.confidence * 100)}%
          </Text>
        </View>
      )}

      {/* ================= ERROR CARD ================= */}
      {result?.error && (
        <View className="mx-6 mt-4 bg-red-100 rounded-xl p-4">
          <Text className="text-red-700 font-semibold text-center">
            Could not check drawing. Please try again.
          </Text>
        </View>
      )}
    </View>
  );
}