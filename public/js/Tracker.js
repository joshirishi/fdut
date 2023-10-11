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
} else {
    localStorage.setItem('visitedBefore', 'true');
    // Send data for new visitor
    sendDataToBackend({
        eventType: 'newVisitor',
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
// Mouse Movement Tracking
document.addEventListener('mousemove', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    mouseMovements.push({ x, y });
});

// Click and Rage Click Tracking
document.addEventListener('click', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    clickPositions.push({ x, y });
    clickCount++;
    setTimeout(() => clickCount = 0, 1000);
    if (clickCount > 5) {
        // Track rage click event
        sendDataToBackend({ eventType: 'rageClick', x, y });
    } else {
        sendDataToBackend({ eventType: 'click', x, y });
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
            sendDataToBackend({ eventType: 'confusedScrolling' });
            rapidScrollCount = 0;
        }
    } else {
        rapidScrollCount = 0;
    }
    lastScrollDepth = window.scrollY;
});

// Page Navigation Tracking
window.addEventListener('beforeunload', function() {
    const pageExitTime = new Date().getTime();
    const timeSpentOnPage = pageExitTime - pageEnterTime;
    sendDataToBackend({
        eventType: 'pageExit',
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
/*
// Old Function to send data to the backend
async function sendDataToBackend(data) {
    try {
        const response = await fetch('http://localhost:8000/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                os,
                deviceType,
                origin,
                windowSize
            }),
        });

        if (!response.ok) {
            console.error('Failed to send data:', response);
        }
    } catch (error) {
        console.error('Error sending data:', error);
    }
}
*/
// Function to generate a unique token for visitors
function generateUniqueToken() {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
}

// Send data every 5 seconds
setInterval(() => {
    const data = {
        mouseMovements,
        clickPositions,
        heatmapData
    };
    sendDataToBackend(data);
    mouseMovements.length = 0;
    clickPositions.length = 0;
}, 5000);