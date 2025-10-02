document.addEventListener("DOMContentLoaded", () => {
  const newItemInput = document.getElementById("newTaskInput");
  const addItemButton = document.getElementById("addTaskButton");
  const newCareInput = document.getElementById("newCareInput");
  const addCareButton = document.getElementById("addCareButton");
  const checklist = document.getElementById("checklist");
  const careChecklist = document.getElementById("careChecklist");

  // --- NEW HELPER FUNCTION ---
  // This function returns a list of all text names for default tasks.
  // It MUST match the text strings used in your server.cjs getDefaultTasks() function.
  function getDefaultTaskNames() {
    // Daily Tasks Defaults:
    return [
      "Sweep",
      "Dishes",
      "Organize",
      "Litter Box",
      "Wipe Counters",
      "Trash",
      "Make Bed",
      // Self Care Defaults:
      "Brush Hair",
      "Brush Teeth",
      "Wash Face",
      "Vitamins",
      "Yoga",
      "Meds",
    ];
  }

  // --- API Functions ---
  async function saveData() {
    const tasks = getListData(checklist);
    const care = getListData(careChecklist);

    const dataToSend = [
      { name: "Daily Tasks", type: "checklist", items: tasks },
      { name: "Self Care", type: "checklist", items: care },
    ];

    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  async function loadData() {
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) throw new Error("Failed to load data");
      return await response.json();
    } catch (error) {
      console.error("Error loading data:", error);
      return null;
    }
  }

  // --- FIXED getListData FUNCTION ---
  function getListData(listElement) {
    const defaultNames = getDefaultTaskNames();

    return Array.from(listElement.querySelectorAll("li")).map((li) => {
      const checkbox = li.querySelector("input[type=checkbox]");
      const text = li.querySelector("span").textContent;
      const completed = checkbox.checked;

      // 1. Read the attribute first
      let isDefault = li.dataset.default === "true";

      // 2. Robust Check: If the item is marked false/missing the attribute,
      // but its text matches a known default, correct it to true.
      if (!isDefault && defaultNames.includes(text)) {
        isDefault = true;
        // Optional: update the DOM attribute for consistency
        li.dataset.default = "true";
      }

      // 3. Ensure any non-default task text is always saved as false
      if (!defaultNames.includes(text)) {
        isDefault = false;
      }

      return { text, completed, isDefault };
    });
  }

  // Function to add a new checklist item
  function addChecklistItem(
    text,
    completed = false,
    targetList = checklist,
    isDefault = false
  ) {
    const listItem = document.createElement("li");
    listItem.dataset.default = isDefault.toString();
    listItem.classList.add("flex", "items-center", "gap-2", "p-1");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = completed;

    const itemText = document.createElement("span");
    itemText.textContent = text;
    if (completed) {
      itemText.classList.add("line-through", "text-gray-400");
    }

    listItem.appendChild(checkbox);
    listItem.appendChild(itemText);

    
    
  
   const deleteBtn = document.createElement("button");
   deleteBtn.textContent = "❌";
   deleteBtn.classList.add("ml-2");
   listItem.appendChild(deleteBtn);

    
   targetList.appendChild(listItem);
  }

  // --- Add task to main list ---
  addItemButton.addEventListener("click", () => {
    const itemText = newItemInput.value.trim();
    if (itemText !== "") {
      addChecklistItem(itemText, false, checklist, false);
      newItemInput.value = "";
      saveData();
    }
  });

  newItemInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addItemButton.click();
    }
  });

  // --- Add task to self care list ---
  addCareButton.addEventListener("click", () => {
    const itemText = newCareInput.value.trim();
    if (itemText !== "") {
      addChecklistItem(itemText, false, careChecklist, false);
      newCareInput.value = "";
      saveData();
    }
  });

  newCareInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      addCareButton.click();
    }
  });

  // --- Event Delegation for Deleting and Checking Items ---
  checklist.addEventListener("click", (event) => {
    const target = event.target;
    if (target.type === "checkbox") {
      const listItem = target.closest("li");
      const itemText = listItem.querySelector("span");
      itemText.classList.toggle("line-through", target.checked);
      itemText.classList.toggle("text-gray-400", target.checked);
      saveData();
    } else if (target.textContent === "❌") {
      target.closest("li").remove();
      saveData();
    }
  });

  careChecklist.addEventListener("click", (event) => {
    const target = event.target;
    if (target.type === "checkbox") {
      const listItem = target.closest("li");
      const itemText = listItem.querySelector("span");
      itemText.classList.toggle("line-through", target.checked);
      itemText.classList.toggle("text-gray-400", target.checked);
      saveData();
    } else if (target.textContent === "❌") {
      target.closest("li").remove();
      saveData();
    }
  });

  // --- Initialization ---

  async function init() {
    checklist.innerHTML = "";
    careChecklist.innerHTML = "";

    const savedData = await loadData();
    // savedData is now the list of tasks returned from the backend (already reset if new day)

    if (savedData && savedData.length > 0) {
      const tasksList = savedData.find((list) => list.name === "Daily Tasks");
      const careList = savedData.find((list) => list.name === "Self Care");

      if (tasksList) {
        tasksList.items.forEach((item) =>
          addChecklistItem(item.text, item.completed, checklist, item.isDefault)
        );
      }
      if (careList) {
        careList.items.forEach((item) =>
          addChecklistItem(
            item.text,
            item.completed,
            careChecklist,
            item.isDefault
          )
        );
      }
    } else {
      
      console.warn("No task data received from server. Check server logs.");
    }

    // await saveData();
  }

  init();
});
