import React from "react";
import { View, Text, Image, TouchableOpacity, StatusBar } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";

export default function Gamified() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#CFA7FF] items-center pt-10">

      <StatusBar backgroundColor="#CFA7FF" barStyle="dark-content" />

      {/* Top Bar */}
      <View className="w-[90%] flex-row justify-between items-center mb-2">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="person" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Puppy Image */}
      <Image
        source={require("../../../assets/images/dog.png")}
        className="w-60 h-60 -mt-5"
        resizeMode="contain"
      />

      {/* Main Card */}
      <View className="w-[88%] bg-[#F1E3FF] rounded-2xl p-4 gap-4 -mt-8">

        {/* Item 1 */}
        <TouchableOpacity
          className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-3 shadow-sm"
          onPress={() => router.push("/main/solutions/all-b-circle")}
        >
          <View className="w-11 h-11 ml-3 rounded-full bg-gray-100 justify-center items-center">
            <Text className="font-bold text-base">B</Text>
          </View>

          <View>
            <Text className="font-semibold text-[16px] text-gray-900">All B's</Text>
            <Text className="text-xs text-gray-500">Circle B</Text>
          </View>
        </TouchableOpacity>

        {/* Item 2 */}
        <TouchableOpacity
          className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-3 shadow-sm"
          onPress={() => router.push("/main/solutions/frog-rhyme")}
        >
          <Image
            source={require("../../../assets/images/frog.png")}
            className="w-10 h-10"
          />
          <Text className="font-semibold text-[16px] text-gray-900">
            Frog Rhyming Machine
          </Text>
        </TouchableOpacity>

        {/* Item 3 */}
        <TouchableOpacity
          className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-3 shadow-sm"
          onPress={() => router.push("/main/solutions/scramble")}
        >
          <Image
            source={require("../../../assets/images/scambble.png")}
            className="w-10 h-10"
          />
          <Text className="font-semibold text-[16px] text-gray-900">Scramble</Text>
        </TouchableOpacity>

        {/* Item 4 */}
        <TouchableOpacity
          className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-3 shadow-sm"
          onPress={() => router.push("/main/solutions/anagram")}
        >
          <Image
            source={require("../../../assets/images/amalgam.png")}
            className="w-10 h-10"
          />
          <Text className="font-semibold text-[16px] text-gray-900">Anagram</Text>
        </TouchableOpacity>


        <TouchableOpacity
          className="bg-white rounded-2xl px-4 py-4 flex-row items-center gap-3 shadow-sm"
          onPress={() => router.push("/main/solutions/word-match")}
        >
          <Ionicons name="grid" size={22} color="#7D3BCF" />
          <View>
            <Text className="font-semibold text-[16px] text-gray-900">Letter Match</Text>
            <Text className="text-xs text-gray-500">Find look-alike pairs</Text>
          </View>
        </TouchableOpacity>

       

      </View>

      {/* Bottom Button */}
      <TouchableOpacity
        className="absolute bottom-6 w-[85%] bg-[#7D3BCF] py-4 rounded-full items-center"
        onPress={() => router.push("/main/solutions/frog-rhyme")}
      >
        <Text className="text-white font-bold text-[16px]">
          Let's Start the Game
        </Text>
      </TouchableOpacity>

    </View>
  );
}
