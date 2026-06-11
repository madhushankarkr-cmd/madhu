// Canvas and context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    velocityX: 5,
    velocityY: 5,
    speed: 5,
    maxSpeed: 8
};

// Paddle object
const paddleWidth = 12;
const paddleHeight = 80;

const player = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

const computer = {
    x: canvas.width - paddleWidth - 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 5
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Draw functions
function drawRectangle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

function drawNet() {
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    drawRectangle(0, 0, canvas.width, canvas.height, '#1a1a1a');
    
    // Draw net
    drawNet();
    
    // Draw paddles
    drawRectangle(player.x, player.y, player.width, player.height, '#00ff00');
    drawRectangle(computer.x, computer.y, computer.width, computer.height, '#00ff00');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.radius, '#00ff00');
}

// Update functions
function updatePlayerPaddle() {
    // Mouse control
    if (mouseY > 0 && mouseY < canvas.height) {
        player.y = mouseY - player.height / 2;
    }
    
    // Arrow key control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
    
    // Boundary check
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
    }
}

function updateComputerPaddle() {
    // AI for computer paddle
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const diff = ballCenter - computerCenter;
    
    // AI difficulty: move towards ball with some intelligence
    if (diff < -30) {
        computer.y -= computer.speed;
    } else if (diff > 30) {
        computer.y += computer.speed;
    }
    
    // Boundary check
    if (computer.y < 0) computer.y = 0;
    if (computer.y > canvas.height - computer.height) {
        computer.y = canvas.height - computer.height;
    }
}

function updateBall() {
    // Update ball position
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    
    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }
    
    // Paddle collision - Player
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.velocityX = -ball.velocityX;
        ball.x = player.x + player.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - player.y) / player.height - 0.5;
        ball.velocityY = hitPos * 12;
        
        // Increase speed slightly
        const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
        if (speed < ball.maxSpeed) {
            ball.velocityX = (ball.velocityX / speed) * (speed + 1);
            ball.velocityY = (ball.velocityY / speed) * (speed + 1);
        }
    }
    
    // Paddle collision - Computer
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.velocityX = -ball.velocityX;
        ball.x = computer.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - computer.y) / computer.height - 0.5;
        ball.velocityY = hitPos * 12;
        
        // Increase speed slightly
        const speed = Math.sqrt(ball.velocityX ** 2 + ball.velocityY ** 2);
        if (speed < ball.maxSpeed) {
            ball.velocityX = (ball.velocityX / speed) * (speed + 1);
            ball.velocityY = (ball.velocityY / speed) * (speed + 1);
        }
    }
    
    // Left wall (player scores)
    if (ball.x - ball.radius < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    
    // Right wall (computer scores)
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.velocityY = (Math.random() - 0.5) * 8;
}

function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function update() {
    if (gameRunning) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }
}

// Game loop
function gameLoop() {
    update();
    drawGame();
    requestAnimationFrame(gameLoop);
}

// Initialize and start game loop
updateScore();
gameLoop();
