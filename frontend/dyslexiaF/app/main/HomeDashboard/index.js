import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function HomeDashboard() {
  const router = useRouter();

  

  return (
    <ScrollView 
      className="flex-1 bg-[#E6B3F7] px-6 pt-10"
      showsVerticalScrollIndicator={false}
    >

      {/* Top Icons */}
      <View className="flex-row justify-between items-center">
        <TouchableOpacity onPress={()=>router.back("/authentication/login")} activeOpacity={0.8}>
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
    <Ionicons name="person" size={30} color="purple" />
  </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold mt-4 text-black text-center">
        What is Dyslexia ?
      </Text>

      <Text className="text-lg mt-2  text-black leading-5 text-center text-justify">
  Dyslexia is a Neurological condition that affects how the brain processes
  language. People with Dyslexia have normal intelligence, but they struggle
  with tasks involving reading language.
</Text>

      {/* Image Card */}
      <View className=" rounded-3xl items-center  ">
        <Image
          source={require("../../../assets/images/hamster.png")} 
          className="w-80 h-80"
          resizeMode="contain"
        />
      </View>

      {/* Screening Test Button */}
      <TouchableOpacity
        onPress={() => router.push("/main/screening")}
        className="bg-white mt-3 rounded-2xl py-8 px-4 flex-row items-center"
      >
        <Ionicons name="medkit-outline" size={30} color="#7D3C98" />
        <Text className="text-lg font-semibold ml-10 text-black">
          Screening & Diagnosis Test
        </Text>
      </TouchableOpacity>

      {/* Solutions Button */}
      <TouchableOpacity
        onPress={() => router.push("/main/solutions")}
        className="bg-[#7D3C98] mt-3 rounded-2xl py-8 px-6 flex-row items-center"
      >
        <Ionicons name="reader-outline" size={30} color="white" />
        <Text className="text-lg font-semibold ml-20 text-white">
          Solutions
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
