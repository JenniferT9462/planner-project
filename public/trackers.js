// --- DOM Elements ---
const calendarsWrapper = document.getElementById("calendars-wrapper");
const addCalendarBtn = document.getElementById("add-calendar-btn");
const saveHabitBtn = document.getElementById("save-habit-btn");
const cancelHabitBtn = document.getElementById("cancel-habit-btn");
const habitNameInput = document.getElementById("habit-name");
const dialog = document.getElementById("dialog");
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.querySelector(".sidebar");

addCalendarBtn.addEventListener("click", () => dialog.showModal());
cancelHabitBtn.addEventListener("click", () => dialog.close());

// --- Habit List ---
let habitList = [];

async function loadHabits() {
  const res = await fetch("/api/habits");
  habitList = await res.json();
  habitList.forEach(h => {
    console.log("Loaded habit:", h.name, h.trackedDays);
    createCalendarElement(h.name, h.trackedDays);
  });
}
// --- Create Calendar Element ---
function createCalendarElement(habitName, trackedDays = []) {
  const calendarId = habitName.toLowerCase().replace(/\s+/g, "-");
  const container = document.createElement("div");
  container.classList.add("tracker-calendar-container", "shadow-md", "p-4", "bg-white", "rounded-lg");
  container.id = `calendar-${calendarId}`;

  container.innerHTML = `
    <div class="flex flex-row justify-between items-center mb-2">
      <h2 class="text-center text-primary text-xl font-semibold mb-2">${habitName}</h2>
      <button class="deleteCalendar px-1 py-1 rounded bg-red-500 text-white hover:bg-red-600">❌</button>
    </div>
    <div class="tracker-calendar-header flex justify-between items-center mb-2">
      <h2 class="tracker-currentMonthYear text-lg font-medium"></h2>
      <div>
        <button class="prevMonth px-2 py-1 rounded hover:bg-gray-300">⬅️</button>
        <button class="nextMonth px-2 py-1 rounded hover:bg-gray-300">➡️</button>
      </div>
    </div>
    <div class="tracker-calendar-weekdays grid grid-cols-7 text-center font-semibold mb-1">
      <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
    </div>
    <div class="tracker-calendar-grid grid grid-cols-7 gap-1"></div>
  `;

  calendarsWrapper.appendChild(container);

  // Delete calendar
  const deleteBtn = container.querySelector(".deleteCalendar");
  deleteBtn.addEventListener("click", async () => {
    container.remove();
    await fetch(`/api/habits/${encodeURIComponent(habitName)}`, { method: "DELETE" });
    habitList = habitList.filter(h => h.name !== habitName);
  });

  initializeCalendar(container, habitName, trackedDays);
}

// --- Initialize Calendar ---
function initializeCalendar(container, habitName, trackedDays = []) {
  const prevMonthBtn = container.querySelector(".prevMonth");
  const nextMonthBtn = container.querySelector(".nextMonth");
  const calendarGrid = container.querySelector(".tracker-calendar-grid");
  const currentMonthYear = container.querySelector(".tracker-currentMonthYear");

  let currentDate = new Date();
  let savedDays = [...trackedDays];

  // Save tracked days for this habit
async function saveTrackedDays() {
  const response = await fetch("/api/habits", {
    method: "POST", // your backend already handles create/update
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: habitName, trackedDays: savedDays }),
  });
  const result = await response.json();
  console.log("Saved trackedDays:", savedDays, result);
}

  // Render calendar grid
  function renderCalendar() {
    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthYear.textContent = new Date(year, month).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const lastDayPrevMonth = new Date(year, month, 0).getDate();

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = lastDayPrevMonth - i;
      dayDiv.classList.add("text-gray-400", "other-month", "text-center", "p-1");
      calendarGrid.appendChild(dayDiv);
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = i;
      dayDiv.classList.add("current-month", "text-center", "cursor-pointer", "p-1", "rounded");

      const dateKey = `${year}-${month + 1}-${i}`;
      if (savedDays.includes(dateKey)) dayDiv.classList.add("bg-purple-500", "text-white");

      dayDiv.addEventListener("click", async () => {
        dayDiv.classList.toggle("bg-purple-500");
        dayDiv.classList.toggle("text-white");

        if (savedDays.includes(dateKey)) savedDays = savedDays.filter(d => d !== dateKey);
        else savedDays.push(dateKey);

        await saveTrackedDays();
      });

      calendarGrid.appendChild(dayDiv);
    }

    // Next month padding to fill 42 cells
    const totalCells = calendarGrid.children.length;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      const dayDiv = document.createElement("div");
      dayDiv.textContent = i;
      dayDiv.classList.add("text-gray-400", "other-month", "text-center", "p-1");
      calendarGrid.appendChild(dayDiv);
    }
  }

  // Prev/Next month buttons
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
}

// --- Add New Habit ---
saveHabitBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const habitName = habitNameInput.value.trim();
  if (!habitName) return alert("Please enter a habit name");

  habitList.push({ name: habitName, trackedDays: [] });

  await fetch("/api/habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: habitName, trackedDays: [] }),
  });

  createCalendarElement(habitName, []);
  habitNameInput.value = "";
  dialog.close();
});

// --- Menu Toggle ---
if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => sidebar.classList.toggle("-translate-x-full"));
}

// --- Load Habits on Page Load ---
loadHabits();
