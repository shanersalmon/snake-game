document.addEventListener('DOMContentLoaded', () => {
    // Game canvas setup
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 20;
    const gridWidth = canvas.width / gridSize;
    const gridHeight = canvas.height / gridSize;
    
    // Game elements
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameSpeed = 150; // milliseconds
    let gameInterval;
    let gameRunning = false;
    
    // DOM elements
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    // Initialize high score display
    highScoreElement.textContent = highScore;
    
    // Initialize game
    function initGame() {
        // Create initial snake (3 segments)
        snake = [
            {x: 6, y: 10},
            {x: 5, y: 10},
            {x: 4, y: 10}
        ];
        
        // Reset game state
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        scoreElement.textContent = score;
        
        // Generate first food
        generateFood();
        
        // Draw initial state
        draw();
    }
    
    // Generate food at random position
    function generateFood() {
        // Generate random position
        let foodX, foodY;
        let validPosition = false;
        
        while (!validPosition) {
            foodX = Math.floor(Math.random() * gridWidth);
            foodY = Math.floor(Math.random() * gridHeight);
            
            // Check if position overlaps with snake
            validPosition = true;
            for (let segment of snake) {
                if (segment.x === foodX && segment.y === foodY) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        food = {
            x: foodX,
            y: foodY,
            color: getRandomFoodColor()
        };
    }
    
    // Get random color for food
    function getRandomFoodColor() {
        const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Game loop
    function gameLoop() {
        // Update snake position
        updateSnake();
        
        // Check collisions
        if (checkCollision()) {
            gameOver();
            return;
        }
        
        // Check if snake eats food
        if (snake[0].x === food.x && snake[0].y === food.y) {
            // Increase score
            score += 10;
            scoreElement.textContent = score;
            
            // Update high score if needed
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            
            // Don't remove tail (snake grows)
            generateFood();
            
            // Increase game speed slightly
            if (gameSpeed > 50) {
                gameSpeed -= 2;
                clearInterval(gameInterval);
                gameInterval = setInterval(gameLoop, gameSpeed);
            }
        } else {
            // Remove tail segment
            snake.pop();
        }
        
        // Draw updated state
        draw();
    }
    
    // Update snake position
    function updateSnake() {
        // Update direction from nextDirection
        direction = nextDirection;
        
        // Calculate new head position
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch (direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }
        
        // Add new head to beginning of snake array
        snake.unshift(head);
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
            return true;
        }
        
        // Check self collision (skip head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                return true;
            }
        }
        
        return false;
    }
    
    // Game over
    function gameOver() {
        clearInterval(gameInterval);
        gameRunning = false;
        startBtn.disabled = false;
        
        // Display game over message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.font = '30px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
        
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
    }
    
    // Draw game state
    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw snake
        snake.forEach((segment, index) => {
            // Head is darker red, body is lighter red
            if (index === 0) {
                ctx.fillStyle = '#C62828'; // Dark red for head
            } else {
                ctx.fillStyle = '#E53935'; // Light red for body
            }
            
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            
            // Add eyes to head
            if (index === 0) {
                ctx.fillStyle = 'white';
                
                // Position eyes based on direction
                let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
                const eyeSize = 4;
                const eyeOffset = 4;
                
                switch (direction) {
                    case 'up':
                        leftEyeX = segment.x * gridSize + eyeOffset;
                        leftEyeY = segment.y * gridSize + eyeOffset;
                        rightEyeX = segment.x * gridSize + gridSize - eyeOffset - eyeSize;
                        rightEyeY = segment.y * gridSize + eyeOffset;
                        break;
                    case 'down':
                        leftEyeX = segment.x * gridSize + eyeOffset;
                        leftEyeY = segment.y * gridSize + gridSize - eyeOffset - eyeSize;
                        rightEyeX = segment.x * gridSize + gridSize - eyeOffset - eyeSize;
                        rightEyeY = segment.y * gridSize + gridSize - eyeOffset - eyeSize;
                        break;
                    case 'left':
                        leftEyeX = segment.x * gridSize + eyeOffset;
                        leftEyeY = segment.y * gridSize + eyeOffset;
                        rightEyeX = segment.x * gridSize + eyeOffset;
                        rightEyeY = segment.y * gridSize + gridSize - eyeOffset - eyeSize;
                        break;
                    case 'right':
                        leftEyeX = segment.x * gridSize + gridSize - eyeOffset - eyeSize;
                        leftEyeY = segment.y * gridSize + eyeOffset;
                        rightEyeX = segment.x * gridSize + gridSize - eyeOffset - eyeSize;
                        rightEyeY = segment.y * gridSize + gridSize - eyeOffset - eyeSize;
                        break;
                }
                
                ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
                ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
            }
            
            // Add inner square to body segments for visual effect
            if (index > 0) {
                ctx.fillStyle = '#EF5350'; // Lighter red for inner square
                const innerPadding = 4;
                ctx.fillRect(
                    segment.x * gridSize + innerPadding,
                    segment.y * gridSize + innerPadding,
                    gridSize - innerPadding * 2,
                    gridSize - innerPadding * 2
                );
            }
        });
        
        // Draw food
        ctx.fillStyle = food.color;
        const foodX = food.x * gridSize;
        const foodY = food.y * gridSize;
        const foodRadius = gridSize / 2;
        
        ctx.beginPath();
        ctx.arc(foodX + foodRadius, foodY + foodRadius, foodRadius - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add shine effect to food
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(foodX + foodRadius - 2, foodY + foodRadius - 2, foodRadius / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw grid (optional - comment out for cleaner look)
        // drawGrid();
    }
    
    // Draw grid lines (optional)
    function drawGrid() {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }
    
    // Handle keyboard input
    document.addEventListener('keydown', (event) => {
        if (!gameRunning) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    });
    
    // Start button event listener
    startBtn.addEventListener('click', () => {
        if (gameRunning) return;
        
        initGame();
        gameRunning = true;
        startBtn.disabled = true;
        gameSpeed = 150; // Reset game speed
        gameInterval = setInterval(gameLoop, gameSpeed);
    });
    
    // Reset button event listener
    resetBtn.addEventListener('click', () => {
        clearInterval(gameInterval);
        gameRunning = false;
        startBtn.disabled = false;
        initGame();
    });
    
    // Initialize game on load
    initGame();
});