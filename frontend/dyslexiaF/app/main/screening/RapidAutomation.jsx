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
import { View, Text, Pressable, Image, Alert } from "react-native";
import Svg, { Path } from "react-native-svg";
import { PanResponder } from "react-native";
import ViewShot from "react-native-view-shot";
import axios from "axios";

/* ================= ML-FRIENDLY CONSTANTS ================= */
const CANVAS_SIZE = 280;

const TARGETS = {
  apple: require("../../../assets/images/sketches/apple.png"),
  banana: require("../../../assets/images/sketches/banana.png"),
  circle: require("../../../assets/images/sketches/circle.png"),
};
/* ======================================================== */

export default function RapidDrawing() {
  const [currentTarget, setCurrentTarget] = useState("apple");
  const [paths, setPaths] = useState([]);
  const currentPath = useRef("");
  const viewShotRef = useRef(null); // 🔥 NEW

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

  /* ================= SEND TO ML ================= */
  const submitDrawing = async () => {
    try {
      const base64 = await viewShotRef.current.capture({
        format: "png",
        quality: 1,
        result: "base64",
      });

      const res = await axios.post("http://YOUR_IP:5000/predict", {
        image: base64,
        target: currentTarget,
      });

      if (res.data.correct) {
        Alert.alert("✅ Correct!", `Score: ${res.data.score}`);
      } else {
        Alert.alert("❌ Try again", "Drawing not matched");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to send drawing");
    }
  };

  return (
    <View className="flex-1 bg-green-200 p-4">
      {/* Reference Image */}
      <Image
        source={TARGETS[currentTarget]}
        style={{ width: 140, height: 140, alignSelf: "center" }}
        resizeMode="contain"
      />

      {/* ================= CAPTURED CANVAS ================= */}
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
        <View
          {...panResponder.panHandlers}
          style={{
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: "white",
            borderRadius: 16,
            marginTop: 16,
            alignSelf: "center",
          }}
        >
          <Svg width="100%" height="100%">
            {paths.map((p, i) => (
              <Path
                key={i}
                d={p}
                stroke="black"
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </Svg>
        </View>
      </ViewShot>

      {/* Controls */}
      <View className="flex-row justify-around mt-6">
        {Object.keys(TARGETS).map((key) => (
          <Pressable
            key={key}
            onPress={() => {
              setCurrentTarget(key);
              setPaths([]);
            }}
            className="bg-white px-4 py-2 rounded-full"
          >
            <Text className="font-semibold">{key}</Text>
          </Pressable>
        ))}
      </View>

      {/* Submit */}
      <Pressable
        onPress={submitDrawing}
        className="bg-purple-700 py-3 mt-6 rounded-xl"
      >
        <Text className="text-white text-center font-bold">
          Check Drawing
        </Text>
      </Pressable>
    </View>
  );
}