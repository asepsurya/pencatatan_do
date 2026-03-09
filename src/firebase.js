// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_G89PcYTcH-qL5PwDY-G-c-JRf90gdRM",
    authDomain: "delivery-141f4.firebaseapp.com",
    projectId: "delivery-141f4",
    storageBucket: "delivery-141f4.firebasestorage.app",
    messagingSenderId: "671021203059",
    appId: "1:671021203059:web:cfd5f5a1097f13faed3406",
    measurementId: "G-LRBMHBGFNV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics = null;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (e) {
        console.warn("Firebase Analytics could not be initialized:", e);
    }
}

export { db, auth, googleProvider, analytics };
