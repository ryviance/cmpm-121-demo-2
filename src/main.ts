import "./style.css";
import { MarkerLine } from './MarkerLine.ts'; 
import { ToolPreview } from './ToolPreview.ts'; // Import ToolPreview

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

let toolPreview: ToolPreview | null = new ToolPreview(1, 0, 0); // Start with thin tool by default
let selectedThickness = 1; // Default to thin

// Move this function outside of the event listeners
function updateToolPreview(x: number, y: number) {
    if (toolPreview) {
        toolPreview.updatePosition(x, y);
        toolPreview.updateThickness(selectedThickness); // Update thickness when tool is selected
    }
}

if (ctx) {
    let drawing = false;
    let strokes: Array<MarkerLine> = []; 
    let redoStack: Array<MarkerLine> = [];
    let currentStroke: MarkerLine | null = null;

    // Mouse down: Start drawing
    canvas.addEventListener("mousedown", (event) => {
        drawing = true;
        currentStroke = new MarkerLine(event.offsetX, event.offsetY, selectedThickness); 
    });

    // Mouse move: Draw preview and strokes if drawing
    canvas.addEventListener("mousemove", (event) => {
        if (drawing && currentStroke) {
            currentStroke.drag(event.offsetX, event.offsetY);
        }
        updateToolPreview(event.offsetX, event.offsetY); // Use the function here

        // Fire custom drawing-changed event
        const drawingChangedEvent = new Event("drawing-changed");
        canvas.dispatchEvent(drawingChangedEvent);
    });

    // Mouse up: Finish stroke
    canvas.addEventListener("mouseup", () => {
        if (drawing && currentStroke) {
            strokes.push(currentStroke);
            currentStroke = null;
            drawing = false;
            const drawingChangedEvent = new Event("drawing-changed");
            canvas.dispatchEvent(drawingChangedEvent);
        }
    });

    // Redraw canvas
    canvas.addEventListener("drawing-changed", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all previous strokes
        strokes.forEach((stroke) => {
            stroke.display(ctx);
        });

        // Draw the current stroke in progress
        if (currentStroke) {
            currentStroke.display(ctx);
        }

        // Draw tool preview
        if (toolPreview && !drawing) {  // Only show when not drawing
            toolPreview.draw(ctx);
        }
    });

    // Create a container for buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";
    appContainer.appendChild(buttonContainer);

    // Undo button
    const undoButton = document.createElement("button");
    undoButton.innerText = "Undo";
    buttonContainer.appendChild(undoButton);
    undoButton.addEventListener("click", () => {
        if (strokes.length > 0) {
            redoStack.push(strokes.pop()!);
            const drawingChangedEvent = new Event("drawing-changed");
            canvas.dispatchEvent(drawingChangedEvent);
        }
    });

    // Redo button
    const redoButton = document.createElement("button");
    redoButton.innerText = "Redo";
    buttonContainer.appendChild(redoButton);
    redoButton.addEventListener("click", () => {
        if (redoStack.length > 0) {
            strokes.push(redoStack.pop()!);
            const drawingChangedEvent = new Event("drawing-changed");
            canvas.dispatchEvent(drawingChangedEvent);
        }
    });

    // Clear button
    const clearButton = document.createElement("button");
    clearButton.innerText = "Clear";
    buttonContainer.appendChild(clearButton);
    clearButton.addEventListener("click", () => {
        strokes = [];
        redoStack = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Thin Marker button
    const thinButton = document.createElement("button");
    thinButton.innerText = "Thin Marker";
    buttonContainer.appendChild(thinButton);
    thinButton.addEventListener("click", () => {
        selectedThickness = 1;
    });

    // Thick Marker button
    const thickButton = document.createElement("button");
    thickButton.innerText = "Thick Marker";
    buttonContainer.appendChild(thickButton);
    thickButton.addEventListener("click", () => {
        selectedThickness = 5;
    });
} else {
    console.error("Could not get 2D context for the canvas.");
}