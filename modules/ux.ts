import { MemberHandler } from "./memberhandling";
import { TaskHandler } from "./taskshandling";
import { clearDatabase } from "./databasehandling";
//-----------------------

const memberHandler = new MemberHandler();
const taskHandler = new TaskHandler();

export function setupDropdown(dropdownId: string) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const button = dropdown.querySelector(".dropdown-button");
    const content = dropdown.querySelector(".dropdown-content");
    const inputs = content?.querySelectorAll("input[type='radio'], input[type='checkbox']");

    if (!button || !content || !inputs) return;

    button.addEventListener("click", () => {
        dropdown.classList.toggle("active");
    });

    document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target as Node)) {
            dropdown.classList.remove("active");
        }
    });

    inputs.forEach((input) => {
        const inputElement = input as HTMLInputElement;
        inputElement.addEventListener("change", () => {
            if (inputElement.type === "radio") {
                dropdown.classList.remove("active");
            }
        });
    });
}

export function setupFormValidation(formId: string) {
    const form = document.getElementById(formId) as HTMLFormElement;
    if (!form) return;

    form.addEventListener("submit", (event) => {
        const memberInput = form.querySelector<HTMLInputElement>("#member-name");
        const taskInput = form.querySelector<HTMLInputElement>("#task-name");

        if (memberInput?.value.trim() === "" && taskInput?.value.trim() === "") {
            event.preventDefault();
            alert("You must fill in either a member or a task!");
        }
    });
}

export function initializeUI() {
    setupDropdown("role-dropdown");
    setupDropdown("category-dropdown");
    setupFormValidation("input-form");
    setupOptionsMenu();
    memberHandler.listenForMembers(updateMembersUI);
}

export function setupAssignMenu() {
    const assignButton = document.querySelector(".assign-btn") as HTMLButtonElement;
    const assignMenu = document.getElementById("assign-menu");

    if (assignButton && assignMenu) {
        assignButton.addEventListener("click", () => {
            assignMenu.style.visibility = assignMenu.style.visibility === "visible" ? "hidden" : "visible";
            assignMenu.style.opacity = assignMenu.style.opacity === "1" ? "0" : "1";
            assignMenu.style.transform = assignMenu.style.transform === "translateY(0)" ? "translateY(10px)" : "translateY(0)";
        });

        document.addEventListener("click", (event) => {
            if (!assignButton.contains(event.target as Node) && !assignMenu.contains(event.target as Node)) {
                assignMenu.style.visibility = "hidden";
                assignMenu.style.opacity = "0";
                assignMenu.style.transform = "translateY(10px)";
            }
        });
    }
}

export function setupOptionsMenu() {
    const optionsBtn = document.getElementById("options-btn") as HTMLButtonElement;
    const optionsMenu = document.getElementById("options-menu") as HTMLElement;

    if (!optionsBtn || !optionsMenu) return;

    optionsBtn.addEventListener("click", () => {
        optionsMenu.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
        if (!optionsBtn.contains(event.target as Node) && !optionsMenu.contains(event.target as Node)) {
            optionsMenu.classList.remove("show");
        }
    });
}

export function setupFormSubmission() {
    const form = document.getElementById("input-form") as HTMLFormElement;
    const memberNameInput = document.getElementById("member-name") as HTMLInputElement;
    const roleDropdown = document.getElementById("role-dropdown") as HTMLElement;
    const taskNameInput = document.getElementById("task-name") as HTMLInputElement;
    const taskDescInput = document.getElementById("task-desc") as HTMLInputElement;
    const categoryDropdown = document.getElementById("category-dropdown") as HTMLElement;

    if (!form || !memberNameInput || !roleDropdown || !taskNameInput || !categoryDropdown) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = memberNameInput.value.trim();
        const selectedRoles = getSelectedDropdownValues(roleDropdown);
        const taskTitle = taskNameInput.value.trim();
        const taskDescription = taskDescInput.value.trim();
        const selectedCategoryInput = categoryDropdown.querySelector("input[type='radio']:checked") as HTMLInputElement | null;
        const selectedCategory: string = selectedCategoryInput?.value ?? "";

        if (!name && !taskTitle) {
            alert("Please enter a member or a task.");
            return;
        }

        if (name && selectedRoles.length > 0) {
            memberHandler.addMember(name, selectedRoles);
            memberNameInput.value = "";
            alert(`Added member: ${name} with roles: ${selectedRoles.join(", ")}`);
        }

        if (taskTitle && selectedCategory) {
            taskHandler.addTask(taskTitle, taskDescription, selectedCategory);
            taskNameInput.value = "";
            taskDescInput.value = "";

            // Reset radio buttons
            document.querySelectorAll("input[type='radio']").forEach((radio) => {
                (radio as HTMLInputElement).checked = false;
            });

            alert(`Added task: ${taskTitle} in category: ${selectedCategory}`);
        }
    });
}

