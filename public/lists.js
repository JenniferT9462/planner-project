// --- State & DOM Element References ---
const DOM = {
    listsContainer: document.getElementById("listsContainer"),
    addListBtn: document.getElementById("addListBtn"),
    addListModal: document.getElementById("addListModal"),
    addListContent: document.getElementById("addListContent"),
    cancelBtn: document.getElementById("cancelBtn"),
    newListForm: document.getElementById("newListForm"),
    menuBtn: document.getElementById("menu-btn"),
    sidebar: document.querySelector(".sidebar"),
};

// --- Custom Prompt Modal (Replacement for prompt()) ---

/**
 * Creates and shows a custom prompt/modal to replace the disallowed prompt().
 * @param {string} title - The title of the prompt modal.
 * @param {string} defaultValue - The default text value for the input.
 * @param {function(string): void} onSave - Callback function when Save is clicked, receives the trimmed input value (or null if canceled).
 */
function showPrompt(title, defaultValue = '', onSave) {
    let overlay = document.getElementById('customPromptOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'customPromptOverlay';
        // Tailwind classes for fixed, centered overlay
        overlay.className = 'fixed inset-0 z-50 bg-black/70 **backdrop-blur-sm** flex items-center justify-center hidden opacity-0 transition-opacity duration-300';
        overlay.innerHTML = `
            <div id="customPromptContent" class="bg-gray-800 p-6 rounded-xl shadow-2xl w-full max-w-sm transform scale-95 transition-all duration-300">
                <h3 id="promptTitle" class="text-xl font-semibold text-white mb-4"></h3>
                <textarea id="promptInput" rows="3" class="w-full p-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"></textarea>
                <div class="mt-4 flex justify-end space-x-3">
                    <button id="promptCancel" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition">Cancel</button>
                    <button id="promptSave" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Attach event handlers to the static buttons within the overlay
        document.getElementById('promptCancel').addEventListener('click', () => {
            onSave(null); // Pass null on cancel
            hidePrompt();
        });
        // Click outside closes modal
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                onSave(null); 
                hidePrompt();
            }
        });
    }

    document.getElementById('promptTitle').textContent = title;
    const input = document.getElementById('promptInput');
    input.value = defaultValue;
    
    // Re-attach save handler with the correct callback
    document.getElementById('promptSave').onclick = () => {
        onSave(input.value.trim());
        hidePrompt();
    };

    // Show the modal with transition effects
    overlay.classList.remove('hidden', 'opacity-0');
    overlay.classList.add('flex');
    setTimeout(() => {
        overlay.classList.add('opacity-100');
        document.getElementById('customPromptContent').classList.remove('scale-95');
        document.getElementById('customPromptContent').classList.add('scale-100');
        input.focus();
    }, 10);
}

function hidePrompt() {
    const overlay = document.getElementById('customPromptOverlay');
    if (overlay) {
        document.getElementById('customPromptContent').classList.remove('scale-100');
        document.getElementById('customPromptContent').classList.add('scale-95');
        overlay.classList.remove('opacity-100');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300); // Wait for transition
    }
}


// --- Helper Functions ---

/**
 * Creates a single list item for a checklist.
 * @param {HTMLElement} listElement - The parent <ul> element.
 * @param {string} itemText - The text content of the list item.
 * @param {boolean} isCompleted - Whether the item is completed (for loading).
 * @param {boolean} insertAtTop - If true, prepends the element; otherwise, uses smart insertion for checklist ordering.
 */
function createChecklistItem(listElement, itemText, isCompleted = false, insertAtTop = false) {
    const li = document.createElement("li");
    li.className =
        "p-3 bg-white/20 rounded-lg shadow-md hover:bg-white/30 transition cursor-pointer flex items-center gap-2";
    li.dataset.completed = isCompleted;

    const checkMark = document.createElement("span");
    checkMark.className = `w-5 h-5 rounded-full flex-shrink-0 border-2 transition-colors duration-300 ${
        isCompleted ? "bg-green-500 border-green-500" : "border-white"
    }`;
    li.appendChild(checkMark);

    const span = document.createElement("span");
    span.className = `flex-1 pr-3 ${
        isCompleted ? "line-through text-gray-400" : "text-white"
    }`;
    span.textContent = itemText;
    li.appendChild(span);

    const buttonContainer = document.createElement("div");
    buttonContainer.className = "flex space-x-2 ml-auto gap-2";

    const editBtn = document.createElement("button");
    editBtn.className =
        "editBtn w-7 h-7 flex items-center justify-center rounded-full text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-80";
    editBtn.innerHTML = "✏️";
    buttonContainer.appendChild(editBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.className =
        "deleteBtn w-7 h-7 flex items-center justify-center rounded-full text-white bg-gradient-to-r from-red-500 to-pink-500 hover:opacity-80";
    deleteBtn.innerHTML = "❌";
    buttonContainer.appendChild(deleteBtn);

    li.appendChild(buttonContainer);

    // Attach click handler to the entire li
    li.addEventListener("click", (e) => {
        // Avoid toggling when clicking a button
        if (e.target.closest("button")) return;

        const isNowCompleted = li.dataset.completed === "false";
        li.dataset.completed = isNowCompleted;
        span.classList.toggle("line-through", isNowCompleted);
        span.classList.toggle("text-gray-400", isNowCompleted);
        checkMark.classList.toggle("bg-green-500", isNowCompleted);
        checkMark.classList.toggle("border-green-500", isNowCompleted);
        checkMark.classList.toggle("border-white", !isNowCompleted);

        if (isNowCompleted) {
            listElement.appendChild(li); // Move to bottom
        } else {
            const firstCompleted = listElement.querySelector(
                '[data-completed="true"]'
            );
            if (firstCompleted) {
                listElement.insertBefore(li, firstCompleted);
            } else {
                listElement.prepend(li); // Move to top if no others are completed
            }
        }
        saveLists();
    });

    // Attach delete handler
    deleteBtn.addEventListener("click", () => {
        li.remove();
        saveLists();
    });

    // Attach edit handler (using custom prompt)
    editBtn.addEventListener("click", () => {
        const currentText = span.textContent;
        showPrompt("Edit Item Text", currentText, (newText) => {
            if (newText !== null && newText.trim() !== "" && newText.trim() !== currentText) {
                span.textContent = newText.trim();
                saveLists();
            }
        });
    });

    // --- Insertion Logic ---
    if (insertAtTop) {
        // New items should always go to the very top (highest priority)
        listElement.prepend(li);
    } else {
        // For loading, append maintains the saved/sorted order (Incomplete 1, Incomplete 2...)
        // This is only used during the initial load or list creation.
        listElement.appendChild(li);
    }
}

/**
 * Renders the content structure for a Note type list, enabling editing.
 * @param {HTMLElement} listElement - The parent <ul> element (which holds the note structure).
 * @param {string} noteText - The initial text content of the note.
 */
function createNote(listElement, noteText = "") {
    // Note: The original implementation was a bit verbose, I'll stick close to it.
    listElement.innerHTML = `
        <div class="p-3 bg-white/20 rounded-lg shadow-md min-h-[150px] flex flex-col relative">
            <p class="note-content text-white whitespace-pre-wrap flex-1 overflow-y-auto">${noteText}</p>
            <button class="editNoteBtn absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:opacity-80 transition text-lg" title="Edit Note">✏️</button>
        </div>
    `;

    const p = listElement.querySelector(".note-content");
    const editNoteBtn = listElement.querySelector(".editNoteBtn");

    // Use custom prompt for note editing
    editNoteBtn.addEventListener("click", () => {
        const currentText = p.textContent;
        showPrompt("Edit Note Content", currentText, (newText) => {
            if (newText !== null) { 
                const updatedText = newText.trim();
                if (updatedText !== currentText) {
                    p.textContent = updatedText;
                    saveLists();
                }
            }
        });
    });
}


// --- API/Persistence Functions (Reverting to original fetch pattern) ---

/**
 * Serializes the current DOM state of all lists and sends it to the /api/lists POST endpoint.
 */
async function saveLists() {
    const allLists = [];
    DOM.listsContainer.querySelectorAll('[data-custom="true"]').forEach((col) => {
        const name = col.querySelector("h2").textContent.trim();
        const type = col.dataset.type || "checklist";
        let items = [];

        if (type === "checklist") {
            items = Array.from(col.querySelectorAll("ul li"))
                .map((li) => {
                    // Span for text content
                    const textElement = li.querySelector("span:not(.w-5)"); 
                    const text = textElement ? textElement.textContent.trim() : "";
                    return {
                        text,
                        completed: li.dataset.completed === "true",
                    };
                })
                .filter((item) => item.text !== "");
        } else if (type === "notes") {
            // For notes, the content is in the p element inside the ul container
            items = [col.querySelector(".note-content")?.textContent || ""];
        }

        allLists.push({ name, type, items });
    });

    try {
        const response = await fetch("/api/lists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(allLists),
        });
        
        if (!response.ok) {
            console.error("Server save failed:", response.statusText);
        }

    } catch (e) {
        // This catch block handles network errors (e.g., if the Electron backend isn't running)
        console.error("Error saving lists via fetch:", e);
    }
}

/**
 * Fetches the saved lists data from the /api/lists GET endpoint and re-renders the UI.
 */
async function loadLists() {
    let allLists = [];
    try {
        const response = await fetch("/api/lists");
        if (!response.ok) {
            // If the server returns a non-200 status (e.g., 404), throw an error
            throw new Error(`Failed to load lists: Status ${response.status}`);
        }
        allLists = await response.json();
    } catch (e) {
        console.warn("Could not load lists from /api/lists (assuming first run or server not ready):", e);
        // Fallback to empty array if fetch fails
        allLists = []; 
    }

    DOM.listsContainer.innerHTML = "";
    allLists.forEach((list) => {
        // Pass false for shouldSave to prevent saving the same data back immediately
        renderNewList(list.name, list.type, list.items, false);
    });
}

/**
 * Renders a new list column in the DOM.
 */
function renderNewList(
    listName,
    listType = "checklist",
    items = [],
    shouldSave = true
) {
    const col = document.createElement("div");
    // Updated classes for better responsive layout on an Electron window
    col.className = "p-4 w-full";
    col.dataset.custom = "true";
    col.dataset.type = listType;

    col.innerHTML = `
        <div class="rounded-2xl bg-white/10 backdrop-blur-lg p-4 shadow-xl hover:shadow-2xl transition">
            <div class="flex justify-between items-center text-white text-center font-bold mb-4">
                <h2 class="text-2xl font-semibold text-blue-200">${listName}</h2>
                <div class="flex space-x-2">
                    <button class="bg-yellow-400 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded-full text-sm editListName" title="Edit List Name">✏️</button>
                    <button class="bg-green-400 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-full text-sm addItem" title="Add Item" style="${
                        listType === "notes" ? "display:none" : ""
                    } ">➕</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-sm deleteList" title="Delete List">❌</button>
                </div>
            </div>
            <ul class="list-none space-y-2 min-h-[100px] sm:min-h-[200px]"></ul>
        </div>
    `;

    const ul = col.querySelector("ul");

    if (listType === "checklist") {
        const convertedItems = items.map((item) => {
            if (typeof item === "string") {
                return {
                    text: item,
                    completed: false,
                };
            }
            return item;
        });

        convertedItems
            .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
            .forEach((item) => {
                if (item.text.trim() !== "") {
                    // When loading, do NOT insert at top (insertAtTop=false, the default)
                    createChecklistItem(ul, item.text, item.completed, false);
                }
            });

        // REPLACEMENT for prompt() when adding item
        col.querySelector(".addItem").addEventListener("click", () => {
            showPrompt("Add New Checklist Item", "", (newItem) => {
                if (newItem) {
                    // When adding a new item, set insertAtTop=true
                    createChecklistItem(ul, newItem, false, true);
                    saveLists();
                }
            });
        });
    } else if (listType === "notes") {
        createNote(ul, items[0] || "Click the edit button to start writing your note.");
    }

    // Attach delete list handler
    col.querySelector(".deleteList").addEventListener("click", () => {
        col.remove();
        saveLists();
    });

    // REPLACEMENT for prompt() when renaming list
    col.querySelector(".editListName").addEventListener("click", () => {
        const header = col.querySelector("h2");
        const currentName = header.textContent;
        showPrompt("Rename List:", currentName, (newName) => {
            if (newName && newName.trim() !== "" && newName.trim() !== currentName) {
                header.textContent = newName.trim();
                saveLists();
            }
        });
    });

    DOM.listsContainer.appendChild(col);
    if (shouldSave) saveLists();
}

// --- Event Listeners ---
function attachEventListeners() {
    // Mobile sidebar menu
    if (DOM.menuBtn && DOM.sidebar) {
        DOM.menuBtn.addEventListener("click", () => {
            DOM.sidebar.classList.toggle("-translate-x-full");
        });
    }

    // Open Modal
    DOM.addListBtn.addEventListener("click", () => {
        DOM.addListModal.classList.remove("hidden", "opacity-0");
        DOM.addListModal.classList.add("flex", "opacity-100");
        DOM.addListContent.classList.remove("scale-95", "opacity-0");
        DOM.addListContent.classList.add("scale-100", "opacity-100");
        
        // Use a slight delay to ensure the modal's display change has taken effect for focus
        setTimeout(() => {
            const listNameInput = document.getElementById("listName");
            if (listNameInput) listNameInput.focus();
        }, 150);
    });

    // Close modal
    DOM.cancelBtn.addEventListener("click", closeModal);
    DOM.addListModal.addEventListener("click", (e) => {
        if (e.target === DOM.addListModal) closeModal();
    });

    // Create new list
    DOM.newListForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const listName = document.getElementById("listName").value.trim();
        const listType = document.getElementById("listType").value;
        const firstItem = document.getElementById("firstItem").value.trim();

        const items = firstItem
            ? listType === "checklist"
                ? [{ text: firstItem, completed: false }]
                : [firstItem]
            : [];

        if (listName) {
            renderNewList(listName, listType, items, true);
            DOM.newListForm.reset();
            closeModal();
        }
    });
}

function closeModal() {
    DOM.addListModal.classList.remove("flex", "opacity-100");
    DOM.addListModal.classList.add("hidden", "opacity-0");
    DOM.addListContent.classList.remove("scale-100", "opacity-100");
    DOM.addListContent.classList.add("scale-95", "opacity-0");
    DOM.newListForm.reset();
}

// --- Initialization ---
function init() {
    attachEventListeners();
    // Load lists from the assumed local API endpoint
    loadLists();
}

window.onload = init;
