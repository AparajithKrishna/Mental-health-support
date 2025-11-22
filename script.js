// Mood Tracker
document.getElementById("mood-select").addEventListener("change", function () {
  document.getElementById("current-mood").innerText = this.value;
});

document.addEventListener('DOMContentLoaded', function() {
  // GSAP Animations
  const timeline = gsap.timeline({ defaults: { ease: "power2.inOut" }});
  
  // Initial animations
  timeline
    .from('.header', { opacity: 0, y: -30, duration: 1 })
    .from('.app-nav', { opacity: 0, y: -20, duration: 0.8 }, '-=0.5')
    .from('.content-section.active', { opacity: 0, y: 20, duration: 0.8 }, '-=0.5');
  
  // Setup current date for journal
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('journal-date').innerText = today.toLocaleDateString('en-US', options);

  // Initialize section navigation
  setupNavigation();
  
  // Initialize data from localStorage
  initializeFromStorage();
  
  // Show initial data
  showRandomQuote();
  showRandomTip();
  
  // Setup event listeners
  setupEventListeners();
  
  // Animation for content changes
  animateContentChanges();
});

// Navigation setup
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons and sections
      navButtons.forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
      });
      
      // Add active class to current button
      this.classList.add('active');
      
      // Get the section to show
      const sectionId = `${this.getAttribute('data-section')}-section`;
      const section = document.getElementById(sectionId);
      
      // Animate section transition
      gsap.fromTo(section, 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
      
      // Show the section
      section.classList.add('active');
    });
  });
}

// Initialize data from localStorage
function initializeFromStorage() {
  // Load journal entry if exists
  const savedJournal = localStorage.getItem('journalEntry');
  if (savedJournal) {
    document.getElementById('journal').value = savedJournal;
  }
  
  // Load mood history if exists
  const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
  if (moodHistory.length > 0) {
    displayMoodHistory(moodHistory);
  }
  
  // Load saved quotes if exists
  const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
}

// Setup all event listeners
function setupEventListeners() {
  // Mood Tracker
  document.getElementById('mood-select').addEventListener('change', function() {
    const mood = this.value;
    document.getElementById('current-mood').innerText = mood;
    
    // Update the mood icon
    const moodIcon = mood.split(' ')[0];
    document.querySelector('.mood-icon').innerText = moodIcon;
    
    // Save mood to history
    saveMood(mood);
    
    // Animate the mood selection
    gsap.from('.mood-icon', { 
      scale: 1.5, 
      duration: 0.5,
      ease: "elastic.out(1, 0.3)" 
    });
  });
  
  // View journal entries button
  document.getElementById('view-journals-btn').addEventListener('click', function() {
    toggleJournalHistory();
  });
}

// Mood tracking functions
function saveMood(mood) {
  const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
  const today = new Date();
  
  moodHistory.push({
    mood: mood,
    timestamp: today.toISOString()
  });
  
  // Keep only last 7 days
  while (moodHistory.length > 7) {
    moodHistory.shift();
  }
  
  localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
  
  // Update chart
  displayMoodHistory(moodHistory);
}

function displayMoodHistory(moodHistory) {
  const chartContainer = document.getElementById('mood-chart');
  
  if (moodHistory.length === 0) {
    chartContainer.innerHTML = '<p>Your mood tracking will appear here over time</p>';
    return;
  }
  
  // Simple text-based history for now
  let historyHTML = '<div class="mood-timeline">';
  
  moodHistory.forEach(entry => {
    const date = new Date(entry.timestamp);
    historyHTML += `
      <div class="mood-entry">
        <div class="mood-date">${date.toLocaleDateString()}</div>
        <div class="mood-emoji">${entry.mood.split(' ')[0]}</div>
      </div>
    `;
  });
  
  historyHTML += '</div>';
  chartContainer.innerHTML = historyHTML;
  
  // Animate the new chart
  gsap.from('.mood-entry', {
    opacity: 0,
    y: 10,
    stagger: 0.1,
    duration: 0.4
  });
}