export function getSelectedDropdownValues(dropdown: HTMLElement): string[] {
    const selectedOptions: string[] = [];

    const inputs = dropdown.querySelectorAll("input[type='checkbox']:checked, option:checked");

    inputs.forEach((input) => {
        selectedOptions.push((input as HTMLInputElement).value);
    });

    return selectedOptions;
}

export function setupResetButton() {
    const resetButton = document.getElementById("clear-database");
    if (!resetButton) return;

    resetButton.addEventListener("click", () => {
        const confirmReset = confirm("Are you sure you want to reset the entire Scrumboard?");
        if (confirmReset) {
            clearDatabase();
        }
    });
}

export function updateMembersUI() {
    const memberList = document.getElementById("members-list");
    if (!memberList) return;

    memberHandler.listenForMembers((members) => {
        memberList.innerHTML = "";

        members.forEach((member) => {
            const roleText = member.roles && member.roles.length > 0 ? member.roles.join(", ") : "No roles";

            const memberItem = document.createElement("li");
            memberItem.textContent = `${member.name} (${roleText})`;
            memberList.appendChild(memberItem);
        });
    });
}

export function updateTasksUI(tasks: { id: string; title: string; description: string; category: string; status: string; assigned?: string }[]) {
    const toDoColumn = document.getElementById("todo-list");
    const ongoingColumn = document.getElementById("ongoing-list");
    const doneColumn = document.getElementById("done-list");

    if (!toDoColumn || !ongoingColumn || !doneColumn) return;

    toDoColumn.innerHTML = "";
    ongoingColumn.innerHTML = "";
    doneColumn.innerHTML = "";

    tasks.forEach((task) => {
        const taskItem = document.createElement("li");
        taskItem.setAttribute("data-task-id", task.id);
        taskItem.classList.add("task-item");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false; // 
        checkbox.classList.add("task-checkbox");

        const taskText = document.createElement("span");
        taskText.classList.add("task-details");
        taskText.innerHTML = `
            <strong class="task-title">${task.title}</strong><br> <span class="task-description">${task.description}</span>
            <br> <em class="task-role">Role:</em> <span class="task-category">${task.category}</span>
            <br> <em class="task-assigned">Assigned to:</em> <span class="assigned-member">${task.assigned ? task.assigned : "Unassigned"}</span>
            ${task.status === "done"
                ? `<br> <em class="task-status">Completed:</em> <span class="task-timestamp">${task.timestampDone ? new Date(task.timestampDone).toLocaleString() : "Unknown"}</span>`
                : `<br> <em class="task-status">Added:</em> <span class="task-timestamp">${task.timestamp ? new Date(task.timestamp).toLocaleString() : "Unknown"}</span>`
            }`;

        taskItem.appendChild(checkbox);
        taskItem.appendChild(taskText);

        if (task.status === "done") {
            doneColumn.appendChild(taskItem);
        } else if (task.status === "in progress") {
            ongoingColumn.appendChild(taskItem);
        } else {
            toDoColumn.appendChild(taskItem);
        }
    });
}

export function setupDeleteButton() {
    const deleteButton = document.querySelector(".delete-btn") as HTMLButtonElement;
    if (!deleteButton) return;

    deleteButton.addEventListener("click", () => {
        const selectedTasks = Array.from(document.querySelectorAll("#done-list input[type='checkbox']:checked"))
            .map((checkbox) => {
                const taskItem = (checkbox as HTMLInputElement).parentElement;
                return taskItem ? { id: taskItem.dataset.taskId, element: taskItem } : null;
            })
            .filter((task): task is { id: string; element: HTMLElement } => task !== null);

        if (selectedTasks.length === 0) {
            alert("Please select at least one task to delete.");
            return;
        }

        selectedTasks.forEach(({ id, element }) => {
            taskHandler.deleteTask(
                id,
                () => {
                    element.remove();
                    memberHandler.listenForMembers(updateMembersUI);
                },
                (error) => console.error("Error deleting task:", error)
            );
        });
    });
}

export function setupDoneButton() {
    const doneButton = document.querySelector(".done-btn") as HTMLButtonElement;
    if (!doneButton) return;

    doneButton.addEventListener("click", () => {
        const selectedTasks = Array.from(document.querySelectorAll("#ongoing-list input[type='checkbox']:checked"))
            .map((checkbox) => (checkbox as HTMLInputElement).parentElement?.dataset.taskId)
            .filter((taskId): taskId is string => !!taskId);

        if (selectedTasks.length === 0) {
            alert("Please select a task to mark as Done.");
            return;
        }

        selectedTasks.forEach((taskId) => {
            taskHandler.markTaskAsDone(
                taskId,
                () => { },
                (error) => console.error("Error moving task to Done:", error)
            );
        });
    });
}

