

import { ref, push, set, update, remove, onValue } from "firebase/database";
import { db } from "./firebase";
import { MemberHandler } from "./memberhandling";

export class TaskHandler {
    private tasksRef = ref(db, "assignments");
    private memberHandler = new MemberHandler();


    addTask(title: string, description: string, category: string) {
        const newTaskRef = push(this.tasksRef);
        set(newTaskRef, {
            title,
            description,
            category,
            status: "new",
            assigned: null,
            timestamp: new Date().toISOString()
        }).catch((error) => console.error("❌ Error adding task:", error));
    }


    listenForTasks(callback: (tasks: any[]) => void) {
        onValue(this.tasksRef, (snapshot) => {
            const tasks = snapshot.val();
            if (tasks) {
                const taskArray = Object.entries(tasks).map(([id, task]: any) => ({
                    id,
                    ...task
                }));
                callback(taskArray);
            }
        });
    }


    moveTask(taskId: string, currentStatus: string) {
        const taskRef = ref(db, `assignments/${taskId}`);
        const newStatus = currentStatus === "new" ? "in progress" : "done";

        update(taskRef, { status: newStatus }).catch((error) =>
            console.error("Error moving task:", error)
        );
    }


    deleteTask(taskId: string, onSuccess?: () => void, onError?: (error: any) => void) {
        const taskRef = ref(db, `assignments/${taskId}`);
        remove(taskRef)
            .then(() => {
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                console.error("❌ Error deleting task:", error);
                if (onError) onError(error);
            });
    }


    markTaskAsDone(taskId: string, onSuccess?: () => void, onError?: (error: any) => void) {
        const taskRef = ref(db, `assignments/${taskId}`);

        update(taskRef, {
            status: "done",
            timestampDone: new Date().toISOString(),
        })
            .then(() => {
                if (onSuccess) onSuccess();
            })
            .catch((error) => {
                console.error("❌ Error marking task as done:", error);
                if (onError) onError(error);
            });
    }


