console.log("Hello from script.js!");

// --- State Variables ---
let entries = [];
let selectedMood = null;
let currentDate = new Date();

// --- DOM Element References ---
const DOM = {
  moodOptions: document.getElementById("mood-options"),
  journalEntry: document.getElementById("journal-entry"),
  calendar: document.getElementById("calendar"),
  entryDateInput: document.getElementById("entry-date"),
  currentMonthYear: document.getElementById("current-month-year"),
  prevMonthBtn: document.getElementById("prev-month"),
  nextMonthBtn: document.getElementById("next-month"),
  saveEntryBtn: document.getElementById("save-entry"),
  averageMood: document.getElementById("average-mood"),
  daysTracking: document.getElementById("days-tracking"),
  currentStreak: document.getElementById("current-streak"),
  messageModal: document.getElementById("message-modal"),
  modalText: document.getElementById("modal-text"),
  modalCloseBtn: document.getElementById("modal-close"),
  menuBtn: document.getElementById("menu-btn"),
  sidebar: document.querySelector(".sidebar"),
};

// --- Constants ---
const MOOD_EMOJIS = {
  happy: "assets/happy.png",
  excited: "assets/excited.png",
  calm: "assets/calm.png",
  anxious: "assets/anxious.png",
  sad: "assets/sad.png",
  angry: "assets/angry.png",
};

const MOOD_VALUES = {
  happy: 5,
  excited: 5,
  calm: 4,
  anxious: 2,
  sad: 1,
  angry: 1,
};

// --- Helper Functions ---
function showModal(message) {
  DOM.modalText.textContent = message;
  DOM.messageModal.classList.remove("hidden");
}

function clearMoodSelection() {
  selectedMood = null;
  document.querySelectorAll(".mood-icon.selected").forEach(icon => {
    icon.classList.remove("selected");
  });
}

function updateCalendarHeader() {
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  DOM.currentMonthYear.textContent = `${monthName} ${year}`;
}

// --- API Functions ---
async function loadEntries() {
  try {
    const res = await fetch("/api/entries");
    if (!res.ok) throw new Error("Failed to load entries");
    entries = await res.json();
  } catch (error) {
    console.error("Error loading entries:", error);
    entries = []; // fallback to empty
  }
  updateUI();
}

async function saveJournalEntry(entry) {
  try {
    await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    await loadEntries();
  } catch (error) {
    console.error("Error saving entry:", error);
    showModal("Failed to save entry. Try again.");
  }
}

