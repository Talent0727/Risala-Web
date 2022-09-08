// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from 'firebase/auth';

import { GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBJ53YKq_rQk4eYWOklX7xjZCadffXZFto",
  authDomain: "risala-175db.firebaseapp.com",
  databaseURL: "https://risala-175db-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "risala-175db",
  storageBucket: "risala-175db.appspot.com",
  messagingSenderId: "693669932212",
  appId: "1:693669932212:web:96d249285424b616a27be1",
  measurementId: "G-TET3661WC1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

//Authentication
const googleProvider = new GoogleAuthProvider();