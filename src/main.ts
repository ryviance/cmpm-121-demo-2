import "./style.css";
import { MarkerLine } from './MarkerLine.ts'; 
import { ToolPreview } from './ToolPreview.ts'; // Import ToolPreview

// Sticker class to display emoji stickers
export class Sticker {
    public x: number;
    public y: number;
    public emoji: string;

    constructor(x: number, y: number, emoji: string) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
    }

    // Method to display the sticker
    display(ctx: CanvasRenderingContext2D) {
        const size = 30; // You can change the size of the sticker if needed
        ctx.font = `${size}px Arial`;
        ctx.fillText(this.emoji, this.x - size / 2, this.y + size / 2);
    }
}

// Initialize the app container
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

// Sticker selection and preview
let selectedSticker: string | null = null; 
let stickers: Array<Sticker> = [];

if (ctx) {
    let drawing = false;
    let strokes: Array<MarkerLine> = []; 
    let redoStack: Array<MarkerLine> = [];
    let currentStroke: MarkerLine | null = null;

    // Mouse down: Start drawing or placing sticker
    canvas.addEventListener("mousedown", (event) => {
        if (selectedSticker) {
            // Place sticker on canvas
            const newSticker = new Sticker(event.offsetX, event.offsetY, selectedSticker);
            stickers.push(newSticker);
        } else {
            // Start drawing
            drawing = true;
            currentStroke = new MarkerLine(event.offsetX, event.offsetY, selectedThickness); 
        }
    });

    // Mouse move: Draw preview for strokes and stickers
    canvas.addEventListener("mousemove", (event) => {
        if (drawing && currentStroke) {
            currentStroke.drag(event.offsetX, event.offsetY);
        }

        if (selectedSticker) {
            // Draw the selected sticker emoji as a preview next to the cursor
            const previewStickerSize = 30; // Size of the preview sticker
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before redrawing

            // Draw existing strokes
            strokes.forEach((stroke) => {
                stroke.display(ctx);
            });

            // Draw existing stickers
            stickers.forEach((sticker) => {
                sticker.display(ctx); // Use the display method from Sticker class
            });

            // Draw sticker preview
            ctx.font = `${previewStickerSize}px Arial`; // Set font size for preview sticker
            ctx.fillText(selectedSticker, event.offsetX - previewStickerSize / 2, event.offsetY + previewStickerSize / 2); // Draw it around the cursor
        }

        updateToolPreview(event.offsetX, event.offsetY);

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

        // Draw all stickers
        stickers.forEach((sticker) => {
            sticker.display(ctx);
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
        stickers = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    // Sticker buttons
    const stickerButton1 = document.createElement("button");
    stickerButton1.innerText = "😊";
    buttonContainer.appendChild(stickerButton1);
    stickerButton1.addEventListener("click", () => {
        selectedSticker = "😊";
    });

    const stickerButton2 = document.createElement("button");
    stickerButton2.innerText = "🌟";
    buttonContainer.appendChild(stickerButton2);
    stickerButton2.addEventListener("click", () => {
        selectedSticker = "🌟";
    });

    const stickerButton3 = document.createElement("button");
    stickerButton3.innerText = "👍";
    buttonContainer.appendChild(stickerButton3);
    stickerButton3.addEventListener("click", () => {
        selectedSticker = "👍";
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