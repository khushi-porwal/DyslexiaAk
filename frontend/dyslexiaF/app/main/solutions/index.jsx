import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#F9D976] px-5 pt-10">
      
      {/* Top Icons */}
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
                <Ionicons name="person" size={30} color="#89983c" />
              </TouchableOpacity>
            </View>
            <Text className="text-3xl font-bold text-center text-gray-800">
               Solutions
            </Text>

      {/* Owl / Mascot */}
      <View className="items-center mt-[-17]">
        <View >
          <Image
            source={require("../../../assets/images/owl.png")}
            className="w-80 h-80"
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Buttons Section */}
      <View className="gap-4 mt-[-9]">

        {/* Reading Assistant */}
        <TouchableOpacity
          onPress={() => router.push("/main/solutions/reading")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
         
          
        >
          <MaterialCommunityIcons name="book-open-page-variant" size={28} color="#89983c" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Reading Assistant</Text>
        </TouchableOpacity>

        {/* Writing Assistant */}
        <TouchableOpacity
          onPress={() => router.push("/main/solutions/writing")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
        >
          <Ionicons name="create-outline" size={28} color="#89983c" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Writing Assistant</Text>
        </TouchableOpacity>

        {/* Sequencing Assistant */}
        <TouchableOpacity
          onPress={() => router.push("/main/solutions/sequencing")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
        >
          <MaterialCommunityIcons name="view-dashboard-outline" size={28} color="#89983c" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Sequencing Assistant</Text>
        </TouchableOpacity>

        {/* Gamified Assistant */}
        <TouchableOpacity onPress={() => router.push("/main/solutions/gamified")}
          className="bg-white rounded-2xl flex-row items-center px-4 py-6"
        >
          <FontAwesome5 name="gamepad" size={24} color="#89983c" />
          <View className="h-8 w-[1px] bg-purple-700 mx-3" />
          <Text className="text-lg font-semibold text-black">Gamified Assistant</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
