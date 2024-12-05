import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  // authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  // databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  // projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  // storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  // messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  // appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
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