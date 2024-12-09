import "./style.css";
import { MarkerLine } from "./MarkerLine.ts";
import { ToolPreview } from "./ToolPreview.ts";

interface Action {
  type: "stroke" | "sticker";
  data: MarkerLine | Sticker;
}

class Sticker {
  constructor(public x: number, public y: number, public emoji: string) {}

  display(ctx: CanvasRenderingContext2D) {
    const size = 30;
    ctx.font = `${size}px Arial`;
    ctx.fillText(this.emoji, this.x - size / 2, this.y + size / 2);
  }
}

class Sketchpad {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private toolPreview: ToolPreview | null;
  private selectedThickness = 1;
  private selectedSticker: string | null = null;
  private selectedColor: string = "black"; // Default color
  private stickers: string[] = ["😊", "🌟", "👍"];
  private actions: Action[] = [];
  private redoStack: Action[] = [];
  private currentStroke: MarkerLine | null = null;
  private drawing = false;
  private mouseX: number | null = null;
  private mouseY: number | null = null;

  constructor(container: HTMLElement) {
    this.canvas = this.createCanvas(container);
    this.ctx = this.canvas.getContext("2d");
    this.toolPreview = new ToolPreview(1, 0, 0);
    this.setupEventListeners();
    this.createUI(container);
  }

