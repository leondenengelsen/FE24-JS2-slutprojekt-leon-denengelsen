import { ref, push, set, onValue } from "firebase/database";
import { db } from "./firebase";

export class MemberHandler {
    private membersRef = ref(db, "members");

    addMember(name: string, roles: string[]) {
        if (roles.length > 3) {
            alert("You can only assign up to 3 roles per member.");
            return;
        }

        const newMemberRef = push(this.membersRef);
        set(newMemberRef, { name, roles })
            .catch((error) => console.error("Error adding member:", error));
    }

    listenForMembers(updateUI: (members: { id: string; name: string; roles: string[] }[]) => void) {
        onValue(this.membersRef, (snapshot) => {
            const data = snapshot.val();
            const membersList = data
                ? Object.keys(data).map((id) => ({
                    id,
                    name: data[id].name,
                    roles: data[id].roles || [],
                }))
                : [];
            updateUI(membersList);
        });
    }

    async getMembers(): Promise<{ id: string; name: string; roles: string[] }[]> {
        return new Promise((resolve, reject) => {
            try {
                onValue(
                    this.membersRef,
                    (snapshot) => {
                        const data = snapshot.val();
                        const membersList = data
                            ? Object.keys(data).map((id) => ({
                                id,
                                name: data[id].name,
                                roles: data[id].roles || [],
                            }))
                            : [];

                        resolve(membersList);
                    },
                    { onlyOnce: true }
                );
            } catch (error) {
                console.error("Error in getMembers:", error);
                reject(error);
            }
        });
    }
}

