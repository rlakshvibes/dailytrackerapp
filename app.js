// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDbrboEJx7hOFSRO0l7QbJAJkjejoEUpb4",
    authDomain: "daily-tracker-f025c.firebaseapp.com",
    projectId: "daily-tracker-f025c",
    storageBucket: "daily-tracker-f025c.firebasestorage.app",
    messagingSenderId: "790448833460",
    appId: "1:790448833460:web:a327ebdf2d77d6f22228e1",
    measurementId: "G-1TDE6QWYB4"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const googleSigninBtn = document.getElementById('google-signin-btn');
const signoutBtn = document.getElementById('signout-btn');
const authError = document.getElementById('auth-error');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const greetingText = document.getElementById('greeting-text');
const startBtn = document.getElementById('start-btn');
const questionScreen = document.getElementById('question-screen');
const progressFill = document.getElementById('progress-fill');
const questionText = document.getElementById('question-text');
const answerBubbles = document.getElementById('answer-bubbles');
const summaryScreen = document.getElementById('summary-screen');
const summaryContent = document.getElementById('summary-content');
const viewPastDataBtn = document.getElementById('view-past-data-btn');
const newEntryBtn = document.getElementById('new-entry-btn');
const pastDataScreen = document.getElementById('past-data-screen');
const pastDataContent = document.getElementById('past-data-content');
const backToSummaryBtn = document.getElementById('back-to-summary-btn');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error-btn');

// App State
let currentUser = null;
let currentAnswers = {};
let currentQuestionIndex = 0;
let pastData = [];

// Wellness Questions (curated for daily health tracking)
const wellnessQuestions = [
    {
        id: 'mood',
        text: "How are you feeling today?",
        type: 'bubble',
        options: ['Great! 😊', 'Good 🙂', 'Okay 😐', 'Not great 😔', 'Terrible 😢']
    },
    {
        id: 'sleep_quality',
        text: "How well did you sleep last night?",
        type: 'bubble',
        options: ['Excellent 😴', 'Good 😊', 'Fair 😐', 'Poor 😫', 'Terrible 😵']
    },
    {
        id: 'water_intake',
        text: "How much water have you drunk today?",
        type: 'bubble',
        options: ['8+ glasses 💧', '6-7 glasses 💧', '4-5 glasses 💧', '2-3 glasses 💧', 'Less than 2 glasses 💧']
    },
    {
        id: 'exercise',
        text: "Did you exercise today?",
        type: 'bubble',
        options: ['Yes, intense workout 💪', 'Yes, moderate exercise 🏃', 'Yes, light activity 🚶', 'No, but I will later 📅', 'No, not today 😴']
    },
    {
        id: 'nutrition',
        text: "How healthy was your eating today?",
        type: 'bubble',
        options: ['Very healthy 🥗', 'Mostly healthy 🥑', 'Mixed 🍎', 'Not very healthy 🍕', 'Unhealthy 🍰']
    },
    {
        id: 'stress_level',
        text: "How stressed do you feel right now?",
        type: 'bubble',
        options: ['Very relaxed 😌', 'Calm 😊', 'Slightly stressed 😐', 'Stressed 😰', 'Very stressed 😱']
    },
    {
        id: 'productivity',
        text: "How productive were you today?",
        type: 'bubble',
        options: ['Very productive ⚡', 'Productive ✅', 'Somewhat productive 📝', 'Not very productive 😴', 'Unproductive 😵']
    },
    {
        id: 'social_connection',
        text: "How connected do you feel to others today?",
        type: 'bubble',
        options: ['Very connected ❤️', 'Connected 💕', 'Somewhat connected 🤝', 'A bit isolated 😔', 'Very isolated 😢']
    },
    {
        id: 'gratitude',
        text: "What are you grateful for today?",
        type: 'bubble',
        options: ['Family & friends 👨‍👩‍👧‍👦', 'Health & wellness 💚', 'Work & achievements 🎯', 'Simple pleasures 🌟', 'Everything 🙏']
    },
    {
        id: 'tomorrow_goal',
        text: "What's your main goal for tomorrow?",
        type: 'bubble',
        options: ['Exercise & fitness 💪', 'Healthy eating 🥗', 'Better sleep 😴', 'Work/study focus 📚', 'Self-care & relaxation 🧘']
    }
];

