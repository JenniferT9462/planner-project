const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

// --- Configuration for Express ---
const PORT = 3000;

// Define the root path for data files
const dataRootPath = path.join(__dirname, "public", "appData");

// FILE_NAMES
const FILE_NAMES = {
  ENTRIES: "entries.json",
  HABITS: "habitData.json",
  LISTS: "lists.json",
  TASKS: "dailyTasks.json",
  TIME_TRACKER: "timetracker.json",
  MINDFUL: "mindfulData.json",
};

/**

 * @param {string} fileName The name of the file (e.g., 'entries.json').
 * @returns {string} The absolute file path.
 */
function getFilePath(fileName) {
  return path.join(dataRootPath, fileName);
}

function ensureDataFiles() {
  // Check and create the full data directory path: PLANNER-APP/public/appData
  if (!fs.existsSync(dataRootPath))
    fs.mkdirSync(dataRootPath, { recursive: true });

  if (!fs.existsSync(getFilePath(FILE_NAMES.ENTRIES)))
    fs.writeFileSync(getFilePath(FILE_NAMES.ENTRIES), "[]");
  if (!fs.existsSync(getFilePath(FILE_NAMES.HABITS)))
    fs.writeFileSync(getFilePath(FILE_NAMES.HABITS), "[]");
  if (!fs.existsSync(getFilePath(FILE_NAMES.LISTS)))
    fs.writeFileSync(getFilePath(FILE_NAMES.LISTS), "[]");
  if (!fs.existsSync(getFilePath(FILE_NAMES.TASKS)))
    fs.writeFileSync(getFilePath(FILE_NAMES.TASKS), "{}");
  if (!fs.existsSync(getFilePath(FILE_NAMES.TIME_TRACKER)))
    fs.writeFileSync(getFilePath(FILE_NAMES.TIME_TRACKER), "{}");
  if (!fs.existsSync(getFilePath(FILE_NAMES.MINDFUL)))
    fs.writeFileSync(
      getFilePath(FILE_NAMES.MINDFUL),
      '{"gratitudeHistory": [], "customAffirmations": []}'
    );
}

// Ensure data files are ready before starting the server
ensureDataFiles();

// --- Middleware ---
// Handles JSON body parsing
app.use(express.json());
// Serves static files from the 'public' folder (PLANNER-APP/public)
app.use(express.static(path.join(__dirname, "public")));

//====== Journal Entry ======

// GET all entries
app.get("/api/entries", (req, res) => {
  const filePath = getFilePath(FILE_NAMES.ENTRIES);
  try {
    const dataContent = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(dataContent);
    res.json(data);
  } catch (err) {
    console.error(`Error loading/parsing data from: ${filePath}`, err);
    res.json([]);
  }
});

// Add a new entry (WRITE)
app.post("/api/entries", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.ENTRIES);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const filtered = data.filter((e) => e.date !== req.body.date);
    filtered.push(req.body);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error writing to entries file:", err);
    res.status(500).send("Error writing to entries file.");
  }
});

// Edit an entry
app.put("/api/entries/:date", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.ENTRIES);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const index = data.findIndex((e) => e.date === req.params.date);
    if (index >= 0) {
      data[index] = req.body;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Entry not found" });
    }
  } catch (err) {
    console.error("Error writing to entries file:", err);
    res.status(500).send("Error writing to entries file.");
  }
});

// Delete an entry
app.delete("/api/entries/:date", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.ENTRIES);
    let data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    data = data.filter((e) => e.date !== req.params.date);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting entry:", err);
    res.status(500).send("Error deleting entry.");
  }
});

//====== Habit Trackers ======

// Get all habit calendars (READ)
app.get("/api/habits", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.HABITS);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error("Error reading habits file:", err);
    res.json([]);
  }
});

// Add or update a habit calendar (READ/WRITE)
app.post("/api/habits", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.HABITS);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const habit = req.body;
    const filtered = data.filter((h) => h.name !== habit.name);
    filtered.push(habit);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error, invalid JSON");
  }
});

// Delete a habit (READ/WRITE)
app.delete("/api/habits/:name", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.HABITS);
    let data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    data = data.filter((h) => h.name !== req.params.name);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting habit:", err);
    res.status(500).send("Error deleting habit.");
  }
});

