import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../api/axios";

const KEY = "gameProgress";

const getUserKey = async () => {
  const token = await AsyncStorage.getItem("token");
  const email = await AsyncStorage.getItem("userEmail");
  return token || email || "guest";
};

const getNamespacedKey = async () => {
  const user = await getUserKey();
  return `${KEY}:${user}`;
};

const pushToBackend = async (payload) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return;

    await API.post("/api/progress", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (e) {
    // Silently ignore; local cache remains.
  }
};

const fetchFromBackend = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const { data } = await API.get("/api/progress", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return data?.progress || null;
  } catch (e) {
    return null;
  }
};

export const markGameProgress = async (gameId, data) => {
  try {
    const storageKey = await getNamespacedKey();
    const existingRaw = await AsyncStorage.getItem(storageKey);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const current = existing[gameId] || {};
    const entry = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
      completed: data?.completed ?? current.completed ?? false,
    };
    const updated = { ...existing, [gameId]: entry };
    await AsyncStorage.setItem(storageKey, JSON.stringify(updated));
    await pushToBackend({ gameId, ...entry });
  } catch (e) {
    // ignore storage errors for gameplay flow
  }
};

export const readGameProgress = async () => {
  try {
    const storageKey = await getNamespacedKey();
    const remote = await fetchFromBackend();

    if (remote) {
      await AsyncStorage.setItem(storageKey, JSON.stringify(remote));
      return remote;
    }

    const raw = await AsyncStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};
