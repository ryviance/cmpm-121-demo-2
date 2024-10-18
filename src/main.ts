import "./style.css";

const appContainer = document.createElement("div");
const appDiv = document.getElementById("app") as HTMLElement;
appContainer.id = "appContainer"; 

appDiv.appendChild(appContainer);

const title = document.createElement("h1");
title.innerText = "Sticker Sketchpad";
appContainer.appendChild(title);

const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
canvas.id = "myCanvas";
appContainer.appendChild(canvas);

const ctx = canvas.getContext("2d");

if (ctx) {
    let drawing = false;
    let strokes: Array<Array<{ x: number; y: number }>> = []; 
    let redoStack: Array<Array<{ x: number; y: number }>> = [];
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
            if (currentStroke.length > 0) {
                strokes.push(currentStroke); // Save the current stroke
                currentStroke = []; // Clear current stroke for the next drawing
            }
            drawing = false; // Stop drawing

            // Dispatch the drawing-changed event after saving the stroke
            const drawingChangedEvent = new Event("drawing-changed");
            canvas.dispatchEvent(drawingChangedEvent);
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

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";
    appContainer.appendChild(buttonContainer);

    // UNDO BUTTON
    const undoButton = document.createElement("button");
    undoButton.innerText = "Undo";
    buttonContainer.appendChild(undoButton);

    undoButton.addEventListener("click", () => {
        if (strokes.length > 0) {
            const lastStroke = strokes.pop(); // Pop top of undo stack when button clicked
            if (lastStroke) {
                redoStack.push(lastStroke); 
                const drawingChangedEvent = new Event("drawing-changed");
                canvas.dispatchEvent(drawingChangedEvent); 
            }
        }
    });

    // REDO BUTTON
    const redoButton = document.createElement("button");
    redoButton.innerText = "Redo";
    buttonContainer.appendChild(redoButton); // Add to redo stack when action is done

    redoButton.addEventListener("click", () => {
        if (redoStack.length > 0) {
            const redoStroke = redoStack.pop();
            if (redoStroke) {
                strokes.push(redoStroke); 
                const drawingChangedEvent = new Event("drawing-changed");
                canvas.dispatchEvent(drawingChangedEvent); 
            }
        }
    });

    const clearButton = document.createElement("button");
    clearButton.innerText = "Clear";
    buttonContainer.appendChild(clearButton);

    clearButton.addEventListener("click", () => {
        strokes = [];
        redoStack = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
} else {
    console.error("Could not get 2D context for the canvas.");
}