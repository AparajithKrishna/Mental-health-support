// Mood Tracker
document.getElementById("mood-select").addEventListener("change", function () {
  document.getElementById("current-mood").innerText = this.value;
});

// Journal Entry (local storage)
function saveJournal() {
  const entry = document.getElementById("journal").value;
  localStorage.setItem("journalEntry", entry);
  document.getElementById("save-status").innerText = "Journal saved!";
}

// Self-Care Tips
const tips = [
  "Take a 10-minute walk outside.",
  "Drink a glass of water.",
  "Write down 3 things you're grateful for.",
  "Try 5 minutes of deep breathing.",
  "Listen to your favorite music.",
  "Call a friend or loved one.",
];

function showTip() {
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  document.getElementById("tip-text").innerText = randomTip;
}

// Motivational Quotes
const quotes = [
  "You are stronger than you think.",
  "This too shall pass.",
  "Be kind to yourself.",
  "Progress, not perfection.",
  "You’ve survived 100% of your worst days.",
];

function showQuote() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("quote-text").innerText = `"${randomQuote}"`;
}