  private createCanvas(container: HTMLElement): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    canvas.id = "myCanvas";
    container.appendChild(canvas);
    return canvas;
  }

  private setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
    this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
    this.canvas.addEventListener("mouseup", () => this.onMouseUp());
    this.canvas.addEventListener("mouseleave", () => this.onMouseLeave());
    this.canvas.addEventListener("drawing-changed", () => this.redrawCanvas());
  }

  private onMouseDown(event: MouseEvent) {
    this.selectedSticker
      ? this.placeSticker(event.offsetX, event.offsetY)
      : this.startDrawing(event.offsetX, event.offsetY);
  }

  private onMouseMove(event: MouseEvent) {
    this.mouseX = event.offsetX;
    this.mouseY = event.offsetY;

    if (this.drawing && this.currentStroke) {
      this.currentStroke.drag(this.mouseX, this.mouseY);
    }

    this.redrawCanvas();

    if (this.selectedSticker && this.ctx) {
      this.drawStickerPreview(this.mouseX, this.mouseY);
    }
  }

  private onMouseUp() {
    if (this.drawing && this.currentStroke) {
      this.addAction("stroke", this.currentStroke);
      this.currentStroke = null;
      this.drawing = false;
      this.clearRedoStack();
      this.dispatchDrawingChangedEvent();
    }
  }

  private onMouseLeave() {
    this.mouseX = null;
    this.mouseY = null;
    this.redrawCanvas();
  }

  private startDrawing(x: number, y: number) {
    this.drawing = true;
    this.currentStroke = new MarkerLine(x, y, this.selectedThickness, this.selectedColor); // Pass selectedColor here
  }  

  private placeSticker(x: number, y: number) {
    const sticker = new Sticker(x, y, this.selectedSticker!);
    this.addAction("sticker", sticker);
    this.selectedSticker = null;
    this.clearRedoStack();
    this.dispatchDrawingChangedEvent();
  }

  private addAction(type: "stroke" | "sticker", data: MarkerLine | Sticker) {
    this.actions.push({ type, data });
  }

  private drawStickerPreview(x: number, y: number) {
    if (!this.ctx) return;
    const size = 30;
    this.ctx.font = `${size}px Arial`;
    this.ctx.fillText(this.selectedSticker!, x - size / 2, y + size / 2);
  }

  private drawMarkerPreview(x: number, y: number) {
    if (!this.ctx || this.selectedSticker) return;

    const previewRadius = this.selectedThickness === 1 ? 2 : 4; // Adjusted sizes
    this.ctx.beginPath();
    this.ctx.arc(x, y, previewRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.selectedColor; // Use the selected color
    this.ctx.fill();
    this.ctx.closePath();
  }

  private redrawCanvas() {
    if (!this.ctx) return;

    this.clearCanvas();
    this.actions.forEach((action) => this.drawAction(action));
    if (this.currentStroke) this.currentStroke.display(this.ctx!);

    if (this.mouseX !== null && this.mouseY !== null) {
      this.drawMarkerPreview(this.mouseX, this.mouseY);
    }

    if (!this.drawing && this.toolPreview) {
      this.toolPreview.draw(this.ctx!);
    }
  }

  private clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private drawAction(action: Action) {
    if (action.type === "stroke") {
      (action.data as MarkerLine).display(this.ctx!);
    } else if (action.type === "sticker") {
      (action.data as Sticker).display(this.ctx!);
    }
  }

  private dispatchDrawingChangedEvent() {
    const event = new Event("drawing-changed");
    this.canvas.dispatchEvent(event);
  }

  private createUI(container: HTMLElement) {
    const buttonContainer = this.createButtonContainer(container);
    this.createActionButtons(buttonContainer);
    this.createStickerButtons(buttonContainer);
    this.createMarkerButtons(buttonContainer);
    this.createColorPicker(buttonContainer); // Added color picker
    this.createButton(buttonContainer, "Export", () => this.exportCanvas());
    this.createAddCustomStickerButton(buttonContainer);
  }

  private createButtonContainer(container: HTMLElement): HTMLElement {
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";
    container.appendChild(buttonContainer);
    return buttonContainer;
  }

  private createActionButtons(container: HTMLElement) {
    this.createButton(container, "Undo", () => this.undo());
    this.createButton(container, "Redo", () => this.redo());
    this.createButton(container, "Clear", () => this.clear());
  }

  private createStickerButtons(container: HTMLElement) {
    this.stickers.forEach((sticker) => {
      this.createButton(container, sticker, () => this.selectSticker(sticker), "stickerButton");
    });
  }

  private createMarkerButtons(container: HTMLElement) {
    this.createButton(
      container,
      "Thin Marker",
      () => (this.selectedThickness = 1),
    );
    this.createButton(
      container,
      "Thick Marker",
      () => (this.selectedThickness = 5),
    );
  }

  private createColorPicker(container: HTMLElement) {
    const input = document.createElement("input");
    input.type = "color";
    input.value = "#000000"; // Default to black
    input.addEventListener("input", (e) => {
      const color = (e.target as HTMLInputElement).value;
      this.selectedColor = color;
    });
    container.appendChild(input);
  }

  private createAddCustomStickerButton(container: HTMLElement) {
    this.createButton(container, "Add Custom Sticker", () => this.addCustomSticker());
  }

  private createButton(
    container: HTMLElement,
    label: string,
    onClick: () => void,
    className: string = ""
  ) {
    const button = document.createElement("button");
    button.innerText = label;
    button.addEventListener("click", onClick);
    if (className) button.classList.add(className);
    container.appendChild(button);
  }

  private addCustomSticker() {
    const customSticker = prompt("Enter a custom sticker emoji:");
    if (customSticker && customSticker.trim() !== "") {
      this.stickers.push(customSticker.trim());
      this.updateStickerButtons(); // Update the sticker buttons immediately
    }
  }

  private updateStickerButtons() {
    const buttonContainer = document.getElementById("buttonContainer") as HTMLElement;
    const stickerButtons = buttonContainer.querySelectorAll(".stickerButton");
    stickerButtons.forEach((button) => button.remove());

    // Recreate sticker buttons based on the updated stickers array
    this.stickers.forEach((sticker) => {
      this.createButton(buttonContainer, sticker, () => this.selectSticker(sticker), "stickerButton");
    });
  }

  private undo() {
    if (this.actions.length > 0) {
      const action = this.actions.pop()!;
      this.redoStack.push(action);
      this.dispatchDrawingChangedEvent();
    }
  }

  private redo() {
    if (this.redoStack.length > 0) {
      const action = this.redoStack.pop()!;
      this.actions.push(action);
      this.dispatchDrawingChangedEvent();
    }
  }

  private clearRedoStack() {
    this.redoStack = [];
  }

  private clear() {
    this.actions = [];
    this.redoStack = [];
    this.clearCanvas();
  }

  private selectSticker(sticker: string) {
    this.selectedSticker = sticker;
  }

  private exportCanvas() {
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportCtx = exportCanvas.getContext("2d");

    if (!exportCtx) return;

    // Scale to make the drawing fit the new canvas size
    exportCtx.scale(4, 4); // Scale by 4x in both x and y direction

    // Redraw the actions on the new canvas
    this.actions.forEach((action) => this.drawActionOnExport(action, exportCtx));

    // Create the PNG image and trigger download
    exportCanvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "sketchpad.png";
        link.click();
      }
    });
  }

  private drawActionOnExport(action: Action, ctx: CanvasRenderingContext2D) {
    if (action.type === "stroke") {
      (action.data as MarkerLine).display(ctx);
    } else if (action.type === "sticker") {
      (action.data as Sticker).display(ctx);
    }
  }
}

// Main initialization
document.addEventListener("DOMContentLoaded", () => {
  const appDiv = document.getElementById("app") as HTMLElement;
  const appContainer = document.createElement("div");
  appContainer.id = "appContainer";
  appDiv.appendChild(appContainer);

  const title = document.createElement("h1");
  title.innerText = "Sticker Sketchpad";
  appContainer.appendChild(title);

  new Sketchpad(appContainer);
});