function initApp() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            showAppScreen();
            updateUserInfo();
            setGreeting();
        } else {
            currentUser = null;
            showAuthScreen();
        }
        hideLoadingScreen();
    });

    setupEventListeners();
}

function setupEventListeners() {
    googleSigninBtn.addEventListener('click', signInWithGoogle);
    signoutBtn.addEventListener('click', signOut);
    startBtn.addEventListener('click', startQuestionFlow);
    viewPastDataBtn.addEventListener('click', showPastData);
    newEntryBtn.addEventListener('click', startQuestionFlow);
    backToSummaryBtn.addEventListener('click', showSummary);
    closeErrorBtn.addEventListener('click', hideErrorModal);
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) {
            hideErrorModal();
        }
    });
}

async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    } catch (error) {
        console.error('Sign-in error:', error);
        showError('Failed to sign in with Google. Please try again.');
    }
}

async function signOut() {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Sign-out error:', error);
        showError('Failed to sign out. Please try again.');
    }
}

function showAuthScreen() {
    authScreen.classList.remove('hidden');
    appScreen.classList.add('hidden');
    authError.classList.add('hidden');
}

function showAppScreen() {
    authScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
}

function hideLoadingScreen() {
    loadingScreen.classList.add('hidden');
}

function updateUserInfo() {
    if (currentUser) {
        userName.textContent = currentUser.displayName || currentUser.email;
        userAvatar.src = currentUser.photoURL || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM5OTkiLz4KPHBhdGggZD0iTTE2IDhjLTQuNDIgMC04IDMuNTgtOCA4czMuNTggOCA4IDggOC0zLjU4IDgtOC0zLjU4LTgtOC04em0wIDEyYy0yLjIxIDAtNC0xLjc5LTQtNHMxLjc5LTQgNC00IDQgMS43OSA0IDQtMS43OSA0LTQgNHoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
    }
}

function setGreeting() {
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
        greeting = 'Good Morning!';
    } else if (hour < 17) {
        greeting = 'Good Afternoon!';
    } else if (hour < 21) {
        greeting = 'Good Evening!';
    } else {
        greeting = 'Good Night!';
    }
    
    greetingText.textContent = greeting;
}

function startQuestionFlow() {
    currentQuestionIndex = 0;
    currentAnswers = {};
    showQuestion();
}

function showQuestion() {
    const question = wellnessQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / wellnessQuestions.length) * 100;
    
    // Update progress bar
    progressFill.style.width = `${progress}%`;
    
    // Show question screen
    document.getElementById('welcome-screen').classList.add('hidden');
    questionScreen.classList.remove('hidden');
    summaryScreen.classList.add('hidden');
    pastDataScreen.classList.add('hidden');
    
    // Set question text
    questionText.textContent = question.text;
    
    // Create answer bubbles
    answerBubbles.innerHTML = '';
    question.options.forEach((option, index) => {
        const bubble = document.createElement('div');
        bubble.className = 'answer-bubble';
        bubble.textContent = option;
        bubble.addEventListener('click', () => selectAnswer(option));
        answerBubbles.appendChild(bubble);
    });
}

function selectAnswer(answer) {
    const question = wellnessQuestions[currentQuestionIndex];
    currentAnswers[question.id] = answer;
    
    // Add visual feedback
    const bubbles = answerBubbles.querySelectorAll('.answer-bubble');
    bubbles.forEach(bubble => bubble.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Move to next question after a short delay
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < wellnessQuestions.length) {
            showQuestion();
        } else {
            showSummary();
        }
    }, 500);
}

function showSummary() {
    questionScreen.classList.add('hidden');
    summaryScreen.classList.remove('hidden');
    
    const summaryHTML = Object.entries(currentAnswers).map(([key, value]) => {
        const question = wellnessQuestions.find(q => q.id === key);
        return `
            <div class="summary-item">
                <span class="summary-label">${question.text}</span>
                <span class="summary-value">${value}</span>
            </div>
        `;
    }).join('');
    
    summaryContent.innerHTML = summaryHTML;
}

function showPastData() {
    summaryScreen.classList.add('hidden');
    pastDataScreen.classList.remove('hidden');
    
    // For now, show a placeholder since we're not using the Apps Script
    pastDataContent.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.7);">
            <p>Past data feature coming soon!</p>
            <p>Your wellness journey data will be stored here.</p>
        </div>
    `;
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
}

function hideErrorModal() {
    errorModal.classList.add('hidden');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
