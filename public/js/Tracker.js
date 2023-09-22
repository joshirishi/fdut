// Initialize tracking variables
const mouseMovements = [];
const clickPositions = [];
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
    // ... other data
  };

  sendDataToBackend(data);

  // Optionally, clear the arrays after sending data
  mouseMovements.length = 0;
  clickPositions.length = 0;
}, 5000);