import { ref, onChildAdded, onChildChanged, onChildRemoved } from "firebase/database";
import { db } from "./firebase";

export function addLog(message: string) {
    const logContainer = document.getElementById("log") as HTMLElement;
    if (!logContainer) return;

    const now = new Date();
    const timestamp = now.toLocaleDateString() + " " + now.toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;

    const logEntry = document.createElement("div");
    logEntry.textContent = logMessage;

    logContainer.insertBefore(logEntry, logContainer.firstChild);
}

export function startTaskLogging() {
    const tasksRef = ref(db, "assignments");

    onChildAdded(tasksRef, (snapshot) => {
        const task = snapshot.val();
        addLog(`Task "${task.title}" was added`);
    });

    onChildChanged(tasksRef, (snapshot) => {
        const task = snapshot.val();
        if (task.status === "done") {
            addLog(`Task "${task.title}" marked as Done`);
        } else if (task.assigned) {
            addLog(`Task "${task.title}" assigned to ${task.assigned}`);
        } else {
            addLog(`Task "${task.title}" was updated`);
        }
    });

    onChildRemoved(tasksRef, (snapshot) => {
        const task = snapshot.val();
        addLog(`Task "${task.title}" deleted`);
    });
}

export function startMemberLogging() {
    const membersRef = ref(db, "members");

    onChildAdded(membersRef, (snapshot) => {
        const member = snapshot.val();
        const roles = Array.isArray(member.role) ? member.role : [member.role];
        addLog(`Member "${member.name}" was added with role(s): ${roles.join(", ")}`);
    });

    onChildChanged(membersRef, (snapshot) => {
        const member = snapshot.val();
        const roles = Array.isArray(member.role) ? member.role : [member.role];
        addLog(`Member "${member.name}" was updated. New role(s): ${roles.join(", ")}`);
    });

    onChildRemoved(membersRef, (snapshot) => {
        const member = snapshot.val();
        addLog(`Member "${member.name}" was removed`);
    });
}

export function startLogging() {
    startTaskLogging();
    startMemberLogging();
}