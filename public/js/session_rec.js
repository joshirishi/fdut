// session_rec.js

const sessionRecorder = (function() {
    // Private variables
    let domSnapshots = [];
    let mouseMovements = [];
    let clickPositions = [];
    let formInputs = [];

    // Capture periodic snapshots of the DOM
    function captureDOMSnapshot() {
        domSnapshots.push(document.documentElement.outerHTML);
        if (domSnapshots.length > 10) {
            domSnapshots.shift();
        }
    }

    // Send data to the backend
    function sendDataToBackend(data) {
        // Implement the logic to send data to your backend
        // For example:
        fetch('http://localhost:8000/api/recordSession', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error sending data:', error));
    }

    // Public methods
    return {
        init: function() {
            // Capture mouse movements
            document.addEventListener('mousemove', function(event) {
                const x = event.clientX;
                const y = event.clientY;
                mouseMovements.push({ x, y });
            });

            // Capture clicks
            document.addEventListener('click', function(event) {
                const x = event.clientX;
                const y = event.clientY;
                clickPositions.push({ x, y });
            });

            // Capture form inputs
            document.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', function() {
                    formInputs.push({
                        name: input.name,
                        value: input.value, // Ensure sensitive data is masked
                        timestamp: new Date().getTime()
                    });
                });
            });

            // Start capturing DOM snapshots
            setInterval(captureDOMSnapshot, 5000);
        },

        startRecording: function() {
            // Reset data arrays
            domSnapshots = [];
            mouseMovements = [];
            clickPositions = [];
            formInputs = [];
        },

        stopRecording: function() {
            // Send the recorded data to the backend
            sendDataToBackend({
                domSnapshots,
                mouseMovements,
                clickPositions,
                formInputs
            });
        }
    };
})();

// Export the module (if using modules)
// export default sessionRecorder;

// If not using modules, you can initialize the recorder in your main application:
// sessionRecorder.init();
