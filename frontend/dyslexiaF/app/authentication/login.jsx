import AsyncStorage from '@react-native-async-storage/async-storage';
import API from "../api/axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function LoginPreview() {
  const router = useRouter();
  // 🔹 STATES
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 BASIC VALIDATION
  const validateInputs = () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Error", "Enter a valid email");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // 🔹 LOGIN HANDLER (BACKEND READY)
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email & password are required");
      return;
    }

    // Optional: Use the validation function
    if (!validateInputs()) {
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/api/auth/login", {
        email,
        password,
      });

      console.log("Login Success:", res.data);

      // Store tokens
      await AsyncStorage.setItem("token", res.data.token);
      
      if (res.data.refreshToken) {
        await AsyncStorage.setItem("refreshToken", res.data.refreshToken);
      }

      Alert.alert("Success", "Logged in successfully!");
      
      // Navigate to home
      router.push("/main/HomeDashboard");
      
    } catch (err) {
      console.log("Login Error:", err?.response?.data || err?.message || err);
      
      Alert.alert(
        "Login Failed",
        err?.response?.data?.message || err?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: "#E6B3F7" }}
      contentContainerStyle={{
        paddingHorizontal: 22,
        paddingTop: 20,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      {/* App Title */}
      <Text className="text-3xl text-center font-bold text-black mt-2">
        Dyslexia Companion
      </Text>
      <Text className="text-sm text-center text-gray-700">
        Empowering Every Learner
      </Text>

      {/* Fox */}
      <View className="items-center ">
        <Image
          source={require("../../assets/images/Fox.png")}
          className="w-40 h-40"
        />
      </View>

      {/* Login */}
      <Text className="text-3xl font-semibold text-center -mt-6 ">
        Login
      </Text>

      {/* Name */}
      <Text className="text-sm mb-1">Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        className="bg-white rounded-full px-5 py-3 mb-3"
        placeholder="Enter your name"
      />

      {/* Email */}
      <Text className="text-sm mb-1">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-white rounded-full px-5 py-3 mb-3"
        placeholder="Enter your email"
      />

      {/* Password */}
      <Text className="text-sm mb-1">Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="bg-white rounded-full px-5 py-3 mb-5"
        placeholder="Enter your password"
      />

      {/* Login Button */}
      <View className="items-center mt-2">
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className="bg-[#8E44AD] w-[200px]  py-3 rounded-full items-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white  font-semibold text-lg">
              Log In
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Signup */}
      <View className="flex-row justify-center mt-4">
        <Text className="text-black text-sm">
          Don't have an account?
        </Text>
        <TouchableOpacity onPress={() => router.push("/authentication/signup")}>
          <Text className="text-purple-800 font-semibold text-sm ml-1">
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}