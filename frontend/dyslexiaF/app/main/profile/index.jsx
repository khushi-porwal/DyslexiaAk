import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../api/axios";
import { useFocusEffect } from "@react-navigation/native";




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
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  

  useEffect(() => {
    preloadCached();
    fetchProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const preloadCached = async () => {
    const cachedName = await AsyncStorage.getItem("profile_name");
    const cachedEmail = await AsyncStorage.getItem("profile_email");
    setUser((prev) => ({
      ...prev,
      username: cachedName || prev.username,
      email: cachedEmail || prev.email,
    }));
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get("http://192.168.0.93:5000/api/profile");
      setUser(res.data);
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const res = await API.get("/api/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.data) setUser(res.data);
    } catch (err) {
      console.log("Profile fetch failed:", err.message);
    }
    setLoading(false);
  };

  const saveProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await API.put("/api/profile", user, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      alert("Profile updated successfully");
      setEditMode(false);
      await AsyncStorage.setItem("profile_name", user.username || "");
      await AsyncStorage.setItem("profile_email", user.email || "");
    } catch (err) {
      alert("Update failed");
    }
  };

  

//   const pickImage = async () => {
//     console.log("Hi");
//     const { status } =
//     await ImagePicker.requestMediaLibraryPermissionsAsync();

//   if (status !== "granted") {
//     alert("Permission needed to access gallery!");
//     return;
//   }
//   const result = await ImagePicker.launchImageLibraryAsync({
//     mediaTypes: ImagePicker.MediaTypeOptions.Images,
//     quality: 0.7,
//   });

//   if (!result.canceled) {
//     const imageUri = result.assets[0].uri;

//     const formData = new FormData();

//     formData.append("avatar", {
//       uri: imageUri,
//       name: "profile.jpg",
//       type: "image/jpeg",
//     });    

//     try {
//       console.log("🚀 Sending request...");
     
//       const res = await axios.put(
//         "http://192.168.0.126:5000/api/profile/avatar",
//       formData,
//       // { headers: { "Content-Type": "multipart/form-data" } }
//     );

    
//           // console.log("SERVER RESPONSE:", res.data);
//       // setUser(res.data);
//       setUser(prev => ({
//   ...prev,
//   avatar: res.data.avatar
// }));

//     } catch (err) {
//       console.log("UPLOAD ERROR:", err.message);
//       console.log("FULL ERROR:", err.toJSON?.());
//     }
//   }
// };


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

  if (result.canceled) return;

  const imageUri = result.assets[0].uri;
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    formData.append("avatar", blob, "profile.jpg");
  } else {
    formData.append("avatar", {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpeg",
    });
    console.log("image data :");
    console.log(imageUri);
  }

  try {
    const token = await AsyncStorage.getItem("token");
    const res = await API.put(
      "/api/profile/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        transformRequest: (data) => data,
      }
    );
    console.log("✅ Upload Success:", res.data);

    const newAvatar = res.data?.avatar || imageUri;
    setUser((prev) => ({
      ...prev,
      avatar: newAvatar,
    }));

  } catch (err) {
    console.log("❌ Upload Error:", err.response?.data || err.message);
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


      {/* Completion badge */}
      <View className="mt-4 items-center">
        {["username","email","phone","birthday","bio"].every((k)=>user[k]) ? (
          <Text className="text-green-800 font-semibold">Profile complete</Text>
        ) : (
          <Text className="text-orange-700 font-semibold">Complete your profile</Text>
        )}
      </View>

      {/* Edit toggle */}
      <View className="mt-4 items-center">
        <TouchableOpacity
          className="bg-white px-4 py-2 rounded-full border border-purple-500"
          onPress={() => setEditMode((e) => !e)}
        >
          <Text className="text-purple-700 font-semibold">
            {editMode ? "Cancel Edit" : "Edit Profile"}
          </Text>
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
            editable={editMode}
            className={`bg-white rounded-full px-4 py-3 ${editMode ? "" : "opacity-60"}`}
          />
        </View>
      ))}

      {/* Save Button */}
      {editMode ? (
        <TouchableOpacity
          onPress={saveProfile}
          className="bg-purple-700 py-4 rounded-full mt-8"
        >
          <Text className="text-white text-center font-bold">
            Save Your Changes
          </Text>
        </TouchableOpacity>
      ) : null}

    </ScrollView>
  );
}
