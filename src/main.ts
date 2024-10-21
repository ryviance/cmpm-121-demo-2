import "./style.css";
import { MarkerLine } from './MarkerLine.ts'; 

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
    let strokes: Array<MarkerLine> = []; 
    let redoStack: Array<MarkerLine> = [];
    let currentStroke: MarkerLine | null = null;

    // Makes a new MarkerLine when the user starts drawing
    canvas.addEventListener("mousedown", (event) => {
        drawing = true;
        currentStroke = new MarkerLine(event.offsetX, event.offsetY, selectedThickness); // Pass thickness
    });    

    // Add points to the MarkerLine as the user drags the mouse
    canvas.addEventListener("mousemove", (event) => {
        if (drawing && currentStroke) {
            currentStroke.drag(event.offsetX, event.offsetY);

            const drawingChangedEvent = new Event("drawing-changed");
            canvas.dispatchEvent(drawingChangedEvent);
        }
    });

    // Save the MarkerLine when the user releases the mouse
    canvas.addEventListener("mouseup", () => {
        if (drawing && currentStroke) {
            strokes.push(currentStroke);
            currentStroke = null;
            drawing = false;

            const drawingChangedEvent = new Event("drawing-changed");
            canvas.dispatchEvent(drawingChangedEvent);
        }
    });

    // Redraw all MarkerLine objects on the canvas
    canvas.addEventListener("drawing-changed", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        strokes.forEach((stroke) => {
            stroke.display(ctx); // Use the display method to draw the line
        });

        if (currentStroke) {
            currentStroke.display(ctx); // Draw the current line if it's being drawn
        }
    });

    
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";
    appContainer.appendChild(buttonContainer);

    const undoButton = document.createElement("button");
    undoButton.innerText = "Undo";
    buttonContainer.appendChild(undoButton);

    // Undo button
    undoButton.addEventListener("click", () => {
        if (strokes.length > 0) {
            const lastStroke = strokes.pop();
            if (lastStroke) {
                redoStack.push(lastStroke);
                const drawingChangedEvent = new Event("drawing-changed");
                canvas.dispatchEvent(drawingChangedEvent);
            }
        }
    });

    // Redo button
    const redoButton = document.createElement("button");
    redoButton.innerText = "Redo";
    buttonContainer.appendChild(redoButton);

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

    // Create "Thin" button
    const thinButton = document.createElement("button");
    thinButton.innerText = "Thin Marker";
    buttonContainer.appendChild(thinButton);

    // Create "Thick" button
    const thickButton = document.createElement("button");
    thickButton.innerText = "Thick Marker";
    buttonContainer.appendChild(thickButton);

    // Variable to store the selected thickness
    let selectedThickness = 1; 

    // Event listeners for buttons
    thinButton.addEventListener("click", () => {
        selectedThickness = 1; // Thin marker
    });

    thickButton.addEventListener("click", () => {
        selectedThickness = 5; // Thick marker
    });

} else {
    console.error("Could not get 2D context for the canvas."); // If I don't include this it throws an error
}