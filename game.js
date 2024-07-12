/**
 * Game Variables
 */
const CELL_SIZE = 16;
const CANVAS_WIDTH = CELL_SIZE * 24;
const CANVAS_HEIGHT = CELL_SIZE * 24;
const CANVAS_BACKGROUND_COLOUR = "#232323";
const DIFFICULTY_MULTIPLIER = 0.085;
const INITIAL_GAME_SPEED_MS = 310;
const INITIAL_SNAKE_LENGTH = 5;
const SNAKE_COLOUR = "#f6ca9f";
const SNAKE_HEAD_COLOR = "#f9e6cf";
const FOOD_COLOUR = "#99e65f";

/**
 * Utility Functions
 */
const half = (value) => value / 2;
const mod = (a, b) => a % b;
const divide = (a, b) => a / b;
const getVector = (x, y) => ({ x, y });

/**
 * Canvas Setup
 */
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const canvasCenterX = Math.floor(half(canvas.width / CELL_SIZE)) * CELL_SIZE;
const canvasCenterY = Math.floor(half(canvas.height / CELL_SIZE)) * CELL_SIZE;

/**
 * Game Logic
 */

const GameStates = Object.freeze({
  READY: Symbol("ready"),
  PLAYING: Symbol("playing"),
  LOSE: Symbol("lose"),
});

let gameTickCount = 0;
let gameState = GameStates.READY;
let score = 0;
let current_difficulty = 0;

let speed = getVector(CELL_SIZE, 0);
let isHandlingInput = false;

let snake = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) =>
  getVector(canvasCenterX - i * CELL_SIZE, canvasCenterY)
);

let food;

function resetGame() {
  gameTickCount = 0;
  gameState = GameStates.READY;
  score = 0;
  current_difficulty = 0;

  speed = getVector(CELL_SIZE, 0);
  isHandlingInput = false;

  snake = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) =>
    getVector(canvasCenterX - i * CELL_SIZE, canvasCenterY)
  );
  spawnFood();
}

