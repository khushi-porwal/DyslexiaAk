import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F9D976] px-5 pt-10">
      
      {/* Top Icons */}
      <View className="flex-row justify-between px-2 mb-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Image
            source={require("../../../assets/images/profile.png")}
            className="w-48 h-48"
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Owl / Mascot */}
      <View className="items-center mt-[-17]">
        <View >
          <Image
            source={require("../../../assets/images/owl.png")}
            className="w-48 h-48"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Buttons Section */}
      <View className="space-y-4">

        {/* Reading Assistant */}
        <TouchableOpacity
          onPress={() => router.push("/main/solutions/writing")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
          onPress={() => router.push("/main/solutions/reading")}
          
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#7D3C98" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Reading Assistant</Text>
        </TouchableOpacity>

        {/* Writing Assistant */}
        <TouchableOpacity
          onPress={() => router.push("/main/solutions/writing")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
        >
          <Ionicons name="create-outline" size={28} color="#7D3C98" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Writing Assistant</Text>
        </TouchableOpacity>

        {/* Sequencing Assistant */}
        <TouchableOpacity
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
        >
          <MaterialCommunityIcons name="view-dashboard-outline" size={28} color="#7D3C98" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Sequencing Assistant</Text>
        </TouchableOpacity>

        {/* Gamified Assistant */}
        <TouchableOpacity onPress={() => router.push("/main/solutions/gamified")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
        >
          <FontAwesome5 name="gamepad" size={24} color="#7D3C98" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Gamified Assistant</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
