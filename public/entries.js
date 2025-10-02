// Mood images (reuse from your journal.js)
const MOOD_EMOJIS = {
  happy: "assets/happy.png",
  excited: "assets/excited.png",
  calm: "assets/calm.png",
  anxious: "assets/anxious.png",
  sad: "assets/sad.png",
  angry: "assets/angry.png",
};

const container = document.getElementById("entries-container");



// Modal elements
const editModal = document.getElementById("editModal");
const editDate = document.getElementById("editDate");
const editMoodOptions = document.getElementById("editMoodOptions");
const editText = document.getElementById("editText");
const saveEdit = document.getElementById("saveEdit");
const cancelEdit = document.getElementById("cancelEdit");

let entries = [];
let editIndex = null; // which entry we’re editing
let selectedMood = null;

// Load entries
async function loadEntries() {
  try {
    const res = await fetch("/api/entries");   // ✅ correct endpoint
    entries = await res.json();
    renderEntries();                           // ✅ actually displays them
  } catch (err) {
    console.error("Error loading entries:", err);
  }
}
function renderEntries() {
  container.innerHTML = "";

  if (entries.length === 0) {
    container.innerHTML = `<p class="text-center text-lg text-gray-200">No journal entries yet. ✨</p>`;
    return;
  }

  entries.forEach((entry, index) => {
    const card = document.createElement("div");
    card.className =
      "bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-purple-200 hover:scale-[1.02] transition-transform";

    card.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-purple-700">${entry.date}</h2>
        <img src="${MOOD_EMOJIS[entry.mood]}" alt="${
      entry.mood
    }" class="w-12 h-12"/>
      </div>
      <p class="text-gray-800 bg-white/60 p-4 rounded-lg shadow-inner">${
        entry.journalText
      }</p>
      <div class="flex justify-end gap-3 mt-4">
        <button class="edit-btn text-blue-500 hover:text-blue-700">✏️ Edit</button>
        <button class="delete-btn text-red-500 hover:text-red-700">🗑️ Delete</button>
      </div>
    `;
    // Attach button logic
    card
      .querySelector(".edit-btn")
      .addEventListener("click", () => openEditModal(index));
    card
      .querySelector(".delete-btn")
      .addEventListener("click", () => deleteEntry(index));

    container.appendChild(card);
  });
}

// --- Edit Modal Functions ---
function openEditModal(index) {
   
  editIndex = index;
  const entry = entries[index];

  // preload values
  editDate.value = entry.date;
  selectedMood = entry.mood;
  editText.value = entry.journalText;

  // highlight the selected mood icon
  Array.from(editMoodOptions.children).forEach((img) => {
    if (img.dataset.mood === selectedMood) {
      img.classList.add("border-purple-500");
    } else {
      img.classList.remove("border-purple-500");
    }
  });

  editModal.classList.remove("hidden");
  editModal.classList.add("flex");
}

// handle mood selection
Array.from(editMoodOptions.children).forEach((img) => {
  img.addEventListener("click", () => {
    selectedMood = img.dataset.mood;

    // update border highlight
    Array.from(editMoodOptions.children).forEach((i) =>
      i.classList.remove("border-purple-500")
    );
    img.classList.add("border-purple-500");
  });
});

saveEdit.addEventListener("click", async () => {
  if (editIndex !== null) {
    const updated = {
      date: editDate.value.trim() || entries[editIndex].date,
      mood: selectedMood,
      journalText: editText.value.trim() || entries[editIndex].journalText,
    };

    await fetch(`/api/entries/${entries[editIndex].date}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    await loadEntries();
  }
  closeEditModal();
});

cancelEdit.addEventListener("click", closeEditModal);

function closeEditModal() {
  editIndex = null;
  editModal.classList.remove("flex"); 
  editModal.classList.add("hidden");
}

async function deleteEntry(index) {
  if (confirm("Are you sure you want to delete this entry?")) {
    await fetch(`/api/entries/${entries[index].date}`, { method: "DELETE" });
    await loadEntries();
  }
}



// renderEntries();

// Sidebar toggle for mobile
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.querySelector(".sidebar");
if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("-translate-x-full");
  });
}

// Initial load
loadEntries();