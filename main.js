// Variables to store the current GPS coordinates
let latitude, longitude;
let isPlaying = false;   // Control play/stop state
let fadeInTime = 1000;   // Default fade-in time in milliseconds
let fadeOutTime = 1000;  // Default fade-out time in milliseconds
let player;              // Tone.Player instance
let audioContextStarted = false; // Flag to check if audio context is started

function setup() {
    // Adjust canvas size for mobile devices
    createCanvas(windowWidth, windowHeight);
    textSize(16);
    fill(0);

    // Check if geolocation is available in the browser
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(updatePosition, showError);
    } else {
        background(220);
        text('Geolocation is not supported by your browser.', 10, 20);
    }

    // File input handling
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', (event) => {
        userInteracted();
        handleFileUpload(event);
    });

    // Play/Stop button handling
    const playButton = document.getElementById('playButton');
    const stopButton = document.getElementById('stopButton');
    playButton.addEventListener('click', () => {
        userInteracted();
        startPlaying();
    });
    stopButton.addEventListener('click', stopPlaying);

    // Fade-in time input handling
    const fadeInTimeInput = document.getElementById('fadeInTime');
    fadeInTimeInput.addEventListener('input', () => {
        const value = parseInt(fadeInTimeInput.value, 10);
        if (!isNaN(value)) {
            fadeInTime = value;
            console.log(`Fade-in time set to ${fadeInTime} ms`);
        }
    });

    // Fade-out time input handling
    const fadeOutTimeInput = document.getElementById('fadeOutTime');
    fadeOutTimeInput.addEventListener('input', () => {
        const value = parseInt(fadeOutTimeInput.value, 10);
        if (!isNaN(value)) {
            fadeOutTime = value;
            console.log(`Fade-out time set to ${fadeOutTime} ms`);
        }
    });
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(220);

    // Display the current GPS coordinates
    if (latitude && longitude) {
        text(`Latitude: ${latitude.toFixed(4)}`, 10, height / 2);
        text(`Longitude: ${longitude.toFixed(4)}`, 10, height / 2 + 20);
    } else {
        text('Waiting for GPS data...', 10, height / 2);
    }

    // Display play/stop status
    if (isPlaying) {
        text('Status: Playing', 10, height - 20);
    } else {
        text('Status: Stopped', 10, height - 20);
    }
}

// Callback function to update the position variables
function updatePosition(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
}

// Error handling function
function showError(error) {
    let errorMessage;
    switch (error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        case error.UNKNOWN_ERROR:
            errorMessage = 'An unknown error occurred.';
            break;
    }
    console.log(errorMessage);
    // Display the error message on the canvas
    background(220);
    text(errorMessage, 10, height / 2);
}

// Start the audio context on the first user interaction
async function userInteracted() {
    if (!audioContextStarted) {
        await Tone.start();
        audioContextStarted = true;
        console.log('Audio context started');
    }
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        console.log(`File uploaded: ${file.name}`);
        const reader = new FileReader();
        reader.onload = function(e) {
            if (player) {
                player.dispose();
            }
            player = new Tone.Player(e.target.result).toDestination();
            player.autostart = false;
            console.log('Sound loaded successfully');
        };
        reader.readAsDataURL(file);
    }
}

// Start playing (update status)
function startPlaying() {
    if (player) {
        isPlaying = true;
        console.log(`Playing with fade-in time of ${fadeInTime} ms`);
        player.volume.value = -Infinity; // Start from silence
        player.start();
        player.volume.rampTo(0, fadeInTime / 1000); // Fade in to 0 dB
    } else {
        console.log('Sound file is not loaded yet.');
    }
}

// Stop playing (update status)
function stopPlaying() {
    if (player && isPlaying) {
        isPlaying = false;
        console.log(`Stopping with fade-out time of ${fadeOutTime} ms`);
        player.volume.rampTo(-Infinity, fadeOutTime / 1000); // Fade out to silence
        setTimeout(() => {
            player.stop();
        }, fadeOutTime);
    } else {
        console.log('Sound file is not playing.');
    }
}
