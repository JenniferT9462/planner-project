console.log("Hello from dashboard.js!");
// const { ipcRenderer } = require('electron'); 

// --- API Functions ---
async function fetchJournalEntries() {
    try {
        const response = await fetch("/api/entries");
        if (!response.ok) throw new Error("Failed to fetch journal entries");
        return await response.json();
    } catch (error) {
        console.error("Error fetching journal entries:", error);
        return [];
    }
}

async function fetchHabits() {
    try {
        const response = await fetch("/api/habits");
        if (!response.ok) throw new Error("Failed to fetch habits");
        return await response.json();
    } catch (error) {
        console.error("Error fetching habits:", error);
        return [];
    }
}

async function fetchLists() {
    try {
        const response = await fetch("/api/lists");
        if (!response.ok) throw new Error("Failed to fetch lists");
        return await response.json();
    } catch (error) {
        console.error("Error fetching lists:", error);
        return [];
    }
}

// --- API Functions for Tasks ---
async function fetchTasks() {
    try {
        const response = await fetch("/api/tasks");
        if (!response.ok) throw new Error("Failed to fetch tasks");
        return await response.json();
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
}

async function saveTasks(tasks) {
    try {
        await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tasks),
        });
    } catch (error) {
        console.error("Error saving tasks:", error);
    }
}

// --- Render Functions ---
async function renderJournalSnapshot() {
    const journalList = document.getElementById("journal-list");
    journalList.innerHTML = "";

    const entries = await fetchJournalEntries();

    if (entries.length === 0) {
        journalList.innerHTML = '<li class="text-gray-400">No journal entries yet.</li>';
        return;
    }

    const latestEntries = entries.slice(-3).reverse();
    latestEntries.forEach((entry) => {
        const li = document.createElement("li");
        li.className = "border-b border-gray-200 pb-2 last:border-b-0 last:pb-0";
        const date = entry.date || "No date";
        const content = entry.journalText || "No content";

        li.textContent = `${date}: ${content.substring(0, 50)}...`;
        journalList.appendChild(li);
    });
}

async function renderHabitSnapshot() {
    const habitsList = document.getElementById("habits-list");
    habitsList.innerHTML = "";

    const habits = await fetchHabits();

    if (habits.length === 0) {
        habitsList.innerHTML = '<li class="text-gray-400">No habits added yet.</li>';
        return;
    }

    habits.forEach((habit) => {
        const li = document.createElement("li");
        li.className = "border-b border-gray-200 pb-2 last:border-b-0 last:pb-0";
        li.innerHTML = `<span class="font-medium">✅ ${habit.name}</span>`;
        habitsList.appendChild(li);
    });
}

async function renderNotesSnapshot() {
    const notesList = document.getElementById("notes-list");
    notesList.innerHTML = "";

    const notes = await fetchLists();

    if (notes.length === 0) {
        notesList.innerHTML = '<li class="text-gray-400">No notes or lists yet.</li>';
        return;
    }

    const latestNotes = notes.slice(-3).reverse();
    latestNotes.forEach((note) => {
        const li = document.createElement("li");
        li.className = "border-b border-gray-200 pb-2 last:border-b-0 last:pb-0";
        const title = note.name || "Untitled";

        const itemsPreview = Array.isArray(note.items) && note.items.length > 0
            ? note.items.map(item => typeof item === 'object' ? item.text : item).join(", ")
            : "No items";

        li.textContent = `${title}: ${itemsPreview}`;
        notesList.appendChild(li);
    });
}

async function renderDashboard() {
    await renderJournalSnapshot();
    await renderHabitSnapshot();
    await renderNotesSnapshot();
   
}
document.addEventListener("DOMContentLoaded", () => {
    renderDashboard();
});




