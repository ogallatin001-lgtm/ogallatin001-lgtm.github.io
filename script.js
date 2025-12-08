// --- Game Initialization ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const statusDisplay = document.getElementById('game-status');

let game; // Object to hold all game state

// --- Game Object Classes ---

// Player Ship (controlled by the user)
class Player {
    constructor() {
        this.width = 40;
        this.height = 15;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - 30;
        this.speed = 5;
        this.movingLeft = false;
        this.movingRight = false;
    }

    draw() {
        ctx.fillStyle = '#00ff00'; // Green ship
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Add a small pointer/cannon
        ctx.fillRect(this.x + this.width / 2 - 2, this.y - 5, 4, 5);
    }

    update() {
        if (this.movingLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (this.movingRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
    }
}

// Player Projectile (Shots)
class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 3;
        this.height = 8;
        this.speed = 8;
    }

    draw() {
        ctx.fillStyle = '#ff0000'; // Red bullet
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
    }
}

// Enemy (Falling Squares)
class Enemy {
    constructor(x, y) {
        this.width = 25;
        this.height = 25;
        this.x = x;
        this.y = y;
        this.speed = Math.random() * 0.5 + 1; // Random slow speed
    }

    draw() {
        ctx.fillStyle = '#f0f'; // Purple enemy
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed;
    }
}


// --- Game Functions ---

function initGame() {
    game = {
        player: new Player(),
        bullets: [],
        enemies: [],
        score: 0,
        lives: 3,
        enemySpawnTimer: 0,
        enemySpawnInterval: 60, // Spawn a new enemy every 60 frames
        isOver: false,
        isRunning: false
    };
    statusDisplay.textContent = "Press SPACE to Start";
    updateHUD();
}

function updateHUD() {
    scoreDisplay.textContent = game.score;
    livesDisplay.textContent = game.lives;
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - 25);
    const y = -25; // Spawn off-screen above
    game.enemies.push(new Enemy(x, y));
}

function shootBullet() {
    // Spawn bullet from the center of the player ship
    const x = game.player.x + game.player.width / 2 - 1.5;
    const y = game.player.y - 10;
    game.bullets.push(new Bullet(x, y));
}

function checkCollision(objA, objB) {
    return objA.x < objB.x + objB.width &&
           objA.x + objA.width > objB.x &&
           objA.y < objB.y + objB.height &&
           objA.y + objA.height > objB.y;
}


// --- The Main Game Loop ---
function gameLoop() {
    if (game.isOver || !game.isRunning) return;

    // 1. Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. Update and Draw Player
    game.player.update();
    game.player.draw();

    // 3. Spawn Enemies
    game.enemySpawnTimer++;
    if (game.enemySpawnTimer >= game.enemySpawnInterval) {
        spawnEnemy();
        game.enemySpawnTimer = 0;
    }

    // 4. Update, Draw, and Check Enemies
    for (let i = game.enemies.length - 1; i >= 0; i--) {
        const enemy = game.enemies[i];
        enemy.update();
        enemy.draw();

        // Check if enemy hit the bottom
        if (enemy.y > canvas.height) {
            game.enemies.splice(i, 1);
            game.lives--; // Lose a life
            updateHUD();
            if (game.lives <= 0) {
                gameOver();
                return;
            }
        }
    }

    // 5. Update, Draw, and Check Bullets
    for (let i = game.bullets.length - 1; i >= 0; i--) {
        const bullet = game.bullets[i];
        bullet.update();
        bullet.draw();

        // Check if bullet hit an enemy
        let hit = false;
        for (let j = game.enemies.length - 1; j >= 0; j--) {
            const enemy = game.enemies[j];
            if (checkCollision(bullet, enemy)) {
                // Collision occurred!
                game.enemies.splice(j, 1); // Remove enemy
                game.score += 10;
                hit = true;
                break; // Stop checking for enemies for this bullet
            }
        }

        if (bullet.y < 0 || hit) {
            game.bullets.splice(i, 1); // Remove bullet (if off screen or hit)
        }
    }
    
    updateHUD();

    // Request the next frame for smooth animation
    requestAnimationFrame(gameLoop);
}


// --- Game Over State ---
function gameOver() {
    game.isOver = true;
    game.isRunning = false;
    statusDisplay.textContent = `Game Over! Final Score: ${game.score}. Press SPACE to restart.`;
}


// --- Event Listeners (User Input) ---

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') {
        game.player.movingLeft = true;
    } else if (e.code === 'ArrowRight') {
        game.player.movingRight = true;
    } else if (e.code === 'Space') {
        if (!game.isRunning && !game.isOver) {
            // Start the game for the first time
            game.isRunning = true;
            statusDisplay.textContent = "Defend the Earth!";
            gameLoop();
        } else if (game.isOver) {
            // Restart the game
            initGame();
            game.isRunning = true;
            statusDisplay.textContent = "Defend the Earth!";
            gameLoop();
        } else if (game.isRunning) {
            // Shoot only when game is running
            shootBullet();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') {
        game.player.movingLeft = false;
    } else if (e.code === 'ArrowRight') {
        game.player.movingRight = false;
    }
});

// Start the game initialization when the page loads
initGame();
