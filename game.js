const CELL_SIZE = 16;
const CANVAS_WIDTH = CELL_SIZE * 24;
const CANVAS_HEIGHT = CELL_SIZE * 24;
const CANVAS_BACKGROUND_COLOUR = "#131313";
const DIFFICULTY_MULTIPLIER = 0.09;
const INITIAL_GAME_SPEED_MS = 320;
const INITIAL_SNAKE_LENGTH = 5;
const SNAKE_COLOUR = "#f6ca9f";
const SNAKE_HEAD_COLOR = "#f9e6cf";
const FOOD_COLOUR = "#5ac54f";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const canvasCenterX = Math.floor(canvas.width / CELL_SIZE / 2) * CELL_SIZE;
const canvasCenterY = Math.floor(canvas.height / CELL_SIZE / 2) * CELL_SIZE;

let score = 0;
let current_difficulty = 0;

let dx = CELL_SIZE;
let dy = 0;

let isHandlingInput = false;

let snake = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => ({
  x: canvasCenterX - i * CELL_SIZE,
  y: canvasCenterY,
}));

let foodPosition;

function clearCanvas() {
  ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCanvasBackground() {
  ctx.fillStyle = CANVAS_BACKGROUND_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCheckeredOverlay() {
  const colorA = "#ffffff05";
  const colorB = "transparent";
  const rows = canvas.height / CELL_SIZE;
  const cols = canvas.width / CELL_SIZE;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const color = (row + col) % 2 === 0 ? colorA : colorB;
      ctx.fillStyle = color;
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
    foodPosition.x + CELL_SIZE / 2,
    foodPosition.y + CELL_SIZE / 2,
    CELL_SIZE / 2.5,
    FOOD_COLOUR
  );
}

function increaseDifficulty() {
  current_difficulty += DIFFICULTY_MULTIPLIER;
}

function processGameState() {
  const head = { x: snake[0].x + dx, y: snake[0].y + dy };

  const didEatFood = head.x === foodPosition.x && head.y === foodPosition.y;

  if (didEatFood) {
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

function spawnFood() {
  foodPosition = {
    x: getRandomCell(CANVAS_WIDTH / CELL_SIZE) * CELL_SIZE,
    y: getRandomCell(CANVAS_HEIGHT / CELL_SIZE) * CELL_SIZE,
  };

  snake.forEach(function isFoodOnSnake(part) {
    const foodIsoNsnake = part.x == foodPosition.x && part.y == foodPosition.y;
    if (foodIsoNsnake) spawnFood();
  });
}

function drawSnake() {
  snake.forEach((part, i) => drawSnakePart(part, i));
}

function drawSnakePart(snakePart, i) {
  ctx.fillStyle = SNAKE_COLOUR;
  if (i === 0) {
    ctx.fillStyle = SNAKE_HEAD_COLOR;
  }
  ctx.fillRect(snakePart.x, snakePart.y, CELL_SIZE, CELL_SIZE);
}

function handleInput(event) {
  const LEFT_KEY = ["ArrowLeft", "KeyA"];
  const RIGHT_KEY = ["ArrowRight", "KeyD"];
  const UP_KEY = ["ArrowUp", "KeyW"];
  const DOWN_KEY = ["ArrowDown", "KeyS"];

  if (isHandlingInput) return;
  isHandlingInput = true;

  const keyPressed = event.code;

  const isMovingUp = dy === -CELL_SIZE;
  const isMovingDown = dy === CELL_SIZE;
  const isMovingRight = dx === CELL_SIZE;
  const isMovingLeft = dx === -CELL_SIZE;

  if (LEFT_KEY.includes(keyPressed) && !isMovingRight) {
    dx = -CELL_SIZE;
    dy = 0;
  }
  if (UP_KEY.includes(keyPressed) && !isMovingDown) {
    dx = 0;
    dy = -CELL_SIZE;
  }
  if (RIGHT_KEY.includes(keyPressed) && !isMovingLeft) {
    dx = CELL_SIZE;
    dy = 0;
  }
  if (DOWN_KEY.includes(keyPressed) && !isMovingUp) {
    dx = 0;
    dy = CELL_SIZE;
  }
}

function gameTick() {
  if (isGameOver()) return;

  clearCanvas();
  drawCanvasBackground();
  drawCheckeredOverlay();
  processGameState();
  drawFood();
  drawSnake();

  main();
}

function main() {
  setTimeout(gameTick, (1 / (1 + current_difficulty)) * INITIAL_GAME_SPEED_MS);
}

main();
spawnFood();
document.addEventListener("keydown", handleInput);
