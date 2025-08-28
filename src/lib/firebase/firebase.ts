
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPh5QPX-yRvPgHysCds9g102yRGBdfQQU",
  authDomain: "cognita-21ecd.firebaseapp.com",
  projectId: "cognita-21ecd",
  storageBucket: "cognita-21ecd.firebasestorage.app",
  messagingSenderId: "792250638993",
  appId: "1:792250638993:web:f48376218bdc3560a15530",
  measurementId: "G-FLZH66ZL6H"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