export function assignSelectedTaskToMember(memberId: string, memberName: string) {
    const selectedTasks = Array.from(document.querySelectorAll("#todo-list input[type='checkbox']:checked"))
        .map((checkbox) => (checkbox as HTMLInputElement).parentElement?.dataset.taskId)
        .filter((taskId): taskId is string => !!taskId);

    if (selectedTasks.length === 0) {
        alert("Please select at least one task to assign.");
        return;
    }

    selectedTasks.forEach((taskId) => {
        taskHandler.assignTaskToMember(taskId, memberName, () => {
            populateAssignMenu();

            const assignMenu = document.getElementById("assign-menu");
            if (assignMenu) {
                assignMenu.style.visibility = "hidden";
                assignMenu.style.opacity = "0";
                assignMenu.style.transform = "translateY(10px)";
            }
        });
    });
}


export function populateAssignMenu() {
    const assignMembersList = document.getElementById("assign-members-list");
    if (!assignMembersList) return;

    memberHandler.listenForMembers((members) => {
        assignMembersList.innerHTML = "";

        members.forEach((member) => {
            const li = document.createElement("li");
            li.textContent = member.name;
            li.dataset.memberId = member.id;
            li.classList.add("assign-member-item");

            li.addEventListener("click", () => {
                assignSelectedTaskToMember(member.id, member.name);
                const assignMenu = document.getElementById("assign-menu");
                if (assignMenu) assignMenu.style.display = "block";
            });

            assignMembersList.appendChild(li);
        });
    });
}

export function setupFiltering() {
    const sortSelect = document.getElementById("sort-tasks") as HTMLSelectElement;
    const categoryFilterSelect = document.getElementById("filter-by-category") as HTMLSelectElement;
    const memberFilterSelect = document.getElementById("filter-members") as HTMLSelectElement;
    const applyFiltersButton = document.getElementById("apply-filters") as HTMLButtonElement;

    if (!sortSelect || !categoryFilterSelect || !memberFilterSelect || !applyFiltersButton) return;

    taskHandler.listenForTasks((tasks) => {
        setupCategoryFilter(tasks);
        updateTasksUI(tasks);
    });

    applyFiltersButton.addEventListener("click", () => {
        taskHandler.listenForTasks((tasks) => {
            const sortOption = sortSelect.value;
            const categoryFilter = categoryFilterSelect.value;
            const memberFilter = memberFilterSelect.value;

            const filteredTasks = filterTasks(tasks, sortOption, categoryFilter, memberFilter);
            updateTasksUI(filteredTasks);
        });
    });
}

export function filterTasks(tasks: any[], sortBy: string, categoryFilter: string, memberFilter: string): any[] {
    let filteredTasks = [...tasks];

    if (categoryFilter !== "all") {
        filteredTasks = filteredTasks.filter(task => {
            let taskCategory = task.category;
            return Array.isArray(taskCategory) ? taskCategory.includes(categoryFilter) : taskCategory === categoryFilter;
        });
    }

    if (memberFilter !== "all") {
        filteredTasks = filteredTasks.filter(task => task.assigned === memberFilter);
    }

    if (sortBy === "az") {
        filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "za") {
        filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "newest") {
        filteredTasks.sort((a, b) => (b.timestamp ? new Date(b.timestamp).getTime() : 0) - (a.timestamp ? new Date(a.timestamp).getTime() : 0));
    } else if (sortBy === "oldest") {
        filteredTasks.sort((a, b) => (a.timestamp ? new Date(a.timestamp).getTime() : 0) - (b.timestamp ? new Date(b.timestamp).getTime() : 0));
    }

    return filteredTasks;
}

export function setupDynamicFilters() {
    const filterMembersDropdown = document.getElementById("filter-members") as HTMLSelectElement;
    if (!filterMembersDropdown) return;

    memberHandler.listenForMembers((members) => {
        filterMembersDropdown.innerHTML = `<option value="all">All Members</option>`;
        members.forEach(member => {
            const option = document.createElement("option");
            option.value = member.name;
            option.textContent = member.name;
            filterMembersDropdown.appendChild(option);
        });
    });
}

export function setupCategoryFilter(tasks: any[]) {
    const categoryFilterSelect = document.getElementById("filter-by-category") as HTMLSelectElement;
    if (!categoryFilterSelect) return;

    const uniqueCategories = new Set<string>();

    tasks.forEach(task => {
        let category = task.category;
        if (!category) category = "unknown";
        else if (Array.isArray(category)) category = category.join(", ");

        if (typeof category === "string") {
            uniqueCategories.add(category.trim().toLowerCase());
        }
    });

    categoryFilterSelect.innerHTML = `<option value="all">All</option>`;

    uniqueCategories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilterSelect.appendChild(option);
    });
}

export function enforceRoleLimit() {
    const roleCheckboxes = document.querySelectorAll<HTMLInputElement>("#role-dropdown input[type='checkbox']");

    roleCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const selectedRoles = Array.from(roleCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedRoles.length > 3) {
                checkbox.checked = false;
                alert("You can only select up to 3 roles.");
            }
        });
    });
}