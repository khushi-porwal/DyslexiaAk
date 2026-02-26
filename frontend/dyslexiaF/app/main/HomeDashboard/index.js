import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/profile")}>
          <Ionicons name="person-circle-outline" size={30} color="black" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text className="text-2xl font-bold mt-4 text-black">
        What is Dyslexia ?
      </Text>

      <Text className="text-sm mt-1 text-black leading-5">
        Dyslexia is a Neurological condition that affects how the brain processes
        language. People with Dyslexia have normal intelligence, but they struggle
        with tasks involving reading language.
      </Text>

      {/* Image Card */}
      <View className=" rounded-3xl items-center  ">
        <Image
          source={require("../../../assets/images/hamster.png")} 
          className="w-48 h-48"
          resizeMode="contain"
        />
      </View>

      {/* Screening Test Button */}
      <TouchableOpacity
        onPress={() => router.push("/main/screening")}
        className="bg-white mt-4 rounded-2xl py-6 px-6 flex-row items-center"
      >
        <Ionicons name="medkit-outline" size={28} color="#7D3C98" />
        <Text className="text-lg font-semibold ml-10 text-black">
          Screening & Diagnosis Test
        </Text>
      </TouchableOpacity>

      {/* Solutions Button */}
      <TouchableOpacity
        onPress={() => router.push("/main/solutions")}
        className="bg-[#7D3C98] mt-4 rounded-2xl py-6 px-6 flex-row items-center"
      >
        <Ionicons name="reader-outline" size={28} color="white" />
        <Text className="text-lg font-semibold ml-20 text-white">
          Solutions
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}