// Journal functions
function saveJournal() {
  const entry = document.getElementById('journal').value;
  if (!entry.trim()) {
    showStatusMessage('Please write something first!', 'error');
    return;
  }
  
  // Save current entry
  localStorage.setItem('journalEntry', entry);
  
  // Save to journal history
  const journalHistory = JSON.parse(localStorage.getItem('journalHistory')) || [];
  journalHistory.push({
    entry: entry,
    timestamp: new Date().toISOString()
  });
  
  // Save history
  localStorage.setItem('journalHistory', JSON.stringify(journalHistory));
  
  // Show success message with animation
  showStatusMessage('Journal saved successfully!');
  
  // Animate the save button
  gsap.from('#save-journal-btn', {
    backgroundColor: '#4CAF50',
    duration: 1
  });
}

function showStatusMessage(message, type = 'success') {
  const statusEl = document.getElementById('save-status');
  statusEl.innerText = message;
  statusEl.className = `status-message ${type}`;
  
  // Animate the message
  gsap.fromTo(statusEl, 
    { opacity: 0, y: -10 }, 
    { opacity: 1, y: 0, duration: 0.3 }
  );
  
  // Clear after 3 seconds
  setTimeout(() => {
    gsap.to(statusEl, { opacity: 0, duration: 0.3 });
  }, 3000);
}

function toggleJournalHistory() {
  const historyContainer = document.getElementById('journal-history');
  const journalHistory = JSON.parse(localStorage.getItem('journalHistory')) || [];
  
  if (historyContainer.style.display === 'block') {
    // Hide history
    gsap.to(historyContainer, {
      height: 0,
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        historyContainer.style.display = 'none';
      }
    });
  } else {
    // Show history
    if (journalHistory.length === 0) {
      historyContainer.innerHTML = '<p>No past entries yet.</p>';
    } else {
      let entriesHTML = '<h3>Past Journal Entries</h3>';
      
      journalHistory.forEach((item, index) => {
        const date = new Date(item.timestamp);
        entriesHTML += `
          <div class="journal-entry">
            <div class="entry-date">${date.toLocaleDateString()}</div>
            <div class="entry-content">${item.entry}</div>
          </div>
        `;
      });
      
      historyContainer.innerHTML = entriesHTML;
    }
    
    historyContainer.style.display = 'block';
    
    // Animate display
    gsap.fromTo(historyContainer,
      { height: 0, opacity: 0 },
      { height: 'auto', opacity: 1, duration: 0.5 }
    );
    
    // Animate each entry
    gsap.from('.journal-entry', {
      opacity: 0,
      y: 20,
      stagger: 0.2,
      duration: 0.4,
      delay: 0.3
    });
  }
}

// Self-Care Tips
const tips = {
  physical: [
    "Take a 10-minute walk outside for fresh air and exercise.",
    "Drink a full glass of water right now to stay hydrated.",
    "Try stretching for 5 minutes to release tension in your body.",
    "Get 7-8 hours of sleep tonight - set a bedtime reminder.",
    "Take three deep breaths, focusing on your breathing pattern."
  ],
  emotional: [
    "Write down 3 things you're grateful for right now.",
    "Listen to a song that makes you feel good.",
    "Call or message someone you care about.",
    "Practice self-compassion by treating yourself like you would a good friend.",
    "Take a break from social media for a few hours."
  ],
  mental: [
    "Take a 5-minute meditation break using a guided app.",
    "Write down your thoughts in a stream of consciousness to clear your mind.",
    "Try a quick puzzle or brain game to engage your mind differently.",
    "Set one achievable goal for today and celebrate when you complete it.",
    "Read something unrelated to work or school for 15 minutes."
  ],
  social: [
    "Reach out to a friend you haven't spoken to in a while.",
    "Join an online community related to your interests.",
    "Practice active listening in your next conversation.",
    "Schedule a virtual coffee chat with a colleague or friend.",
    "Volunteer for a cause you care about, even remotely."
  ]
};

function showRandomTip() {
  const categories = Object.keys(tips);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  showCategoryTips(randomCategory);
}