function clearCanvas() {
  ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvasBackground() {
  ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCheckeredOverlay(colorA = "#ffffff09", colorB = "transparent") {
  for (let row = 0; row < divide(canvas.height, CELL_SIZE); row++) {
    for (let col = 0; col < divide(canvas.width, CELL_SIZE); col++) {
      ctx.fillStyle = mod(row + col, 2) === 0 ? colorA : colorB;
      ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function drawCircle(x, y, radius, color) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function drawFood() {
  drawCircle(
    food.x + half(CELL_SIZE),
    food.y + half(CELL_SIZE),
    divide(CELL_SIZE, 2.5),
    FOOD_COLOUR
  );
}

function increaseDifficulty() {
  current_difficulty += DIFFICULTY_MULTIPLIER;
}

function processGameState() {
  if (isGameOver()) {
    gameState = GameStates.LOSE;
    return;
  }
  const head = { x: snake[0].x + speed.x, y: snake[0].y + speed.y };

  if (isColliding(head, food)) {
    score += 1;
    document.getElementById("score").innerHTML = score;
    increaseDifficulty();
    spawnFood();
  } else {
    snake.pop();
  }
  isHandlingInput = false;
  snake.unshift(head);
}

function isGameOver() {
  for (let i = 4; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) return true;
  }

  const hitLeftWall = snake[0].x < 0;
  const hitRightWall = snake[0].x > canvas.width - CELL_SIZE;
  const hitToptWall = snake[0].y < 0;
  const hitBottomWall = snake[0].y > canvas.height - CELL_SIZE;

  return hitLeftWall || hitRightWall || hitToptWall || hitBottomWall;
}

function getRandomCell(max) {
  return Math.floor(Math.random() * max);
}

function isColliding(posA, posB) {
  if (!posA || !posB) return false;
  return posA.x === posB.x && posA.y === posB.y;
}

function spawnFood() {
  food = {
    x: getRandomCell(divide(CANVAS_WIDTH, CELL_SIZE)) * CELL_SIZE,
    y: getRandomCell(divide(CANVAS_HEIGHT, CELL_SIZE)) * CELL_SIZE,
  };

  snake.forEach((part) => {
    if (isColliding(part, food)) spawnFood();
  });
}

function drawSnake() {
  snake.forEach((part, i) => drawSnakePart(part, i));
}

function drawSnakePart(snakePart, i) {
  ctx.fillStyle =
    gameState === GameStates.LOSE &&
    mod(gameTickCount, Math.floor(current_difficulty) + 2) === 0
      ? "#f5555d"
      : SNAKE_COLOUR;
  if (i === 0) ctx.fillStyle = SNAKE_HEAD_COLOR;
  ctx.fillRect(snakePart.x, snakePart.y, CELL_SIZE, CELL_SIZE);
}

function handleInput(event) {
  const LEFT_KEY = ["ArrowLeft", "KeyA"];
  const RIGHT_KEY = ["ArrowRight", "KeyD"];
  const UP_KEY = ["ArrowUp", "KeyW"];
  const DOWN_KEY = ["ArrowDown", "KeyS"];

  if (keyPressed && gameState === GameStates.READY) {
    gameState = GameStates.PLAYING;
  }

  if (keyPressed && gameState === GameStates.LOSE) {
    resetGame();
    gameState = GameStates.READY;
  }

  if (isHandlingInput) return;
  isHandlingInput = true;

  const keyPressed = event.code;

  const isMovingUp = speed.y === -CELL_SIZE;
  const isMovingDown = speed.y === CELL_SIZE;
  const isMovingRight = speed.x === CELL_SIZE;
  const isMovingLeft = speed.x === -CELL_SIZE;

  if (LEFT_KEY.includes(keyPressed) && !isMovingRight) {
    speed = getVector(-CELL_SIZE, 0);
  }
  if (UP_KEY.includes(keyPressed) && !isMovingDown) {
    speed = getVector(0, -CELL_SIZE);
  }
  if (RIGHT_KEY.includes(keyPressed) && !isMovingLeft) {
    speed = getVector(CELL_SIZE, 0);
  }
  if (DOWN_KEY.includes(keyPressed) && !isMovingUp) {
    speed = getVector(0, CELL_SIZE);
  }
}

function drawWelcomeScreen() {
  ctx.fillStyle = "#bf6f4a55";
  ctx.fillRect(0, 32, canvas.width, 80);
  ctx.font = "48px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = SNAKE_HEAD_COLOR;
  ctx.fillText("SNAKE", canvasCenterX, canvasCenterY - 110);
  ctx.fillStyle = SNAKE_COLOUR;
  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillText("by Ahmed El-Shinawy", canvasCenterX, canvasCenterY - 90);

  if (mod(gameTickCount, 3) !== 0) {
    ctx.fillText("Press any key to PLAY", canvasCenterX, canvasCenterY + 130);
  }

  ctx.font = "16px 'Inter', sans-serif";
  ctx.fillStyle = "#99e65f";
  ctx.fillText("Arrow Keys or WASD to Move", canvasCenterX, canvasCenterY + 90);
}

function drawLoseScreen() {
  ctx.fillStyle = "#891e2b";
  ctx.fillRect(0, canvasCenterY - 30, canvas.width, 60);
  ctx.font = "48px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = SNAKE_HEAD_COLOR;
  ctx.fillText("GAME OVER!", canvasCenterX, canvasCenterY + 16);

  ctx.font = "14px 'Inter', sans-serif";
  ctx.fillText("Press any key to Try Again", canvasCenterX, canvasCenterY + 50);
}

function gameTick() {
  gameTickCount++;
  clearCanvas();
  drawCanvasBackground();
  drawCheckeredOverlay();

  switch (gameState) {
    case GameStates.READY:
      drawSnake();
      drawWelcomeScreen();
      break;
    case GameStates.PLAYING:
      processGameState();
      drawFood();
      drawSnake();
      break;
    case GameStates.LOSE:
      drawSnake();
      drawLoseScreen();
      break;
  }

  main();
}

function main() {
  setTimeout(
    gameTick,
    divide(1, 1 + current_difficulty) * INITIAL_GAME_SPEED_MS
  );
}

main();
spawnFood();
document.addEventListener("keydown", handleInput);