//====== Lists ======
//GET all lists (READ)
app.get("/api/lists", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.LISTS);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// Save all lists (replace all lists with the new data) (WRITE)
app.post("/api/lists", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.LISTS);
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error writing to lists file.");
  }
});

//====== Daily Tasks Routes ======

//function to get today's date in YYYY-MM-DD format
function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

//  function to create the default task structure
function getDefaultTasks() {
  const defaultTasks = [
    { text: "Sweep", completed: false, isDefault: true },
    { text: "Dishes", completed: false, isDefault: true },
    { text: "Organize", completed: false, isDefault: true },
    { text: "Litter Box", completed: false, isDefault: true },
    { text: "Wipe Counters", completed: false, isDefault: true },
    { text: "Trash", completed: false, isDefault: true },
    { text: "Make Bed", completed: false, isDefault: true },
  ];
  const defaultCare = [
    { text: "Brush Hair", completed: false, isDefault: true },
    { text: "Brush Teeth", completed: false, isDefault: true },
    { text: "Wash Face", completed: false, isDefault: true },
    { text: "Vitamins", completed: false, isDefault: true },
    { text: "Yoga", completed: false, isDefault: true },
    { text: "Meds", completed: false, isDefault: true },
  ];

  return [
    { name: "Daily Tasks", type: "checklist", items: defaultTasks },
    { name: "Self Care", type: "checklist", items: defaultCare },
  ];
}

// GET all tasks
app.get("/api/tasks", (req, res) => {
  const filePath = getFilePath(FILE_NAMES.TASKS);
  let savedData = {}; // Default to empty object

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");

    if (fileContent.trim() !== "") {
      try {
        savedData = JSON.parse(fileContent);
      } catch (e) {
        console.error("Error parsing TASKS JSON, resetting data:", e);
        savedData = {}; // Reset to empty if corrupted
      }
    }
  } catch (err) {
    console.error("Error reading tasks file (file access failure):", err);
  }

  const today = getTodayDate();
  let tasksToReturn = [];

  // The logic to reset tasks if the data is invalid or a new day
  if (
    !savedData.lastResetDate ||
    savedData.lastResetDate !== today ||
    !savedData.tasks
  ) {
    console.log("Tasks data reset triggered.");

    let defaults = getDefaultTasks();

    tasksToReturn = defaults;
    const newSaveData = {
      lastResetDate: today,
      tasks: tasksToReturn,
    };

    // Save the new, clean default list using the CORRECT path
    try {
      fs.writeFileSync(filePath, JSON.stringify(newSaveData, null, 2));
    } catch (writeErr) {
      console.error("FATAL: Could not write tasks file after reset.", writeErr);
    }
  } else {
    tasksToReturn = savedData.tasks;
  }

  res.json(tasksToReturn);
});

// Save all tasks
app.post("/api/tasks", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.TASKS);
    const dataToSave = {
      lastResetDate: getTodayDate(),
      tasks: req.body, // req.body is the array of lists from the frontend
    };

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error writing to tasks file:", err);
    res.status(500).send("Error writing to tasks file.");
  }
});

//====== Time Tracker Routes ======

// GET all time tracker data
app.get("/api/timetracker", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.TIME_TRACKER);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error("Error reading time tracker file:", err);
    // Return a default structure on read error
    const defaultData = {
      currentEntries: [],
      archivedMonths: [],
      lastMonthChecked: new Date().getMonth().toString(),
      archiveYear: new Date().getFullYear(),
    };
    res.json(defaultData);
  }
});

// Save all time tracker data
app.post("/api/timetracker", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.TIME_TRACKER);
    // The request body should contain the full timeTrackerData object
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error writing to time tracker file:", err);
    res.status(500).send("Error writing to time tracker file.");
  }
});

// ====== Gratitude & Affirmations ======
// GET all mindful data
app.get("/api/mindful", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.MINDFUL);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(data);
  } catch (err) {
    console.error("Error reading mindful data file:", err);
    // Return a default structure on read error
    res.json({ gratitudeHistory: [], customAffirmations: [] });
  }
});

// Save all mindful data
app.post("/api/mindful", (req, res) => {
  try {
    const filePath = getFilePath(FILE_NAMES.MINDFUL);
    // The request body should contain the full mindful data object:
    // { gratitudeHistory: [...], customAffirmations: [...] }
    fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error writing to mindful data file:", err);
    res.status(500).send("Error writing to mindful data file.");
  }
});

// --- Server Start ---

// The standard way to start an Express server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
