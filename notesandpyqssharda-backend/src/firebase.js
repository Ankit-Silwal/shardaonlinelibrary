// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBj2cUhjZbUif4PSLNsn75YHS8tewZcLRE",
  authDomain: "solproj.firebaseapp.com",
  projectId: "solproj",
  storageBucket: "solproj.firebasestorage.app",
  messagingSenderId: "663175194269",
  appId: "1:663175194269:web:c980a0d2b460ee76b09674",
  measurementId: "G-91L8YC6VXM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);