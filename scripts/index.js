// Deafult Groups
import { deafultGroups } from "./index.data.js";

// Lucien import
let defaultHideCompleted = true; // A flag to set the default state to hide completed
let groups = [];

// Function to find a group by ID
function findGroupById(groupId) {
  return groups.find((g) => g.id === groupId);
}

// Unique Id Counters
let groupId = 1;
let taskId = 1;

function generateUniqueTaskID() {
  const uniqueTaskID = `task-${taskId}`;
  taskId++;
  return uniqueTaskID;
}

function generateUniqueGroupID() {
  const uniqueGroupID = `group-${groupId}`;
  groupId++;
  return uniqueGroupID;
}
// Show/hind button change text
showHideCompleted.addEventListener("click", function () {
  if (showHideCompleted.textContent == "show completed") {
    showHideCompleted.textContent = "hide completed";
    showCompleted();
  } else {
    showHideCompleted.textContent = "show completed";
    hideCompleted();
  }
});

// Function to handle the 'Enter' key in addTaskFields
function handleAddTaskFieldEnter(event, group) {
  if (event.key === "Enter") {
    const inputField = event.target;
    const taskText = inputField.value.trim();

    const item = {
      id: generateUniqueTaskID(),
      text: taskText,
      complete: false,
      category: group,
    };

    if (taskText && group)
      // Create and add the task
      createTaskUsingTemplate(item, group);

    // Clear the input field after adding the task
    inputField.value = "";
    save();
  }
}

// Remove Task
function deleteTask(event) {
  const task = event.target;
  if (task.value.length === 0) {
    task.parentElement.remove();
  }
}

// Create task
export function createTaskUsingTemplate(item, group) {
  const containerElement = document.querySelector(group);
  const taskList = containerElement.querySelector("#listToDo");

  const template = document.querySelector("#taskTemplate");
  const domFragment = template.content.cloneNode(true);
  const field = domFragment.querySelector(".taskText");
  const taskItem = domFragment.querySelector(".taskItem");

  field.value = item.text;
  taskItem.id = item.id;

  // // Completed circle
  // const circle = domFragment.querySelector(".circle");
  // if (item.complete) {
  //   itemElement.classList.add("complete");
  // }
  // circle.addEventListener(
  //   "click",
  //   circleToggledItemAppareance(item, domFragment, circle),
  // );

  taskList.appendChild(domFragment);
  // Update the groups array
  const currentGroup = findGroupById(group);
  currentGroup.tasks.push(item);
}

// function circleToggledItemAppareance(item, domFragment, circle) {
//   item.complete = !item.complete; // Toggle the complete property
//   if (item.complete) {
//     domFragment.classList.add("complete");
//     circle.classList.add("complete-circle");
//   } else {
//     domFragment.classList.remove("complete");
//     circle.classList.remove("complete-circle");
//   }
//   if (defaultHideCompleted) {
//     // If it's set to hide completed by default, hide the item. and then put the complete item to top of list
//     updateListOrder(domFragment);
//     domFragment.classList.add("hidden");
//   } else {
//     // if it's not hidden, then just simple put the completed items to the top of the list
//     updateListOrder(domFragment);
//   }

//   save();
// }

// Add group
export function createGroupUsingTemplate(groupName) {
  const containerElement = document.querySelector(".groupsContainer");
  const template = document.querySelector("#groupTemplate");
  const domFragment = template.content.cloneNode(true);

  // Define the group title
  const groupTitle = domFragment.querySelector(".groupTitle");
  const uniqueId = generateUniqueGroupID();

  if (groupName) {
    groupTitle.value = groupName;
    groupTitle.setAttribute("tabindex", uniqueId.toString());
  }

  // Delete Button
  const deleteButton = domFragment.querySelector(".deleteGroupButton");
  deleteButton.addEventListener("click", () => deleteGroup(uniqueId));

  // Assign an ID
  domFragment.querySelector(".tasksContainer").id = uniqueId;
  domFragment.querySelector(".addTaskField").id = `addTaskField-${uniqueId}`;
  const field = domFragment.querySelector(".addTaskField");
  field.addEventListener("keypress", (event) =>
    handleAddTaskFieldEnter(event, `#${uniqueId}`),
  );

  // Find the addTaskField and addTaskButton inside the domFragment
  const addTaskField = domFragment.querySelector(".addTaskField");
  const addTaskButton = domFragment.querySelector(".addTaskButton");

  containerElement.appendChild(domFragment);

  // After appending, set the focus on the group title
  // Using requestAnimationFrame to ensure the focus occurs after any reflows or repaints
  requestAnimationFrame(() => {
    groupTitle.focus();
  });

  // Update the groups array
  groups.push({
    id: uniqueId,
    name: groupName || "",
    tasks: [],
  });
}

// Delete Group
function deleteGroup(groupId) {
  const groupElement = document.getElementById(groupId);
  if (groupElement) {
    groupElement.remove(); // Removes the whole group container
  } else {
    console.error(`No element found with ID ${groupId}`);
  }
}

// Create initial default groups
window.addEventListener("load", (event) => {
  deafultGroups.forEach((element) => {
    createGroupUsingTemplate(element.groupName);
  });
});

// Add new group button
const newGroupButton = document.getElementById("createGroupButton");
newGroupButton.addEventListener("click", (event) => {
  createGroupUsingTemplate();
});

//Enter works like "tab"
function focusNextElement(element) {
  // Get all focusable elements
  const focusableElements = Array.from(
    document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );

  const index = focusableElements.indexOf(element);

  if (index > -1) {
    // Focus the next focusable element; if there's no next element, focus the first one
    const nextElement = focusableElements[index + 1] || focusableElements[0];
    nextElement.focus();
  }
}
