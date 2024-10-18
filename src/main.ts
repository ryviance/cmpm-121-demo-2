import "./style.css";

const appContainer = document.createElement("div");
const appDiv = document.getElementById("app") as HTMLElement;
appContainer.id = "appContainer"; 

appDiv.appendChild(appContainer);

const title = document.createElement("h1");
title.innerText = "Sticker Sketchpad";
appDiv.appendChild(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
appDiv.appendChild(canvas);

const ctx = canvas.getContext("2d");
let drawing = false;

canvas.addEventListener("mousedown", (event) => {
  drawing = true;
  ctx.beginPath(); 
  ctx.moveTo(event.offsetX, event.offsetY); 
});

canvas.addEventListener("mousemove", (event) => {
  if (drawing) {
    ctx.lineTo(event.offsetX, event.offsetY); 
    ctx.stroke(); 
  }
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  ctx.closePath(); 
});

const clearButton = document.createElement("button");
clearButton.innerText = "Clear";
appContainer.appendChild(clearButton); 

clearButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});