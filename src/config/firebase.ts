import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAGsiqMnrS490U2KMFmmaTmL65p-4zQQcM",
    authDomain: "nomad-trip-dd767.firebaseapp.com",
    projectId: "nomad-trip-dd767",
    storageBucket: "nomad-trip-dd767.firebasestorage.app",
    messagingSenderId: "18906994887",
    appId: "1:18906994887:web:bc462953f6c861a09306e2",
    measurementId: "G-1295CZ70D5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const ADMIN_GLOBAL_ID = "SEU_UID_AQUI";