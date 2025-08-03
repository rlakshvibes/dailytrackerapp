// Firebase Configuration
// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDbrboEJx7hOFSRO0l7QbJAJkjejoEUpb4",
  authDomain: "daily-tracker-f025c.firebaseapp.com",
  projectId: "daily-tracker-f025c",
  storageBucket: "daily-tracker-f025c.firebasestorage.app",
  messagingSenderId: "790448833460",
  appId: "1:790448833460:web:a327ebdf2d77d6f22228e1",
  measurementId: "G-1TDE6QWYB4"
};

// Google Apps Script Web App URL
// TODO: Replace with your deployed Apps Script URL
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxnXNo3ioNBRYQuXfnNmbI98aavEH-0W176-H9qwKb8biEksZ6_6TeKv9lh113dFCA9/exec";

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
const currentDate = document.getElementById('current-date');
const submissionStatus = document.getElementById('submission-status');
const habitForm = document.getElementById('habit-form');
const submitBtn = document.getElementById('submit-btn');
const dailyForm = document.getElementById('daily-form');
const dailySummary = document.getElementById('daily-summary');
const summaryContent = document.getElementById('summary-content');
const viewPastDataBtn = document.getElementById('view-past-data-btn');
const newEntryBtn = document.getElementById('new-entry-btn');
const pastDataView = document.getElementById('past-data-view');
const pastDataContent = document.getElementById('past-data-content');
const backToFormBtn = document.getElementById('back-to-form-btn');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeErrorBtn = document.getElementById('close-error-btn');

// App State
let currentUser = null;
let todayData = null;
let pastData = [];

// Initialize the app
function initApp() {
    // Set current date
    const today = new Date();
    currentDate.textContent = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    // Check authentication state
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showAppScreen();
            updateUserInfo();
            checkTodaySubmission();
        } else {
            // User is signed out
            currentUser = null;
            showAuthScreen();
        }
        hideLoadingScreen();
    });

    // Event listeners
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Authentication
    googleSigninBtn.addEventListener('click', signInWithGoogle);
    signoutBtn.addEventListener('click', signOut);

    // Form submission
    habitForm.addEventListener('submit', handleFormSubmit);

    // Navigation
    viewPastDataBtn.addEventListener('click', showPastData);
    newEntryBtn.addEventListener('click', showForm);
    backToFormBtn.addEventListener('click', showForm);

    // Error modal
    closeErrorBtn.addEventListener('click', hideErrorModal);
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) {
            hideErrorModal();
        }
    });
}

// Authentication functions
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

// Screen management
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

// Check if user has already submitted data for today
async function checkTodaySubmission() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`${APPS_SCRIPT_URL}?action=checkToday&email=${encodeURIComponent(currentUser.email)}&date=${today}`);
        const result = await response.json();
        
        if (result.exists) {
            todayData = result.data;
            showTodaySubmitted();
        } else {
            showForm();
        }
    } catch (error) {
        console.error('Error checking today submission:', error);
        showForm(); // Fallback to showing form
    }
}

// Form handling
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(habitForm);
    const data = {
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.email,
        date: new Date().toISOString().split('T')[0],
        wakeTime: formData.get('wakeTime'),
        caffeine: formData.get('caffeine'),
        bowelMovement: formData.get('bowelMovement'),
        exercise: formData.get('exercise'),
        headache: formData.get('headache'),
        waterIntake: parseInt(formData.get('waterIntake')),
        sleepHours: parseFloat(formData.get('sleepHours'))
    };

    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // Use JSONP approach
        const result = await submitDataJSONP(data);

        if (result.success) {
            todayData = data;
            showSummary(data);
        } else {
            throw new Error(result.error || 'Failed to submit data');
        }
    } catch (error) {
        console.error('Submission error:', error);
        showError('Failed to submit data. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Today\'s Data';
    }
}

// JSONP function for submitting data
function submitDataJSONP(data) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        const callbackName = 'jsonpCallback_' + Date.now();
        
        window[callbackName] = function(result) {
            delete window[callbackName];
            document.body.removeChild(script);
            resolve(result);
        };
        
        const url = `${APPS_SCRIPT_URL}?callback=${callbackName}&data=${encodeURIComponent(JSON.stringify(data))}`;
        script.src = url;
        document.body.appendChild(script);
        
        setTimeout(() => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('Timeout'));
        }, 10000);
    });
}