    async assignTaskToMember(taskId: string, memberName: string, onSuccess?: () => void, onError?: (error: any) => void) {
        try {
            const taskRef = ref(db, `assignments/${taskId}`);
            let taskData: any;

            await new Promise<void>((resolve, reject) => {
                onValue(taskRef, (snapshot) => {
                    taskData = snapshot.val();
                    resolve();
                }, { onlyOnce: true }, reject);
            });

            if (!taskData) {
                alert("Task not found.");
                return;
            }

            // Normalize task categories
            const taskCategories = Array.isArray(taskData.category)
                ? taskData.category.map((c) => c.toLowerCase().trim())
                : [taskData.category.toLowerCase().trim()];

            // Fetch members
            const members = await this.memberHandler.getMembers();
            const member = members.find((m) => m.name === memberName);

            if (!member) {
                alert(`Member ${memberName} not found.`);
                return;
            }

            // Normalize member roles
            const memberRoles = Array.isArray(member.roles)
                ? member.roles.map((r) => r.toLowerCase().trim())
                : [member.roles.toLowerCase().trim()];

            // Check for role match
            const roleMatch = memberRoles.some((role) => taskCategories.includes(role));

            if (!roleMatch) {
                alert(`${memberName} cannot be assigned this task. Role mismatch.`);

                // Close the assign menu when role mismatch
                const assignMenu = document.getElementById("assign-menu");
                if (assignMenu) {
                    assignMenu.style.visibility = "hidden";
                    assignMenu.style.opacity = "0";
                    assignMenu.style.transform = "translateY(10px)";
                }
                return;
            }

            // Update Firebase with assigned member
            await update(taskRef, {
                assigned: memberName,
                status: "in progress",
                timestamp: new Date().toISOString(),
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Error assigning task:", error);
            if (onError) onError(error);
        }
    }
}

// import { ref, push, set, update, remove, onValue, get } from "firebase/database";
// import { db } from "./firebase";
// import { MemberHandler } from "./memberhandling";

// const memberHandler = new MemberHandler();

// export function addTask(title: string, description: string, category: string) {
//     const tasksRef = ref(db, "assignments");
//     const newTaskRef = push(tasksRef);
//     set(newTaskRef, {
//         title,
//         description,
//         category,
//         status: "new",
//         assigned: null,
//         timestamp: new Date().toISOString()
//     }).catch((error) => console.error("Error adding task:", error));
// }

// export function listenForTasks(callback: (tasks: any) => void) {
//     const tasksRef = ref(db, "assignments");
//     onValue(tasksRef, (snapshot) => {
//         const tasks = snapshot.val();
//         if (tasks) {
//             const taskArray = Object.entries(tasks).map(([id, task]: any) => ({
//                 id,
//                 ...task
//             }));
//             callback(taskArray);
//         }
//     });
// }

// export function moveTask(taskId: string, currentStatus: string) {
//     const taskRef = ref(db, `assignments/${taskId}`);
//     const newStatus = currentStatus === "new" ? "in progress" : "done";
//     update(taskRef, { status: newStatus }).catch((error) => console.error("Error moving task:", error));
// }

// export function deleteTask(taskId: string, onSuccess?: () => void, onError?: (error: any) => void) {
//     const taskRef = ref(db, `assignments/${taskId}`);
//     remove(taskRef)
//         .then(() => {
//             if (onSuccess) onSuccess();
//         })
//         .catch((error) => {
//             console.error("Error deleting task:", error);
//             if (onError) onError(error);
//         });
// }

// export function markTaskAsDone(taskId: string, onSuccess?: () => void, onError?: (error: any) => void) {
//     const taskRef = ref(db, `assignments/${taskId}`);
//     update(taskRef, {
//         status: "done",
//         timestampDone: new Date().toISOString()
//     })
//         .then(() => {
//             if (onSuccess) onSuccess();
//         })
//         .catch((error) => {
//             console.error("Error marking task as done:", error);
//             if (onError) onError(error);
//         });
// }

// export async function assignTaskToMember(
//     taskId: string, 
//     memberName: string, 
//     onSuccess?: () => void, 
//     onError?: (error: any) => void
// ) {
//     try {
//         const taskRef = ref(db, `assignments/${taskId}`);
//         const memberHandler = new MemberHandler();

//         // Fetch task data
//         let taskData: any;
//         await new Promise<void>((resolve, reject) => {
//             onValue(taskRef, (snapshot) => {
//                 taskData = snapshot.val();
//                 resolve();
//             }, { onlyOnce: true }, reject);
//         });

//         if (!taskData) {
//             alert("Task not found.");
//             return;
//         }

//         // Normalize task categories
//         const taskCategories = Array.isArray(taskData.category)
//             ? taskData.category.map((c) => c.toLowerCase().trim()) 
//             : [taskData.category.toLowerCase().trim()];

//         // Fetch members using `getMembers()`
//         const members = await memberHandler.getMembers();
//         const member = members.find((m) => m.name === memberName);

//         if (!member) {
//             alert(`Member ${memberName} not found.`);
//             return;
//         }

//         // Normalize member roles
//         const memberRoles = Array.isArray(member.roles)
//             ? member.roles.map((r) => r.toLowerCase().trim()) 
//             : [member.roles.toLowerCase().trim()];

//         // Check for role match
//         const roleMatch = memberRoles.some((role) => taskCategories.includes(role));

//         if (!roleMatch) {
//             alert(`${memberName} cannot be assigned this task. Role mismatch.`);
//             return;
//         }

//         // Update Firebase with assigned member
//         await update(taskRef, {
//             assigned: memberName,
//             status: "in progress",
//             timestamp: new Date().toISOString(),
//         });

//         if (onSuccess) onSuccess();
//     } catch (error) {
//         console.error("Error assigning task:", error);
//         if (onError) onError(error);
//     }
// }