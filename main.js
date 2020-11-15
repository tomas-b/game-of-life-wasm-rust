
import * as wasm from "./gol-lib/Cargo.toml";
const {Universe, Cell} = wasm
const memory = wasm.default.wasm.memory

const CELL_SIZE = 6;
const [GRID_COLOR, DEAD_COLOR, ALIVE_COLOR] = ["#333", "#000", "#FFF"];

const universe = Universe.new();
const [w, h] = [universe.width(), universe.height()];

let canvas = document.querySelector('canvas')
    canvas.height = (CELL_SIZE + 1) * h + 1;
    canvas.width  = (CELL_SIZE + 1) * w + 1;

const ctx = canvas.getContext('2d');


const drawGrid = () => {
  ctx.beginPath();
  ctx.strokeStyle = GRID_COLOR;

  // Vertical lines.
  for (let i = 0; i <= w; i++) {
    ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * h + 1);
  }

  // Horizontal lines.
  for (let j = 0; j <= h; j++) {
    ctx.moveTo(0,                       j * (CELL_SIZE + 1) + 1);
    ctx.lineTo((CELL_SIZE + 1) * w + 1, j * (CELL_SIZE + 1) + 1);
  }

  ctx.stroke();
};

const getIndex = (row, column) => {
  return row * w + column;
};

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, w * h);

  ctx.beginPath();

  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {

      const idx = getIndex(row, col);

      ctx.fillStyle = cells[idx] === Cell.Dead
        ? DEAD_COLOR
        : ALIVE_COLOR;

      ctx.fillRect(
        col * (CELL_SIZE + 1) + 1,
        row * (CELL_SIZE + 1) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
      
    }
  }

  ctx.stroke();
};

let animation = false;

const ticks = document.querySelector('#ticks');

const renderLoop = () => {
  drawGrid();
  drawCells();
  for(let i = 0; i < ticks.value; i++) universe.tick();
  animation = requestAnimationFrame(renderLoop);
};

const playBtn = document.querySelector('button')

playBtn.addEventListener('click', e => {
  playBtn.textContent = animation ? "▶" : "⏸";
  if ( animation ) {
    cancelAnimationFrame(animation);
    animation = false;
  } else {
    renderLoop();
  }
})

 drawGrid();
 drawCells();

canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / (CELL_SIZE + 1)), h- 1);
  const col = Math.min(Math.floor(canvasLeft / (CELL_SIZE + 1)), w- 1);

  universe.toggle_cell(row, col);

  drawGrid();
  drawCells();
});