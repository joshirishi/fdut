// Initialize tracking variables
const mouseMovements = [];
const clickPositions = [];
const heatmapData = {};
let clickCount = 0;
let lastScroll = 0;
let scrollDirection = 'down';
let lastPage = null;
let currentPage = window.location.href;
let pageEnterTime = new Date().getTime();
let uniqueVisitors = new Set();
let newVisitor = true;
let activeUsers = 0;
let taskSuccessRate = 0;
let timeOnTask = 0;
let searchUsage = 0;
let navigationUsage = 0;
let userErrorRate = 0;
let taskLevelSatisfaction = 0;
let testLevelSatisfaction = 0;
let productAccess = 0;
let avgTimeSpent = 0;
let featureAdoptionRate = 0;
let maxScrollDepth = 0;
let lastScrollDepth = 0;
let rapidScrollCount = 0;
let totalButtonClicks = 0;
let successfulButtonClicks = 0;
const heatmapDataPoints = [];


// Detect OS
function detectOS() {
    const userAgent = window.navigator.userAgent;
    if (/Windows/i.test(userAgent)) return 'Windows';
    if (/Mac/i.test(userAgent)) return 'MacOS';
    if (/Linux/i.test(userAgent)) return 'Linux';
    if (/Android/i.test(userAgent)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(userAgent)) return 'iOS';
    return 'Unknown';
}

// Detect Device Type
function detectDeviceType() {
    const width = window.innerWidth;
    if (width <= 480) return 'Mobile';
    if (width <= 1024) return 'Tab';
    return 'Desktop';
}

const os = detectOS();
const deviceType = detectDeviceType();
const origin = window.location.origin;
const windowSize = {
    width: window.innerWidth,
    height: window.innerHeight
};

// Modified Unique and Returning Visitors
if (localStorage.getItem('visitedBefore')) {
    newVisitor = false;
    sendDataToBackend({
        eventType: 'visitor',
    });
} else {
    localStorage.setItem('visitedBefore', 'true');
    // Send data for new visitor
    sendDataToBackend({
        eventType: 'new-visitor',
        os,
        deviceType,
        origin,
        windowSize: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    });
}
/*
// Old Unique Visitor Identification
let visitorToken = localStorage.getItem('visitorToken');
if (!visitorToken) {
    visitorToken = generateUniqueToken();  // Implement a function to generate a unique token
    localStorage.setItem('visitorToken', visitorToken);
}
*/

// Navigation Path Tracking
const navigationPath = [];
navigationPath.push(window.location.href);

// Track page navigations (if using single-page applications with client-side routing)
// For traditional multi-page applications, the page reload will capture the new URL
/*
if (typeof window.history.pushState === 'function') {
    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
        originalPushState.apply(window.history, args);
        navigationPath.push(window.location.href);
    };
}
*/
// Mouse Movement Tracking for Heatmap
document.addEventListener('mousemove', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    heatmapDataPoints.push({ x: x, y: y, value: 1 });
});

// Click and Rage Click Tracking
document.addEventListener('click', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    heatmapDataPoints.push({ x: x, y: y, value: 5 }); // Assigning a higher value for clicks

    clickCount++;
    setTimeout(() => clickCount = 0, 1000);
    if (clickCount > 5) {
        // Track rage click event
        sendDataToBackend({ eventType: 'rage-click', x, y });

        //QUESTION: Should we mark this on the heatmap too? or maybe another type of heat map?
    }
});

// Scroll Tracking
document.addEventListener('scroll', function() {
    const relativeScroll = (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100;
    maxScrollDepth = Math.max(maxScrollDepth, relativeScroll);

    // Detect rapid up and down scrolling
    if (Math.abs(lastScrollDepth - window.scrollY) > 100) {
        rapidScrollCount++;
        if (rapidScrollCount > 5) {
            sendDataToBackend({ eventType: 'confused-scrolling' });
            rapidScrollCount = 0;
        }
    } else {
        rapidScrollCount = 0;
    }
    lastScrollDepth = window.scrollY;
});

//QUESTION - where are we using taskSuccessRate
// Button Tracking Logic
document.querySelectorAll('button, a.button').forEach(button => {
    button.addEventListener('click', function() {
        totalButtonClicks++;

        // Check for the desired outcome after a delay (e.g., navigation to a specific page)
        setTimeout(() => {
            if (currentPage.includes('/products') && button.classList.contains('buy')) {
                successfulButtonClicks++;
            }
            taskSuccessRate = (successfulButtonClicks / totalButtonClicks) * 100;
        }, 1000); // Adjust the delay as needed
    });
});

// update Page Navigation Tracking
window.addEventListener('beforeunload', function() {
    lastPage = currentPage;
    const pageExitTime = new Date().getTime();
    const timeSpentOnPage = pageExitTime - pageEnterTime;
    avgTimeSpent = (avgTimeSpent + timeSpentOnPage) / 2; // Update average time spent
    sendDataToBackend({
        eventType: 'page-exit',
        timeSpentOnPage,
        currentPage,
        maxScrollDepth
    });
});

// Modified Function to send data to the backend
async function sendDataToBackend(data) {
    // If it's a returning visitor, remove the redundant data
    if (!newVisitor) {
        delete data.os;
        delete data.deviceType;
        delete data.origin;
        delete data.windowSize;
    }

    try {
        const response = await fetch('http://localhost:8000/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            console.error('Failed to send data:', response);
        }
    } catch (error) {
        console.error('Error sending data:', error);
    }
}

// Function to generate a unique token for visitors
function generateUniqueToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Modified Function to Send data every 5 seconds
setInterval(() => {
    const data = {
        heatmapData: heatmapDataPoints
    };
    if (heatmapDataPoints.length){
        sendDataToBackend(data);
        heatmapDataPoints.length = 0;
    }
    
}, 5000);

// Function to load the form script and display the form
function loadAndDisplayForm() {
    const script = document.createElement('script');
    script.src = 'path_to_your_formGenerator.js'; // Replace with the actual path
    script.onload = function() {
        // Define form parameters
        const formParams = {
            fields: ['name', 'email', 'feedback'],
            labels: ['Name', 'Email', 'Your Feedback'],
            buttonText: 'Submit Feedback'
        };
        // Call the function from formGenerator.js to generate the form
        window.generateForm(formParams);
    };
    document.body.appendChild(script);
}

// Sample trigger: Display the form when the user clicks on a "Buy" button on the products page
if (window.location.href.includes('/products') && !localStorage.getItem('feedbackFormDisplayed')) {
    document.addEventListener('click', function(event) {
        if (event.target && event.target.innerText === 'Buy') {
            loadAndDisplayForm();
            localStorage.setItem('feedbackFormDisplayed', 'true'); // Ensure the form is displayed only once
        }
    });
}