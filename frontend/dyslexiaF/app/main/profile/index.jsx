import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";




export default function Profile() {
  const router = useRouter();
  const DEFAULT_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/616/616408.png";
  


  const [user, setUser] = useState({
    username: "",
    email: "",
    phone: "",
    birthday: "",
    bio: "",
    avatar: "",
  });

  

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://192.168.0.126:5000/api/profile");
      setUser(res.data);
    } catch (err) {
      console.log("Profile fetch failed:", err.message);
    }
  };

  const saveProfile = async () => {
    await axios.put("http://192.168.0.126:5000/api/profile", user);
    alert("Profile updated successfully");
  };

  

  const pickImage = async () => {

    const { status } =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== "granted") {
    alert("Permission needed to access gallery!");
    return;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!result.canceled) {
    const imageUri = result.assets[0].uri;

    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpeg",
    });

    try {
      // console.log("🚀 Sending request...");
      const res = await axios.put(
        "http://192.168.0.126:5000/api/profile/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    
          // console.log("SERVER RESPONSE:", res.data);
      // setUser(res.data);
      setUser(prev => ({
  ...prev,
  avatar: res.data.avatar
}));

    } catch (err) {
      console.log("UPLOAD ERROR:", err.message);
      console.log("FULL ERROR:", err.toJSON?.());
    }
  }
};


  return (
    <ScrollView className="flex-1 bg-[#E6B3FF] px-5 pt-10">
      
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={26} />
      </TouchableOpacity>

      {/* Avatar */}
      <View className = "items-center">
      <TouchableOpacity onPress={pickImage}>
       <Image
        source={{ uri: user.avatar || DEFAULT_IMAGE }}
        className="w-32 h-32 rounded-full"
      />
     </TouchableOpacity>
     </View>


      {/* Inputs */}
      {[
        { label: "Username", key: "username" },
        { label: "Email", key: "email" },
        { label: "Phone No.", key: "phone" },
        { label: "Birthday", key: "birthday" },
        { label: "Bio", key: "bio" },
      ].map((field) => (
        <View key={field.key} className="mt-4">
          <Text className="mb-1">{field.label}</Text>
          <TextInput
            value={user[field.key]}
            onChangeText={(text) =>
              setUser({ ...user, [field.key]: text })
            }
            className="bg-white rounded-full px-4 py-3"
          />
        </View>
      ))}

      {/* Save Button */}
      <TouchableOpacity
        onPress={saveProfile}
        className="bg-purple-700 py-4 rounded-full mt-8"
      >
        <Text className="text-white text-center font-bold">
          Save Your Changes
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}
