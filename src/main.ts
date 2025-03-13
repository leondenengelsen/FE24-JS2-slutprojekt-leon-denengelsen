import { db, initializeFirebase } from "./modules/firebase";
import { setupFiltering, setupDynamicFilters, setupDoneButton, setupDeleteButton, updateMembersUI, initializeUI, setupAssignMenu, setupFormSubmission,setupResetButton, populateAssignMenu, updateTasksUI } from "./modules/ux";
import { MemberHandler } from "./modules/memberhandling";
import { TaskHandler } from "./modules/taskshandling";

import { startLogging } from "./modules/log";


//------------------------------------------------
const memberHandler = new MemberHandler();
const taskHandler = new TaskHandler();

initializeFirebase();
initializeUI();
memberHandler.listenForMembers(updateMembersUI);
taskHandler.listenForTasks(updateTasksUI);
populateAssignMenu();
setupAssignMenu();
setupFormSubmission();
setupResetButton();
setupDeleteButton();
setupDoneButton();
setupFiltering();
setupDynamicFilters();
startLogging();

//-------------------------------------















