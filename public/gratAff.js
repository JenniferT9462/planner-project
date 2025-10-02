console.log("Hello from gratAff.js!");

//DOM Elements
const DOM = {
  sidebar: document.querySelector(".sidebar"),
  menuBtn: document.getElementById("menu-btn"),
  affirmationText: document.getElementById("affirmation-text"),
  addAffirmationBtn: document.getElementById("add-affirmation-btn"),
  gratitudeInput: document.getElementById("gratitude-input"),
  saveGratitudeBtn: document.getElementById("save-gratitude-btn"),
  gratitudeHistory: document.getElementById("gratitude-history"),
  affirmationBtn: document.getElementById("affirmation-shuffle-btn"),
  newAffirmationInput: document.getElementById("new-affirmation-input"),
  addAffirmationBtn: document.getElementById("add-affirmation-btn"),
};

// Data Store
let mindfulData = {
    gratitudeHistory: [],
    customAffirmations: [],
}

// Initial default affirmations
const DEFAULT_AFFIRMATIONS = [
    "I am worthy of all the good things in my life.",
    "My mind is clear and focused.",
    "I choose joy and positivity today.",
    "I am resilient and strong.",
    "I trust my intuition and inner guidance.",
    "I embrace change and welcome new opportunities."
];

// --- Server Interaction Functions ---
async function loadMindfulData() {
    try {
        const response = await fetch("/api/mindful");
        if (!response.ok) throw new Error("Network response was not ok.");
        const data = await response.json();
        // Fallback for missing keys just in case
        mindfulData.gratitudeHistory = data.gratitudeHistory || [];
        mindfulData.customAffirmations = data.customAffirmations || [];
        console.log("Mindful data loaded:", mindfulData);
        renderGratitudeHistory(); // Update the display after loading
        displayRandomAffirmation(); // Update the affirmation display
    } catch (error) {
        console.error("Could not load mindful data:", error);
        // Set to empty arrays on failure and proceed
        mindfulData = { gratitudeHistory: [], customAffirmations: [] };
        DOM.gratitudeHistory.innerHTML = '<p class="text-center text-red-500 py-4">Error loading history.</p>';
        displayRandomAffirmation();
    }
}

async function saveMindfulData() {
    try {
        await fetch("/api/mindful", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(mindfulData),
        });
        console.log("Mindful data saved successfully!");
    } catch (error) {
        console.error("Could not save mindful data:", error);
        alert("Failed to save data to the server.");
    }
}
// --- Rendering Functions ---
function renderGratitudeHistory() {
    if (mindfulData.gratitudeHistory.length === 0) {
        DOM.gratitudeHistory.innerHTML = '<p class="text-center text-gray-500 py-4">No entries yet. Log something amazing!</p>';
        return;
    }

    const html = mindfulData.gratitudeHistory.map(entry => `
        <div class="bg-white/70 p-4 rounded-xl shadow-sm text-gray-800 backdrop-blur-sm">
            <p class="text-xs text-gray-600 font-bold mb-1">${entry.date}</p>
            <p class="whitespace-pre-wrap">${entry.entry}</p>
        </div>
    `).reverse().join(''); // Reverse to show latest first

    DOM.gratitudeHistory.innerHTML = html;
}

function displayRandomAffirmation() {
    const allAffirmations = [...DEFAULT_AFFIRMATIONS, ...mindfulData.customAffirmations];
    if (allAffirmations.length === 0) {
        DOM.affirmationText.textContent = "You are amazing!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * allAffirmations.length);
    DOM.affirmationText.textContent = allAffirmations[randomIndex];
}

// --- Event Handlers ---
function handleSaveGratitude() {
    const entryText = DOM.gratitudeInput.value.trim();
    if (!entryText) {
        alert("Please write something you're grateful for!");
        return;
    }

    const today = new Date().toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const newEntry = {
        date: today,
        entry: entryText,
        timestamp: Date.now(),
    };

    // Add new entry to our data store
    mindfulData.gratitudeHistory.push(newEntry);

    // Save to the server and update the display
    saveMindfulData();
    renderGratitudeHistory();

    // Clear the input
    DOM.gratitudeInput.value = "";
}


function handleAddAffirmation() {
    const newAffirmation = DOM.newAffirmationInput.value.trim();
    if (!newAffirmation) {
        alert("Please enter your affirmation!");
        return;
    }
    
    // Add new affirmation to our data store
    mindfulData.customAffirmations.push(newAffirmation);

    // Save to the server and update the display (so it's available for shuffle)
    saveMindfulData();
    displayRandomAffirmation(); // Display the new one or a random one

    // Clear the input
    DOM.newAffirmationInput.value = "";
    alert("Affirmation saved and ready to use!");
}



// --- Initialization ---
// Mobile sidebar menu
if (DOM.menuBtn && DOM.sidebar) {
  DOM.menuBtn.addEventListener("click", () => {
    DOM.sidebar.classList.toggle("-translate-x-full");
  });
}

DOM.saveGratitudeBtn.addEventListener("click", handleSaveGratitude);
DOM.affirmationBtn.addEventListener("click", displayRandomAffirmation);
DOM.addAffirmationBtn.addEventListener("click", handleAddAffirmation);

loadMindfulData();