import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#E6B3F7] items-center justify-center px-6">

      {/* Character Card */}
      <View className="items-center justify-center mb-6">
        <Image
          source={require("../assets/images/sqirrel.png")}
          style={{ width: 240, height: 240 }}
          resizeMode="contain"
        />
      </View>

      {/* Login */}
      <View className="w-[180]">
        <TouchableOpacity
        onPress={() => router.push("./authentication/login")}
        className="bg-[#7D3C98] w-full py-2.5 rounded-full items-center mb-4"
      >
        <Text className="text-white font-semibold text-lg">Login</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <TouchableOpacity
        onPress={() => router.push("./authentication/signup")}
        className="bg-[#7D3C98] w-full py-2.5 rounded-full items-center mb-6"
      >
        <Text className="text-white font-semibold text-lg">Sign Up</Text>
      </TouchableOpacity>
      </View>
      

      {/* Social */}
      <Text className="text-sm text-black mb-4">Or continue with</Text>

      <View className="flex-row" style={{ columnGap: 18 }}>
        <Ionicons name="logo-facebook" size={26} color="#1877F2" />
        <Ionicons name="logo-google" size={26} color="#DB4437" />
        <Ionicons name="logo-instagram" size={26} color="#C13584" />
      </View>
    </View>
  );
}













