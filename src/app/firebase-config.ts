import { initializeApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyBSMU8KQZIJXv5j5fLk1I_D2SahgQ9UbBQ",
  authDomain: "bill-manager-8c2ea.firebaseapp.com",
  projectId: "bill-manager-8c2ea",
  storageBucket: "bill-manager-8c2ea.firebasestorage.app",
  messagingSenderId: "238326632978",
  appId: "1:238326632978:web:e9e281fe24c0d032403ecb"
};

export const firebaseApp = initializeApp(firebaseConfig);
