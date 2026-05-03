// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCQsYTeKoMXdVUvvKroQJKArYSfhQN-HE",
  authDomain: "treasure-findr.firebaseapp.com",
  projectId: "treasure-findr",
  storageBucket: "treasure-findr.firebasestorage.app",
  messagingSenderId: "795242995842",
  appId: "1:795242995842:web:2465eb24113b9a5952949b",
  measurementId: "G-95G8DD91DH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);