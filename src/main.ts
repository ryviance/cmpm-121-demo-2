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

if (ctx) {
    let drawing = false;
    let strokes: Array<Array<{ x: number; y: number }>> = []; 
    let currentStroke: Array<{ x: number; y: number }> = []; 

    canvas.addEventListener("mousedown", (event) => {
        drawing = true;
        currentStroke = [{ x: event.offsetX, y: event.offsetY }]; 
    });

    canvas.addEventListener("mousemove", (event) => {
        if (drawing) {
        currentStroke.push({ x: event.offsetX, y: event.offsetY }); 

        const drawingChangedEvent = new Event("drawing-changed");
        canvas.dispatchEvent(drawingChangedEvent);
        }
    });


    canvas.addEventListener("mouseup", () => {
        if (drawing) {
        strokes.push(currentStroke);
        drawing = false;
        }
    });

    canvas.addEventListener("drawing-changed", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        strokes.forEach((stroke) => {
        if (stroke.length > 0) {
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            stroke.forEach((point) => {
            ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.closePath();
        }
        });

        if (currentStroke.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentStroke[0].x, currentStroke[0].y);
        currentStroke.forEach((point) => {
            ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.closePath();
        }
    });

    const clearButton = document.createElement("button");
    clearButton.innerText = "Clear";
    appContainer.appendChild(clearButton);

    clearButton.addEventListener("click", () => {
        strokes = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
} else {
    console.error("Could not get 2D context for the canvas.");
}