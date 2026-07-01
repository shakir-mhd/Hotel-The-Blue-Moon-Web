import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxoOwxCgEFB_HDotisuxw_tMujT302Aig",
  authDomain: "hotel-the-blue-moon.firebaseapp.com",
  projectId: "hotel-the-blue-moon",
  storageBucket: "hotel-the-blue-moon.appspot.com",
  messagingSenderId: "818638616034",
  appId: "1:818638616034:web:b534bc8afe58c9c6aeb5bb",
  measurementId: "G-JXSTTZK3V5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