async function editJournalEntry(date, updatedEntry) {
  try {
    await fetch(`/api/entries/${date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedEntry),
    });
    await loadEntries();
  } catch (error) {
    console.error("Error editing entry:", error);
  }
}

async function deleteJournalEntry(date) {
  try {
    await fetch(`/api/entries/${date}`, { method: "DELETE" });
    await loadEntries();
  } catch (error) {
    console.error("Error deleting entry:", error);
  }
}

// --- Event Handlers ---
function handleMoodSelection(e) {
  const icon = e.target.closest(".mood-icon");
  if (!icon) return;
  clearMoodSelection();
  selectedMood = icon.getAttribute("data-mood");
  icon.classList.add("selected");
}

async function handleEntrySave(e) {
  e.preventDefault();
  const journalText = DOM.journalEntry.value.trim();
  const selectedDate = DOM.entryDateInput.value;

  console.log(`DEBUG: journalText.length is ${journalText.length}`);
  console.log(`DEBUG: selectedMood is ${selectedMood}`);

  if (!selectedMood) return showModal("Please select a mood before saving.");
    // if (!journalText) return showModal("Please write a journal entry before saving.");
  if (journalText === "") return showModal("Please write a journal entry before saving.");


  const newEntry = { date: selectedDate, mood: selectedMood, journalText };
  await saveJournalEntry(newEntry);

  DOM.journalEntry.value = "";
  clearMoodSelection();
  showModal("Entry Saved! 🎉");
}

function handleCalendarClick(e) {
  const dayBox = e.target.closest(".calendar-day");
  if (!dayBox || dayBox.classList.contains("empty")) return;

  const dateStr = dayBox.getAttribute("data-date");
  DOM.entryDateInput.value = dateStr;
  clearMoodSelection();

  const entry = entries.find(e => e.date === dateStr);
  if (entry) {
    DOM.journalEntry.value = entry.journalText;
    selectedMood = entry.mood;
    const moodIcon = document.querySelector(`.mood-icon[data-mood="${entry.mood}"]`);
    if (moodIcon) moodIcon.classList.add("selected");
  } else {
    DOM.journalEntry.value = "";
  }
}

function handleMonthChange(monthChange) {
  currentDate.setMonth(currentDate.getMonth() + monthChange);
  updateUI();
}

// --- Render Functions ---
function renderCalendar() {
  if (!DOM.calendar) return;

  DOM.calendar.innerHTML = "";
  updateCalendarHeader();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const grid = document.createElement("div");
  grid.className = "calendar-grid";

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach(day => {
    const header = document.createElement("div");
    header.className = "calendar-header";
    header.textContent = day;
    grid.appendChild(header);
  });

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayBox = document.createElement("div");
    dayBox.className = "calendar-day";
    dayBox.setAttribute("data-date", dateStr);

    const num = document.createElement("div");
    num.className = "day-number";
    num.textContent = day;
    dayBox.appendChild(num);

    const entry = entries.find(e => e.date === dateStr);
    if (entry && MOOD_EMOJIS[entry.mood]) {
      const img = document.createElement("img");
      img.src = MOOD_EMOJIS[entry.mood];
      img.alt = entry.mood;
      img.className = "calendar-mood-icon";
      dayBox.appendChild(img);
    }

    grid.appendChild(dayBox);
  }

  DOM.calendar.appendChild(grid);
}

function updateStats() {
  if (entries.length === 0) {
    DOM.averageMood.textContent = "--";
    DOM.daysTracking.textContent = "0";
    DOM.currentStreak.textContent = "0";
    return;
  }

  const totalMoodValue = entries.reduce((sum, entry) => sum + (MOOD_VALUES[entry.mood] || 0), 0);
  DOM.averageMood.textContent = (totalMoodValue / entries.length).toFixed(1);
  DOM.daysTracking.textContent = entries.length;

  const sortedDates = entries.map(e => e.date).sort();
  let streakCount = 1;
  for (let i = sortedDates.length - 2; i >= 0; i--) {
    const dayBefore = new Date(sortedDates[i]);
    const currentDay = new Date(sortedDates[i + 1]);
    const dayDiff = (currentDay - dayBefore) / (1000 * 3600 * 24);
    if (Math.abs(dayDiff) === 1) streakCount++;
    else break;
  }
  DOM.currentStreak.textContent = sortedDates.length ? streakCount : 0;
}

function updateUI() {
  renderCalendar();
  updateStats();
}

// --- Initialize App ---
async function initApp() {
  DOM.moodOptions.addEventListener("click", handleMoodSelection);
  DOM.saveEntryBtn.addEventListener("click", handleEntrySave);
  DOM.calendar.addEventListener("click", handleCalendarClick);
  DOM.prevMonthBtn.addEventListener("click", () => handleMonthChange(-1));
  DOM.nextMonthBtn.addEventListener("click", () => handleMonthChange(1));
  DOM.modalCloseBtn.addEventListener("click", () => DOM.messageModal.classList.add("hidden"));

  if (DOM.menuBtn && DOM.sidebar) {
    DOM.menuBtn.addEventListener("click", () => DOM.sidebar.classList.toggle("-translate-x-full"));
  }

  const now = new Date();
  DOM.entryDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  await loadEntries(); // load entries and render calendar
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", initApp);
