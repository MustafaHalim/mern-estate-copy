// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-55cfb.firebaseapp.com",
  projectId: "mern-estate-55cfb",
  storageBucket: "mern-estate-55cfb.firebasestorage.app",
  messagingSenderId: "18219592587",
  appId: "1:18219592587:web:59db86d8f80f08cfffdd8e"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);