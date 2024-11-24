// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCn_BSPvfhxaIPQ8e0PRbOCYf4yU5OBO78",
    authDomain: "real-estate-48c3a.firebaseapp.com",
    projectId: "real-estate-48c3a",
    storageBucket: "real-estate-48c3a.appspot.com",
    messagingSenderId: "938647243377",
    appId: "1:938647243377:web:773085de9f0e0cf02ae9d0",
    measurementId: "G-ENV7BVRFMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); 

// Export Firebase services for use in other parts of the application
export { auth, db, storage };
export default app;