function showCategoryTips(category) {
  if (!tips[category]) return;
  
  const randomTip = tips[category][Math.floor(Math.random() * tips[category].length)];
  const tipElement = document.getElementById('tip-text');
  
  // Animate tip change
  gsap.to(tipElement, { 
    opacity: 0, 
    y: -10, 
    duration: 0.3,
    onComplete: () => {
      tipElement.innerText = randomTip;
      gsap.to(tipElement, { opacity: 1, y: 0, duration: 0.3 });
    }
  });
  
  // Highlight active category
  document.querySelectorAll('.category-buttons button').forEach(btn => {
    if (btn.textContent.toLowerCase() === category) {
      gsap.to(btn, { 
        backgroundColor: 'var(--accent-color)', 
        color: 'white',
        duration: 0.3
      });
    } else {
      gsap.to(btn, { 
        backgroundColor: 'white', 
        color: 'var(--text-color)',
        duration: 0.3
      });
    }
  });
}

// Motivational Quotes
const quotes = [
  { text: "You are stronger than you think.", author: "Unknown" },
  { text: "This too shall pass.", author: "Persian Proverb" },
  { text: "Be kind to yourself.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "You've survived 100% of your worst days.", author: "Unknown" },
  { text: "The way I see it, if you want the rainbow, you gotta put up with the rain.", author: "Dolly Parton" },
  { text: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Nido Qubein" },
  { text: "There is hope, even when your brain tells you there isn't.", author: "John Green" },
  { text: "Self-care is how you take your power back.", author: "Lalah Delia" }
];

function showRandomQuote() {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  showQuote(randomQuote);
}

function showQuote(quote = null) {
  const quoteElement = document.getElementById('quote-text');
  const authorElement = document.getElementById('quote-author');
  
  if (!quote) {
    quote = quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  // Animate quote change
  gsap.to([quoteElement, authorElement], { 
    opacity: 0, 
    y: -10, 
    duration: 0.3,
    onComplete: () => {
      quoteElement.innerText = `"${quote.text}"`;
      authorElement.innerText = quote.author;
      
      gsap.to([quoteElement, authorElement], { 
        opacity: 1, 
        y: 0, 
        duration: 0.5,
        stagger: 0.1
      });
    }
  });
}

function shareQuote() {
  const quoteText = document.getElementById('quote-text').innerText;
  const authorText = document.getElementById('quote-author').innerText;
  
  if (navigator.share) {
    navigator.share({
      title: 'Mental Health Quote',
      text: `${quoteText} - ${authorText}`,
      url: window.location.href
    })
    .catch(error => console.log('Error sharing:', error));
  } else {
    // Fallback
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = `${quoteText} - ${authorText}`;
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showStatusMessage('Quote copied to clipboard!');
  }
  
  // Animate share button
  gsap.from('.share-btn', {
    scale: 1.2,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
}

function saveQuote() {
  const quoteText = document.getElementById('quote-text').innerText;
  const authorText = document.getElementById('quote-author').innerText;
  
  const savedQuotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
  
  // Check if quote is already saved
  const quoteExists = savedQuotes.some(q => q.text === quoteText);
  
  if (!quoteExists) {
    savedQuotes.push({
      text: quoteText,
      author: authorText
    });
    
    localStorage.setItem('savedQuotes', JSON.stringify(savedQuotes));
    showStatusMessage('Quote saved to your collection!');
  } else {
    showStatusMessage('This quote is already in your collection.', 'info');
  }
  
  // Animate save button
  gsap.from('.save-btn', {
    scale: 1.2,
    duration: 0.3,
    ease: "back.out(1.7)"
  });
}

function animateContentChanges() {
  // Add hover animations for cards
  gsap.utils.toArray('.card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -5,
        duration: 0.2
      });
    });
    
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        duration: 0.2
      });
    });
  });
  
  // Add hover animations for buttons
  gsap.utils.toArray('button').forEach(button => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.2
      });
    });
    
    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.2
      });
    });
    
    button.addEventListener('click', () => {
      gsap.fromTo(button, 
        { scale: 0.95 },
        { scale: 1, duration: 0.3 }
      );
    });
  });
}
