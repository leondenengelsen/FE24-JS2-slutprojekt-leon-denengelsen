
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyD1qRT3LOeHRIemSxhzPyFebx5vcrjv7ig",
  authDomain: "scrum-board-js-2-exam.firebaseapp.com",
  databaseURL: "https://scrum-board-js-2-exam-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "scrum-board-js-2-exam",
  storageBucket: "scrum-board-js-2-exam.firebasestorage.app",
  messagingSenderId: "891333400536",
  appId: "1:891333400536:web:a88537132a2a4d3f8e84ad",
  measurementId: "G-RQTD5FRTSX"
};

//------------
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

export function initializeFirebase() {
    const usersRef = ref(db, "/users");
    onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        console.log(users);
    });
}