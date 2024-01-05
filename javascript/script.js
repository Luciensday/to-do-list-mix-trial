//------ below are global variable and stand alone functions

// Deafult Groups
const deafultGroups = [{ groupName: "Work" }, { groupName: "Personal" }];

//groups array hold group object including tasks property
let groups = [];

// Function to find a group by ID
function findGroupById(groupId) {
  return groups.find((g) => g.id === groupId);
}

// Unique Id Counters
let groupId = 1;
let taskId = 1;

function save() {
  localStorage.setItem("savedGroupsData", JSON.stringify(groups));
}

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

// Hide and show toggle
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

// ----- load: creat "All" folder(is not in groups data, only serve as filter)
window.addEventListener("load", () => {
  //to create All folder
  const inputElement = document.createElement("input");
  inputElement.value = "All";
  createFolder(inputElement, "all");

  let savedGroups = JSON.parse(localStorage.getItem("savedGroupsData"));
  console.log(`saveGroups in load block a create all folder`);
  console.log(savedGroups);
  console.log(groups);

  if (!savedGroups || savedGroups.length === 0) {
    deafultGroups.forEach((element) => {
      createGroupUsingTemplate(element.groupName);
      console.log(`saveGroups in load block if savegroups has no element`);
      console.log(savedGroups);
      console.log(groups);
    });
  } else {
    groups = savedGroups;
    groups.forEach((group) => {
      createGroupUsingTemplate(group.name);
      group.tasks.forEach((task) => {
        createTaskUsingTemplate(task, `#${group.id}`);
      });
    });
  }
});

//--- user interaction start from here:  Eventlistener of group creating button
const newGroupButton = document.getElementById("createGroupButton");
newGroupButton.addEventListener("click", () => {
  createGroupUsingTemplate();
});

// first: create group
function createGroupUsingTemplate(groupName) {
  const containerElement = document.querySelector(".groupsContainer");
  const template = document.querySelector("#groupTemplate");
  const domFragment = template.content.cloneNode(true);

  // Define the group title
  const groupTitle = domFragment.querySelector(".groupTitle");
  const uniqueId = generateUniqueGroupID();

  // in the case of default group that has default groupName data
  if (groupName) {
    groupTitle.value = groupName;
  }
  let folderTitle = createFolder(groupTitle, uniqueId);
  //foler name can change simutaneously when user edit the group name
  groupTitle.addEventListener("input", function () {
    folderTitle.innerText = groupTitle.value;
  });
  // Delete group Button
  const deleteButton = domFragment.querySelector(".deleteGroupButton");
  deleteButton.addEventListener("click", () => {
    const groupElement = document.getElementById(uniqueId);
    const groupFolderElement = document.getElementById(`folder${uniqueId}`);
    const targetGroupIndex = groups.findIndex((g) => (g.id = uniqueId));
    if (targetGroupIndex !== -1) {
      groups.splice(targetGroupIndex, 1);
      groupElement.remove(); // Removes the whole group container
      groupFolderElement.remove();
      save();
    }
  });

  // Assign ID to the group container
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

      if (taskText && group) {
        createTaskUsingTemplate(item, group);
      }
      // Clear the input field after adding the task
      inputField.value = "";
    }
    save();
  });

  // Update the groups array
  groups.push({
    id: uniqueId,
    name: groupName || "",
    tasks: [],
  });
  save();
  containerElement.appendChild(domFragment);
}

function createFolder(groupTitle, uniqueId) {
  const sideBarContainer = document.querySelector("#sidebar");
  const template = document.querySelector("#folderTemplate");
  const domFragment = template.content.cloneNode(true);

  // set folder ID
  const folderContainer = domFragment.querySelector(".folderContainer");
  folderContainer.setAttribute("id", `folder${uniqueId}`);

  //set folder eventlistener to filter
  folderContainer.addEventListener("click", (event) => {
    const targetButton = event.target.closest(".folderContainer");
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
  });
  //  set folder title
  const folderTitle = domFragment.querySelector(".folderTitle");
  folderTitle.innerText = groupTitle.value;

  save();

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
      taskItem.classList.add("hidden");
    }
    // Move the taskItem to the top of the task list within its group
    taskList.insertBefore(taskItem, taskList.firstChild);
    save();
  });

  // remove Task
  const deleteTaskButton = domFragment.querySelector(".deleteTaskButton");
  deleteTaskButton.addEventListener("click", () => {
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

// unuse function: comment out for the moment if to apply in future revist them

// //Display Mobile menu
// const menu = document.querySelector("#mobile-menu");
// const menuLinks = document.querySelector(".sidebar");

// //Enter works like "tab"
// function focusNextElement(element) {
//   // Get all focusable elements
//   const focusableElements = Array.from(
//     document.querySelectorAll(
//       'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
//     ),
//   );

//   const index = focusableElements.indexOf(element);
//   if (index > -1) {
//     // Focus the next focusable element; if there's no next element, focus the first one
//     const nextElement = focusableElements[index + 1] || focusableElements[0];
//     nextElement.focus();
//   }
// }
