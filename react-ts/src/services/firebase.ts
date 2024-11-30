import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAi0CczKZ2jd1nrKzNliHaGupp61TikBfs",
  authDomain: "term6-yoshiaki-tanabe.firebaseapp.com",
  databaseURL: "https://term6-yoshiaki-tanabe-default-rtdb.firebaseio.com",
  projectId: "term6-yoshiaki-tanabe",
  storageBucket: "term6-yoshiaki-tanabe.firebasestorage.app",
  messagingSenderId: "52633672360",
  appId: "1:52633672360:web:1566432c2095e9e51bc09d",
  measurementId: "G-YKC2F9X3ZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);