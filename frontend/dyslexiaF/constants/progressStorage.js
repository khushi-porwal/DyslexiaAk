import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "screening-progress";

// Save or update the latest result for a given test key
export const saveScreeningResult = async (testKey, data = {}) => {
  if (!testKey) return null;

  try {
    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : {};

    parsed[testKey] = {
      ...data,
      completedAt: data.completedAt || new Date().toISOString(),
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return parsed;
  } catch (error) {
    console.log("Unable to save screening result", error);
    return null;
  }
};

// Fetch all saved screening results
export const getScreeningProgress = async () => {
  try {
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
