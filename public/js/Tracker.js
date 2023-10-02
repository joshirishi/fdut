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

// Function to categorize each mouse event into a grid cell
function getCellCoordinates(x, y) {
    const cellSize = 10; // 10x10 pixels per cell
    return {
        cellX: Math.floor(x / cellSize),
        cellY: Math.floor(y / cellSize)
    };
}

// Mouse Movement Tracking
document.addEventListener('mousemove', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    mouseMovements.push({ x, y });
    //send data to backend 
    fetch('http://localhost:8000/api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventType: 'mousemove', x, y })
    });
});

// Click and Rage Click Tracking
document.addEventListener('click', function(event) {
    const x = event.clientX;
    const y = event.clientY;
    const cell = getCellCoordinates(x, y);
    const cellKey = `${cell.cellX}-${cell.cellY}`;
    
    heatmapData[cellKey] = (heatmapData[cellKey] || 0) + 1;

    clickPositions.push({ x, y });
    clickCount++;
    setTimeout(() => clickCount = 0, 1000);
    if (clickCount > 5) {
        // It's a rage click
    }
    // Send data to the backend
    fetch('http://localhost:8000/api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventType: 'click', x, y })
    });
});

// Scroll Tracking
document.addEventListener('scroll', function() {
    const scrollDepth = window.scrollY;
    const currentScroll = window.scrollY;
    if (currentScroll > lastScroll) {
        scrollDirection = 'down';
    } else {
        if (scrollDirection === 'down') {
            // This is a scroll reversal
        }
        scrollDirection = 'up';
    }
    lastScroll = currentScroll;
    
    //send data to backend
    fetch('http://localhost:8000/api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventType: 'scroll', scrollDepth })
    });
});

// Page Navigation Tracking
window.addEventListener('beforeunload', function() {
    lastPage = currentPage;
    currentPage = window.location.href;
    const pageExitTime = new Date().getTime();
    const timeSpentOnPage = pageExitTime - pageEnterTime;

    //send data to backend
    fetch('http://localhost:8000/api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventType: 'pageExit', timeSpentOnPage, currentPage })
    });
});

// Unique and Returning Visitors
if (localStorage.getItem('visitedBefore')) {
    newVisitor = false;
} else {
    localStorage.setItem('visitedBefore', 'true');

    //send data to backend
    fetch('http://localhost:8000/api/track', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventType: 'newVisitor' })
    });
}

// Function to send data to the backend
async function sendDataToBackend(data) {
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

// Send data every 5 seconds
setInterval(() => {
    const data = {
        mouseMovements,
        clickPositions,
        heatmapData,
        // ... other data
    };

    sendDataToBackend(data);

    // Optionally, clear the arrays after sending data
    mouseMovements.length = 0;
    clickPositions.length = 0;
}, 5000);

// Load heatmap.js from a CDN
function loadHeatmapLibrary(callback) {
    const heatmapScript = document.createElement('script');
    heatmapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/heatmap.js/2.0.2/heatmap.min.js'; // Loading from CDN
    heatmapScript.onload = callback;
    document.body.appendChild(heatmapScript);
}

// Initialize heatmap once the library is loaded
loadHeatmapLibrary(() => {
    const heatmapInstance = h337.create({
        container: document.body
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

    // For demonstration, updating heatmap every 10 seconds
    setInterval(updateHeatmap, 10000);
});
