// Deafult Groups
const deafultGroups = [{ groupName: "Work" }, { groupName: "Personal" }];
let groups = [];

// Function to find a group by ID
function findGroupById(groupId) {
  return groups.find((g) => g.id == groupId);
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

let defaultHideCompleted = true; // A flag to set the default state to hide completed
let showHideCompleted = document.querySelector("#showHideCompleted");

showHideCompleted.addEventListener("click", function () {
  //click to hide
  if (showHideCompleted.textContent == "show completed") {
    showHideCompleted.textContent = "hide completed";
    defaultHideCompleted = false; // Set the flag to show completed items
    const completedItems = document.querySelectorAll(".complete");
    completedItems.forEach((item) => item.classList.remove("hidden"));
    //click to show
  } else if (showHideCompleted.textContent == "hide completed") {
    showHideCompleted.textContent = "show completed";
    defaultHideCompleted = true; // Set the flag to hide completed items
    const completedItems = document.querySelectorAll(".complete");
    completedItems.forEach((item) => item.classList.add("hidden"));
  }
});

// Create initial default groups
window.addEventListener("load", () => {
  //to create All folder
  const inputElement = document.createElement("input");
  inputElement.value = "All";

  createFolder(inputElement, "all");

  deafultGroups.forEach((element) => {
    createGroupUsingTemplate(element.groupName);
  });
});

// Eventlistener for create group button
const newGroupButton = document.getElementById("createGroupButton");
newGroupButton.addEventListener("click", () => {
  createGroupUsingTemplate();
});

// first: group is created

function createGroupUsingTemplate(groupName) {
  const containerElement = document.querySelector(".groupsContainer");
  const template = document.querySelector("#groupTemplate");
  const domFragment = template.content.cloneNode(true);

  // Define the group title
  const groupTitle = domFragment.querySelector(".groupTitle");
  const uniqueId = generateUniqueGroupID();

  if (groupName) {
    groupTitle.value = groupName;
  }
  let folderTitle = createFolder(groupTitle, uniqueId);
  //foler name can change simutaneously when user edit the group name
  groupTitle.addEventListener("input", function () {
    folderTitle.innerText = groupTitle.value;
  });

  // Delete Button
  const deleteButton = domFragment.querySelector(".deleteGroupButton");

  deleteButton.addEventListener("click", () => {
    const groupElement = document.getElementById(uniqueId);
    const groupFolderElement = document.getElementById(`folder${uniqueId}`);

    if (groupElement) {
      groupElement.remove(); // Removes the whole group container
      groupFolderElement.remove();
    } else {
      console.error(`No element found with ID ${uniqueId}`);
    }
  });

  // Assign an ID
  // Assign ID to the container
  domFragment.querySelector(".tasksContainer").id = uniqueId;
  // Assign ID to the task input and add eventlistener to it
  domFragment.querySelector(".addTaskField").id = `addTaskField-${uniqueId}`;
  const field = domFragment.querySelector(".addTaskField");
  const group = `#${uniqueId}`;
  field.addEventListener("keypress", (event) => {
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
  });

  containerElement.appendChild(domFragment);

  // // After appending, set the focus on the group title
  // // Using requestAnimationFrame to ensure the focus occurs after any reflows or repaints
  // requestAnimationFrame(() => {
  //   groupTitle.focus();
  // });

  // Update the groups array
  groups.push({
    id: uniqueId,
    name: groupName || "",
    tasks: [],
  });
}

function createFolder(groupTitle, uniqueId) {
  const sideBarContainer = document.querySelector("#sidebar");
  const template = document.querySelector("#folderTemplate");
  const domFragment = template.content.cloneNode(true);

  //  set folder ID
  const folderContainer = domFragment.querySelector(".folderContainer");
  folderContainer.setAttribute("id", `folder${uniqueId}`);

  //set folder eventlistener to filter
  folderContainer.addEventListener("click", (event) => {
    const targetButton = event.target.closest(".folderContainer");
    // if (!targetButton) return; // Ignore clicks outside of the .folderContainer
    const targetGroupId = targetButton.id.replace(/folder/, "");
    const allGroups = document.querySelectorAll(".tasksContainer");
    allGroups.forEach((group) => {
      if (targetButton.id == "folderall") {
        group.style.display = "block";
      } else if (group.id !== targetGroupId) {
        group.style.display = "none"; // Hide the item
      } else if (group.id === targetGroupId) {
        group.style.display = "block";
      }
    });
    console.log(
      `target is ${targetGroupId} orignal stuff is ${targetButton.id}`,
    );
  });

  //  set folder title
  const folderTitle = domFragment.querySelector(".folderTitle");

  folderTitle.innerText = groupTitle.value;
  console.log(`what is folderTitle ${folderTitle}`);

  //

  sideBarContainer.appendChild(domFragment);
  return folderTitle;
}

// Create task
function createTaskUsingTemplate(item, group) {
  //goup is an id number, e.g #${uniqueId}
  const containerElement = document.querySelector(group);
  const taskList = containerElement.querySelector(".listToDo");

  const template = document.querySelector("#taskTemplate");
  const domFragment = template.content.cloneNode(true);
  const field = domFragment.querySelector(".taskText");
  const taskItem = domFragment.querySelector(".taskItem");

  field.value = item.text;
  taskItem.id = item.id;

  // Completed circle
  const taskCircle = domFragment.querySelector(".taskCircle");
  if (item.complete) {
    taskItem.classList.add("complete");
  }
  taskCircle.addEventListener("click", (event) => {
    circleToggledItemAppareance(
      event,
      item,
      taskItem,
      taskCircle,
      containerElement,
    );
  });

  // remove Task
  const deleteTaskButton = domFragment.querySelector(".deleteTaskButton");
  deleteTaskButton.addEventListener("click", () => {
    handleTaskDeleteButton(item, taskItem, containerElement);
  });

  taskList.appendChild(domFragment);
  // Update the groups array
  const currentGroup = findGroupById(containerElement.id);
  currentGroup.tasks.push(item);

  // if complete is in show status, and list has any items that is complete. the item will be hidden
  if (defaultHideCompleted && taskItem.classList.contains("complete")) {
    taskItem.classList.add("hidden");
  }
}

function circleToggledItemAppareance(
  event,
  item,
  taskItem,
  taskCircle,
  containerElement,
) {
  item.complete = !item.complete; // Toggle the complete property
  if (item.complete) {
    taskItem.classList.add("complete");
    taskCircle.classList.add("complete-circle");
  } else {
    taskItem.classList.remove("complete");
    taskCircle.classList.remove("complete-circle");
  }

  // Find the group's task list

  const taskList = containerElement.querySelector(".listToDo");

  if (defaultHideCompleted) {
    // If it's set to hide completed by default, hide the item.
    taskItem.classList.add("hidden");
  }

  // Move the taskItem to the top of the task list within its group
  taskList.insertBefore(taskItem, taskList.firstChild);
  save();
}

function handleTaskDeleteButton(item, taskItem, containerElement) {
  // Find the index of the item to be removed
  const currentGroup = findGroupById(containerElement.id);
  const groupArray = currentGroup.tasks;

  console.log(groupArray);
  const itemIndex = groupArray.findIndex((t) => t.id === item.id);
  if (itemIndex !== -1) {
    // Remove the item from the toDo array
    groupArray.splice(itemIndex, 1);
    // Update the DOM
    taskItem.remove();
    save();
  }
}

//Display Mobile menu
const menu = document.querySelector("#mobile-menu");
const menuLinks = document.querySelector(".sidebar");

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

// <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Don't test above
