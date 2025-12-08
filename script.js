// Game state variables
let gameState = 'waiting';
let startTime = 0;
let score = 0;
let bestTime = Infinity;
let timerId = null;

const square = document.getElementById('game-square');
const scoreDisplay = document.getElementById('score');
const bestTimeDisplay = document.getElementById('best-time');

// Function to start the delay before the square turns green
function startDelay() {
    // Reset the square and display message
    square.textContent = "Wait...";
    square.classList.remove('ready-to-click');

    // Pick a random time between 1 and 4 seconds (1000ms to 4000ms)
    const delayTime = Math.random() * 3000 + 1000;

    // Set a timer to change the state and color after the delay
    timerId = setTimeout(() => {
        square.classList.add('ready-to-click');
        square.textContent = "Click NOW!";
        startTime = Date.now(); // Record the exact time it turned green
        gameState = 'ready';
    }, delayTime);
}

// Function to handle a correct click
function handleCorrectClick() {
    const reactionTime = Date.now() - startTime;
    square.textContent = `Time: ${reactionTime}ms!`;
    square.classList.remove('ready-to-click');
    gameState = 'waiting';
    score++;
    scoreDisplay.textContent = score;

    // Update best time
    if (reactionTime < bestTime) {
        bestTime = reactionTime;
        bestTimeDisplay.textContent = `${bestTime}ms`;
    }

    // Start the next round after a short pause
    setTimeout(startDelay, 1500);
}

// Function to handle an incorrect click (clicked too early)
function handleEarlyClick() {
    clearTimeout(timerId); // Stop the running timer
    square.textContent = "Too early! Try again.";
    gameState = 'waiting';
    score = 0; // Reset score on failure
    scoreDisplay.textContent = score;

    // Start the game again after a penalty pause
    setTimeout(() => {
        square.textContent = "Click to Start";
    }, 2000); 
}

// Main event listener for the square
square.addEventListener('click', () => {
    if (gameState === 'waiting') {
        // First click starts the game
        if (square.textContent === "Click to Start") {
            gameState = 'playing';
            startDelay();
        } else {
            // Clicked while "Wait..." was displayed
            handleEarlyClick();
        }

    } else if (gameState === 'ready') {
        // Clicked while the square was green
        handleCorrectClick();
    }
});