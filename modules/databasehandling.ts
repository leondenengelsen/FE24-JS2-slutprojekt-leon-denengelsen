import { ref, remove } from "firebase/database";
import { db } from "./firebase";

export function clearDatabase() {
    const dbRef = ref(db, "/");
    remove(dbRef).catch((error) => console.error("Error clearing database:", error));
}

