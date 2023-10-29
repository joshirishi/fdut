(function() {
  const script = document.createElement('script');
  script.src = 'http://localhost:3000/js/tracker.js'; // Updated the name here
  script.async = true;
  document.head.appendChild(script);
})();

 // Load tracker.js first
 loadScript('http://localhost:3000/js/tracker.js', function() {
  // Once tracker.js is loaded, load session_rec.js
  loadScript('http://localhost:3000/js/session_rec.js');
});
})();