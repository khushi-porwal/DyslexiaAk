import API from "../api/axios";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function SignUpScreen() {
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
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

  const handleSignUp = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      await API.post("/api/auth/signup", { name, email, password });
      Alert.alert("Success", "Account created!");
      router.push("/authentication/login");
    } catch (err) {
      console.log(err.response?.data);
      Alert.alert("Signup Failed", err.response?.data?.message || "Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: "#E6B3F7" }}
      contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 48, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="text-3xl text-center font-bold text-black mt-2">
          Dyslexia Companion
        </Text>
        <Text className="text-sm text-center text-gray-700">
          Empowering Every Learner
        </Text>

        <View className="items-center mt-1 mb-0">
          <Image
            source={require("../../assets/images/Monkey.png")}
            style={{ width: 280, height: 280 }}
            resizeMode="contain"
          />
        </View>

        <Text
          className="text-3xl font-semibold text-center"
          style={{ marginTop: -12 }}
        >
          Sign Up
        </Text>

        <Text className="text-sm mb-1 mt-0">Name</Text>
        <TextInput
          className="bg-white rounded-full px-5 py-3 mb-2"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text className="text-sm mb-1 mt-0.5">Email</Text>
        <TextInput
          className="bg-white rounded-full px-5 py-3 mb-2"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text className="text-sm mb-1 mt-0.5">Password</Text>
        <TextInput
          className="bg-white rounded-full px-5 py-3 mb-2"
          placeholder="Enter your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View className="items-center mt-0.5 mb-1">
          <TouchableOpacity
            className="bg-[#8E44AD] w-[200px] py-3 rounded-full items-center"
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-lg">
              {loading ? "..." : "Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-center mt-1 mb-2">
        <Text className="text-black text-sm">Already have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/authentication/login")}>
          <Text className="text-purple-800 font-semibold text-sm ml-1">Log In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
