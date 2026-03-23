import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../app/api/axios";

const STORAGE_KEY = "screening-progress";

const getToken = async () => AsyncStorage.getItem("token");

const saveToBackend = async (testKey, data) => {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await API.post(
      "/api/screening/results",
      { testKey, data },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data?.result;
  } catch (error) {
    console.log("Unable to sync screening result to backend", error?.response?.data || error?.message);
    return null;
  }
};

const fetchFromBackend = async () => {
  const token = await getToken();
  if (!token) return null;

  try {
    const res = await API.get("/api/screening/results", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.results || null;
  } catch (error) {
    console.log("Unable to fetch screening results from backend", error?.response?.data || error?.message);
    return null;
  }
};

// Save or update the latest result for a given test key
export const saveScreeningResult = async (testKey, data = {}) => {
  if (!testKey) return null;

  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : {};

    const entry = {
      ...data,
      completedAt: data.completedAt || new Date().toISOString(),
    };

    parsed[testKey] = entry;

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

    // Try to sync to backend for user-scoped storage
    await saveToBackend(testKey, entry);

    return parsed;
  } catch (error) {
    console.log("Unable to save screening result", error);
    return null;
  }
};

// Fetch all saved screening results (prefer backend, fallback to local)
export const getScreeningProgress = async () => {
  try {
    const remote = await fetchFromBackend();
    if (remote) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      return remote;
    }

    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    return existing ? JSON.parse(existing) : {};
  } catch (error) {
    console.log("Unable to read screening progress", error);
    return {};
  }
};

// Quick helper to know if anything is stored
export const hasAnyProgress = async () => {
  const progress = await getScreeningProgress();
  return Object.keys(progress || {}).length > 0;
};

export const clearScreeningProgress = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.log("Unable to clear screening progress", error);
  }
};
