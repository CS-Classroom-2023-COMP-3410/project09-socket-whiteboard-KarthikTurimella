import { io } from "socket.io-client";

const boardCanvas = document.getElementById('boardCanvas');
const boardContext = boardCanvas.getContext('2d');
const penColor = document.getElementById('penColor');
const wipeBoard = document.getElementById('wipeBoard');

let isDrawing = false;
let currentColor = '#000000';
let startX = 0, startY = 0;

const socketConnection = io('http://localhost:3000');

socketConnection.on('load', (savedBoard) => {
    console.log('Restoring board state:', savedBoard);
    savedBoard.forEach(renderLine);
});

socketConnection.on('draw', (lineData) => {
    console.log('New draw event:', lineData);
    renderLine(lineData);
});

socketConnection.on('clear', () => {
    console.log('Board wipe event received');
    boardContext.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
});

const renderLine = ({ x0, y0, x1, y1, color }) => {
    boardContext.beginPath();
    boardContext.moveTo(x0, y0);
    boardContext.lineTo(x1, y1);
    boardContext.strokeStyle = color;
    boardContext.lineWidth = 2;
    boardContext.stroke();
    boardContext.closePath();
};

boardCanvas.addEventListener('mousedown', (event) => {
    isDrawing = true;
    [startX, startY] = [event.offsetX, event.offsetY];
});

boardCanvas.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;
    const endX = event.offsetX;
    const endY = event.offsetY;
    const lineData = { x0: startX, y0: startY, x1: endX, y1: endY, color: currentColor };

    renderLine(lineData);

    socketConnection.emit('draw', lineData);

    [startX, startY] = [endX, endY];
});

boardCanvas.addEventListener('mouseup', () => isDrawing = false);
boardCanvas.addEventListener('mouseleave', () => isDrawing = false);

penColor.addEventListener('input', (event) => {
    currentColor = event.target.value;
});

wipeBoard.addEventListener('click', () => {
    socketConnection.emit('clear');
});