// Show form
function showForm() {
    dailyForm.classList.remove('hidden');
    dailySummary.classList.add('hidden');
    pastDataView.classList.add('hidden');
    submissionStatus.textContent = '';
    submissionStatus.className = 'status-badge';
    habitForm.reset();
}

// Show today's submitted data
function showTodaySubmitted() {
    showSummary(todayData);
    submissionStatus.textContent = 'Submitted';
    submissionStatus.className = 'status-badge submitted';
}

// Show summary
function showSummary(data) {
    dailyForm.classList.add('hidden');
    dailySummary.classList.remove('hidden');
    pastDataView.classList.add('hidden');

    summaryContent.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">Wake Time</span>
            <span class="summary-value">${data.wakeTime}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Caffeine</span>
            <span class="summary-value">${data.caffeine === 'yes' ? 'Yes' : 'No'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Bowel Movement</span>
            <span class="summary-value">${data.bowelMovement === 'yes' ? 'Yes' : 'No'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Exercise</span>
            <span class="summary-value">${data.exercise === 'yes' ? 'Yes' : 'No'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Headache</span>
            <span class="summary-value">${data.headache === 'yes' ? 'Yes' : 'No'}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Water Intake</span>
            <span class="summary-value">${data.waterIntake} glasses</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Sleep Hours</span>
            <span class="summary-value">${data.sleepHours} hours</span>
        </div>
    `;
}

// Show past data
async function showPastData() {
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?action=getPastData&email=${encodeURIComponent(currentUser.email)}`);
        const result = await response.json();

        if (result.success) {
            pastData = result.data;
            displayPastData(pastData);
        } else {
            throw new Error(result.error || 'Failed to fetch past data');
        }
    } catch (error) {
        console.error('Error fetching past data:', error);
        showError('Failed to load past data. Please try again.');
    }
}

// Display past data
function displayPastData(data) {
    dailyForm.classList.add('hidden');
    dailySummary.classList.add('hidden');
    pastDataView.classList.remove('hidden');

    if (data.length === 0) {
        pastDataContent.innerHTML = '<p style="text-align: center; color: #666; padding: 40px 0;">No past data found.</p>';
        return;
    }

    const dataHTML = data.map(entry => `
        <div class="data-entry">
            <h4>${new Date(entry.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</h4>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Wake Time:</span>
                    <span class="data-value">${entry.wakeTime}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Caffeine:</span>
                    <span class="data-value">${entry.caffeine === 'yes' ? 'Yes' : 'No'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Bowel Movement:</span>
                    <span class="data-value">${entry.bowelMovement === 'yes' ? 'Yes' : 'No'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Exercise:</span>
                    <span class="data-value">${entry.exercise === 'yes' ? 'Yes' : 'No'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Headache:</span>
                    <span class="data-value">${entry.headache === 'yes' ? 'Yes' : 'No'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Water Intake:</span>
                    <span class="data-value">${entry.waterIntake} glasses</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Sleep Hours:</span>
                    <span class="data-value">${entry.sleepHours} hours</span>
                </div>
            </div>
        </div>
    `).join('');

    pastDataContent.innerHTML = dataHTML;
}

// Error handling
function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
}

function hideErrorModal() {
    errorModal.classList.add('hidden');
}

// TODO: Add analytics and insights functionality
// This section can be extended to show trends, charts, and insights
function showAnalytics() {
    // Future implementation for trend analysis
    // - Sleep pattern analysis
    // - Water intake trends
    // - Exercise consistency
    // - Headache frequency
    // - Caffeine impact analysis
}

// TODO: Add data export functionality
function exportData() {
    // Future implementation for data export
    // - CSV export
    // - PDF reports
    // - Data backup
}

// TODO: Add habit customization
function customizeHabits() {
    // Future implementation for customizing habit questions
    // - Add/remove questions
    // - Change question types
    // - Set reminders
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
