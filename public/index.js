// index.js

// 1. Define the list of potential goals (more ideas below!)
const dailyGoals = [
    "Take a 15-minute walk outside 👟",
    "Organize one small drawer or shelf 🧹",
    "Drink a full glass of water right now 💧",
    "Practice a new skill for 10 minutes.",
    "Spend 10 minutes stretching or doing yoga 🧘‍♀️",
    "Send a positive text message to a friend or family member ❤️",
    "Read 3 pages of a book or article 📚",
    "Declutter your desktop or phone home screen ✨",
    "Practice deep breathing for 5 minutes 🌬️",
    "Write down three things you are grateful for 🙏",
    "Clean a mirror or window until it shines ✨",
    "Knit something 🧶",
    "Make some art. 🎨",
    "Work on Household project. 🏡",
    "Touch Grass. 🌿",
    
];

// 2. Function to select and display a random goal
function displayRandomGoal() {
    const goalTextElement = document.getElementById('dailyGoalText');
    
    // Select a random index from the goals array
    const randomIndex = Math.floor(Math.random() * dailyGoals.length);
    const randomGoal = dailyGoals[randomIndex];
    
    // Display the goal
    if (goalTextElement) {
        goalTextElement.textContent = randomGoal;
    }
}

// 3. Run the function when the page loads
document.addEventListener('DOMContentLoaded', displayRandomGoal);