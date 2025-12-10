
const activeToolEl = document.getElementById('active-tool');
const brushColorBtn = document.getElementById('brush-color');
const brushIcon = document.getElementById('brush');
const brushSizeEl = document.getElementById('brush-size'); y
const brushSlider = document.getElementById('brush-slider');
const bucketColorBtn = document.getElementById('bucket-color');
const eraserEl = document.getElementById('eraser');
const clearCanvasBtn = document.getElementById('clear-canvas');
const saveStorageBtn = document.getElementById('save-storage');
const loadStorageBtn = document.getElementById('load-storage');
const clearStorageBtn = document.getElementById('clear-storage');
const downloadBtn = document.getElementById('download');
const { body } = document;

const canvas = document.createElement('canvas');
canvas.id = 'canvas';
const context = canvas.getContext('2d');
let drawnArray = [];
const STORAGE_KEY = 'savedCanvasData';

let appState = {
    currentSize: 10,
    bucketColor: '#FFFFFF',
    currentColor: '#A51DAB',
    isEraser: false,
    isMouseDown: false,
};

// --- Helper Functions ---

// Unified utility for displaying messages and switching back
function updateUIStatus(message) {
    activeToolEl.textContent = message;
    setTimeout(switchToBrush, 1500);
}

function displayBrushSize() {
    brushSizeEl.textContent = appState.currentSize < 10 
        ? `0${appState.currentSize}` 
        : appState.currentSize;
}

// Draw what is stored in DrawnArray
function restoreCanvas() {
  for (let i = 1; i < drawnArray.length; i++) {
    context.beginPath();
    context.moveTo(drawnArray[i - 1].x, drawnArray[i - 1].y);
    context.lineWidth = drawnArray[i].size;
    context.lineCap = 'round';
    context.strokeStyle = drawnArray[i].eraser ? appState.bucketColor : drawnArray[i].color;
    context.lineTo(drawnArray[i].x, drawnArray[i].y);
    context.stroke();
  }
}

// Store Drawn Lines in DrawnArray
function storeDrawn(x, y, size, color, erase) {
  const line = { x, y, size, color, erase };
  drawnArray.push(line);
}

// Get Mouse Position
function getMousePosition(event) {
  const boundaries = canvas.getBoundingClientRect();
  return {
    x: event.clientX - boundaries.left,
    y: event.clientY - boundaries.top,
  };
}


// --- Canvas and Tool Logic ---

// Create Canvas and set background
function createCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  context.fillStyle = appState.bucketColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  body.appendChild(canvas);
  switchToBrush();
}

// Switch back to Brush defaults
function switchToBrush() {
  appState.isEraser = false;
  activeToolEl.textContent = 'Brush';
  brushIcon.style.color = 'black';
  eraserEl.style.color = 'white';
  // Use currentColor from UI input value directly
  appState.currentColor = `#${brushColorBtn.value}`;
  appState.currentSize = 10;
  brushSlider.value = 10;
  displayBrushSize();
}


// --- Event Listeners for Tools ---

brushSlider.addEventListener('input', () => {
  appState.currentSize = brushSlider.value;
  displayBrushSize();
});

brushColorBtn.addEventListener('change', (event) => {
  appState.isEraser = false;
  appState.currentColor = event.target.value;
  displayBrushSize();
});

bucketColorBtn.addEventListener('change', (event) => {
  appState.bucketColor = event.target.value;
  createCanvas();
});

eraserEl.addEventListener('click', () => {
  appState.isEraser = true;
  brushIcon.style.color = 'white';
  eraserEl.style.color = 'black';
  activeToolEl.textContent = 'Eraser';
  appState.currentColor = appState.bucketColor;
  appState.currentSize = 50;
});

clearCanvasBtn.addEventListener('click', () => {
  createCanvas();
  drawnArray = [];
  updateUIStatus('Canvas Cleared');
});

brushIcon.addEventListener('click', switchToBrush);


// --- Mouse Event Listeners (Drawing Logic) ---

canvas.addEventListener('mousedown', (event) => {
  appState.isMouseDown = true;
  const currentPosition = getMousePosition(event);
  context.moveTo(currentPosition.x, currentPosition.y);
  context.beginPath();
  context.lineWidth = appState.currentSize;
  context.lineCap = 'round';
  context.strokeStyle = appState.currentColor;
});

canvas.addEventListener('mousemove', (event) => {
  if (appState.isMouseDown) {
    const currentPosition = getMousePosition(event);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    storeDrawn(
      currentPosition.x,
      currentPosition.y,
      appState.currentSize,
      appState.currentColor,
      appState.isEraser,
    );
  } else {
    storeDrawn(undefined);
  }
});

canvas.addEventListener('mouseup', () => {
  appState.isMouseDown = false;
});


// --- Storage & Download Functionality ---

// Save to Local Storage
saveStorageBtn.addEventListener('click', () => {
  const canvasDataToSave = {
    lines: drawnArray,
    backgroundColor: appState.bucketColor 
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(canvasDataToSave));
  updateUIStatus('Canvas Saved');
});

// Load from Local Storage
loadStorageBtn.addEventListener('click', () => {
  const storedDataString = localStorage.getItem(STORAGE_KEY); 

  if (storedDataString) {
    const loadedData = JSON.parse(storedDataString);
    appState.bucketColor = loadedData.backgroundColor || '#FFFFFF'; 
    createCanvas(); 
    drawnArray = loadedData.lines;
    restoreCanvas();
    updateUIStatus('Canvas Loaded');
  } else {
    updateUIStatus('No Canvas Found');
  }
});

// Clear Local Storage
clearStorageBtn.addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  updateUIStatus('Local Storage Cleared');
});

// Download Image
downloadBtn.addEventListener('click', () => {
  downloadBtn.href = canvas.toDataURL('image/jpeg', 1);
  downloadBtn.download = `paint_app_${Date.now()}.jpeg`; 
  updateUIStatus('Image File Saved');
});


// --- Initialization ---
createCanvas();
displayBrushSize();
