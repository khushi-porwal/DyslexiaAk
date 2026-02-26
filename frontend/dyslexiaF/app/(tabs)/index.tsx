// import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
// import { useState } from "react";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// export default function SignUpScreen() {
//   const router = useRouter();
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSignUp = () => {
//     console.log(name, email, password);
//     // connect backend / firebase here
//   };

//   return (
//     <View className="flex-1 bg-purple-300 px-5">

//       <TouchableOpacity className="top-10"onPress={() => router.back()}>
//       <Ionicons name="arrow-back" size={24} color="black" />
//       </TouchableOpacity>
//       {/* Header */}
//       <Text className="text-3xl font-bold text-center mt-3">
//         Dyslexia Companion
//       </Text>
//       <Text className="text-xs text-center text-gray-600 mb-4">
//         Empowering Every Learner
//       </Text>

//       {/* Image Card */}
//       <View className="bg-purple-200 rounded-2xl items-center mt-20 h-40">
//         <Image
//           source={require("../../assets/images/Monkey.png")}
//           className="mt-[-90]"
//           resizeMode="contain"
//         />
//       </View>

//       {/* Sign Up */}
//       <Text className="text-2xl font-semibold text-center mt-20">
//         Sign Up
//       </Text>

//       {/* Name */}
//       <Text className="text-sm mb-1">Name</Text>
//       <TextInput
//         className="bg-white rounded-full px-4 py-3 mb-3"
//         placeholder="Enter your name"
//         value={name}
//         onChangeText={setName}
//       />

//       {/* Email */}
//       <Text className="text-sm mb-1">Email</Text>
//       <TextInput
//         className="bg-white rounded-full px-4 py-3 mb-3"
//         placeholder="Enter your email"
//         keyboardType="email-address"
//         autoCapitalize="none"
//         value={email}
//         onChangeText={setEmail}
//       />

//       {/* Password */}
//       <Text className="text-sm mb-1">Password</Text>
//       <TextInput
//         className="bg-white rounded-full px-4 py-3 mb-5"
//         placeholder="Enter your password"
//         secureTextEntry
//         value={password}
//         onChangeText={setPassword}
//       />

//       {/* Button */}
//       <View className="items-center mt-2">
//         <TouchableOpacity
//           className="bg-purple-700 py-5 w-[200px] rounded-full items-center"
//           onPress={handleSignUp}
//         >
//           <Text className="text-white font-semibold">Sign In</Text>
//         </TouchableOpacity>
//       </View>


//       {/* Login */}
//       <Text className="text-center text-xs mt-2">
//         Already having an account?{" "}
//         <Text
//           className="text-purple-700 font-semibold"
//           onPress={() => router.push("/(tabs)/explore")}
//         >
//           Login
//         </Text>
//       </Text>

//     </View>
//   );
// }
