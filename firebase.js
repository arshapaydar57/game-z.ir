import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase
} from
"https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDveNGDQz7sXrHtAo6CEq5pnWEkhzb5fWE",
  authDomain: "game-z-dd5de.firebaseapp.com",
  databaseURL: "https://game-z-dd5de-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "game-z-dd5de",
  storageBucket: "game-z-dd5de.firebasestorage.app",
  messagingSenderId: "579411685421",
  appId: "1:579411685421:web:6db829e8046a34c72f48a4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);