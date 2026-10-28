
console.log("Firebase module file is loading");

import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDOfzAuHMPrn0580CkScxO_MQX0koo8t7s",
  authDomain: "spicenest-9eeeb.firebaseapp.com",
  projectId: "spicenest-9eeeb",
  storageBucket: "spicenest-9eeeb.firebasestorage.app",
  messagingSenderId: "541157289014",
  appId: "1:541157289014:web:eec40097ae9a5b374f7c97",
  measurementId: "G-66D77E3BTJ",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Keep the login session for the current browser session.
export const authReady = setPersistence(
  auth,
  browserSessionPersistence
);

console.log(
  "SpiceNest Firebase initialized:",
  auth.app.options.projectId
);

export default app;
