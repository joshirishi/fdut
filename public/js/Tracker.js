// Include the pako library for compression
const script = document.createElement('script');


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

script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.3/pako.min.js';
document.body.appendChild(script);


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
// again added from previous version:: Load heatmap.js from a CDN

// Load heatmap.js from a CDN but the I get an error PayloadTooLargeError: request entity too large in mongodb
/*
function loadHeatmapLibrary(callback) {
    const heatmapScript = document.createElement('script');
    heatmapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/heatmap.js/2.0.2/heatmap.min.js'; // Loading from CDN
    heatmapScript.onload = callback;
    document.body.appendChild(heatmapScript);
}

loadHeatmapLibrary(function() {
    const heatmapInstance = h337.create({
        container: document.body,
        visible: false  // Ensuring heatmap is not rendered on the site
    });
    
    function convertDataForHeatmap(heatmapData) {
        const dataPoints = [];
        for (const [key, value] of Object.entries(heatmapData)) {
            const [cellX, cellY] = key.split('-');
            dataPoints.push({
                x: cellX * 10, // Convert cell coordinates back to pixels
                y: cellY * 10,
                value: value
            });
        }
        return dataPoints;
    }

    function updateHeatmap() {
        const dataPoints = convertDataForHeatmap(heatmapData);
        heatmapInstance.setData({
            max: Math.max(...Object.values(heatmapData)),
            data: dataPoints
        });
    }
    let lastRecordedTime = 0;

    document.addEventListener('mousemove', function(event) {
        const currentTime = new Date().getTime();
        if (currentTime - lastRecordedTime > 100) { // 100ms delay between recordings
            const x = event.clientX;
            const y = event.clientY;

            // Add data for heatmap
            heatmapInstance.addData({
                x: x,
                y: y,
                value: 1
            });

            lastRecordedTime = currentTime;
        }
    });

*/
    document.addEventListener('click', function(event) {
        const x = event.clientX;
        const y = event.clientY;
/*    
        // Add data for heatmap :addind this makes size big apparantly
        heatmapInstance.addData({
            x: x,
            y: y,
            value: 1
        }); */

        clickCount++;
        setTimeout(function() {
            clickCount = 0;
        }, 1000);
        if (clickCount > 5) {
            // Track rage click event
            sendDataToBackend({ eventType: 'rageClick', x, y });
        } else {
            sendDataToBackend({ eventType: 'click', x, y });
        }
    });

    // For demonstration, updating heatmap every 10 seconds
    setInterval(updateHeatmap, 10000);
    setInterval(() => {
        const data = {
            heatmapDataURL: heatmapInstance.getDataURL()
        };
        sendDataToBackend(data);
    }, 5000);
//});


/*

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
*/

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
        eventType: 'pageExit',
        timeSpentOnPage,
        currentPage,
        maxScrollDepth
    });
});

async function sendDataToBackend(data) {
    // If it's a returning visitor, remove the redundant data
    if (!newVisitor) {
        delete data.os;
        delete data.deviceType;
        delete data.origin;
        delete data.windowSize;
    }

    // Compress the data using pako
    const compressedData = pako.gzip(JSON.stringify(data));

    try {
        const response = await fetch('http://localhost:8000/api/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip' // Indicate that the content is compressed
            },
            body: compressedData,
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

/*
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
    });}
*/