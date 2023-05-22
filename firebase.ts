import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALrQYTAqYlkTtYSKhEg1frwcel35o4gXU",
  authDomain: "fitai-2800a.firebaseapp.com",
  projectId: "fitai-2800a",
  storageBucket: "fitai-2800a.appspot.com",
  messagingSenderId: "327787891771",
  appId: "1:327787891771:web:d354e33d7002f28273e01e",
  measurementId: "G-YVXT26J4WE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
  
}const auth = getAuth(); // initialize auth

export { app, auth };