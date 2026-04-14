import { Platform } from "react-native";
import Constants from "expo-constants";

/**
 * Resolve backend URL across Expo web, Android emulator, iOS simulator,
 * and physical devices. Prefer EXPO_PUBLIC_API_URL when set.
 */
export const getBackendUrl = () => {
  const envUrl =
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.EXPO_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoConfig?.host ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.hostUri;

  // Extract LAN IP from hostUri like "192.168.0.181:19000"
  if (hostUri && hostUri.includes(":")) {
    const host = hostUri.split(":")[0];
    return `http://${host}:5000`;
  }

  // Simulators / emulators
  if (Platform.OS === "android") return "http://192.168.2.181:5000";
  if (Platform.OS === "ios") return "http://localhost:5000";

  // Fallback for web
  return "http://localhost:5000";
};
