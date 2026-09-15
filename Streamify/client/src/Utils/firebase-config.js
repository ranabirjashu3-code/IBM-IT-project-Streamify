import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDSfoATIpL-P3x4D9veh-LnYEVHrXwVgc4",
  authDomain: "streamify-df239.firebaseapp.com",
  projectId: "streamify-df239",
  storageBucket: "streamify-df239.firebasestorage.app",
  messagingSenderId: "9715758227",
  appId: "1:9715758227:web:deb548ffe830639c144966",
  measurementId: "G-5RPB9T7NQ6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);

// Keep user logged in after browser refresh
setPersistence(firebaseAuth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Firebase auth persistence enabled");
  })
  .catch((error) => {
    console.error("❌ Firebase persistence error:", error);
  });