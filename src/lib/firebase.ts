
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
  apiKey: "AIzaSyDJz7-i1wKxVYzAT8HOar_UYZw34dZpNSw",
  authDomain: "alot-83545.firebaseapp.com",
  databaseURL: "https://alot-83545-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "alot-83545",
  storageBucket: "alot-83545.appspot.com",
  messagingSenderId: "343816077312",
  appId: "1:343816077312:web:4d0ad356c862fe559658e5",
  measurementId: "G-H6R0SVK742"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, auth, db, storage, analytics,};