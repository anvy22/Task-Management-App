import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const auth = getAuth();

  
  if (!auth.currentUser) {
    await new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe();
        resolve();
      });
    });
  }

  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken(true); // force fresh token
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
