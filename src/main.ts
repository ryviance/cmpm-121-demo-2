import "./style.css";
import { MarkerLine } from './MarkerLine.ts';
import { ToolPreview } from './ToolPreview.ts';

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
    private actions: Array<Action> = [];
    private redoStack: Array<Action> = [];
    private currentStroke: MarkerLine | null = null;
    private drawing = false;

    constructor(container: HTMLElement) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 256;
        this.canvas.height = 256;
        this.canvas.id = "myCanvas";
        container.appendChild(this.canvas);

        this.ctx = this.canvas.getContext("2d");
        this.toolPreview = new ToolPreview(1, 0, 0);

        this.setupEventListeners();
        this.createUI(container);
    }

    private setupEventListeners() {
        this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e));
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e));
        this.canvas.addEventListener("mouseup", () => this.onMouseUp());
        this.canvas.addEventListener("drawing-changed", () => this.redrawCanvas());
    }

    private onMouseDown(event: MouseEvent) {
        if (this.selectedSticker) {
            this.placeSticker(event.offsetX, event.offsetY);
        } else {
            this.startDrawing(event.offsetX, event.offsetY);
        }
    }

    private onMouseMove(event: MouseEvent) {
        if (this.drawing && this.currentStroke) {
            this.currentStroke.drag(event.offsetX, event.offsetY);
        }

        this.redrawCanvas();

        if (this.selectedSticker && this.ctx) {
            this.drawStickerPreview(event.offsetX, event.offsetY);
        }
    }

    private onMouseUp() {
        if (this.drawing && this.currentStroke) {
            this.actions.push({ type: "stroke", data: this.currentStroke });
            this.currentStroke = null;
            this.drawing = false;
            this.clearRedoStack();
            this.dispatchDrawingChangedEvent();
        }
    }

    private startDrawing(x: number, y: number) {
        this.drawing = true;
        this.currentStroke = new MarkerLine(x, y, this.selectedThickness);
    }

    private placeSticker(x: number, y: number) {
        const sticker = new Sticker(x, y, this.selectedSticker!);
        this.actions.push({ type: "sticker", data: sticker });
        this.selectedSticker = null;
        this.clearRedoStack();
        this.dispatchDrawingChangedEvent();
    }

    private drawStickerPreview(x: number, y: number) {
        if (!this.ctx) return;
        const size = 30;
        this.ctx.font = `${size}px Arial`;
        this.ctx.fillText(this.selectedSticker!, x - size / 2, y + size / 2);
    }

    private redrawCanvas() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.actions.forEach((action) => {
            if (action.type === "stroke") {
                (action.data as MarkerLine).display(this.ctx!);
            } else if (action.type === "sticker") {
                (action.data as Sticker).display(this.ctx!);
            }
        });

        if (this.currentStroke) {
            this.currentStroke.display(this.ctx!);
        }

        if (!this.drawing && this.toolPreview) {
            this.toolPreview.draw(this.ctx!);
        }
    }

    private dispatchDrawingChangedEvent() {
        const event = new Event("drawing-changed");
        this.canvas.dispatchEvent(event);
    }

    private createUI(container: HTMLElement) {
        const buttonContainer = document.createElement("div");
        buttonContainer.id = "buttonContainer";
        container.appendChild(buttonContainer);

        this.createButton(buttonContainer, "Undo", () => this.undo());
        this.createButton(buttonContainer, "Redo", () => this.redo());
        this.createButton(buttonContainer, "Clear", () => this.clear());

        ["😊", "🌟", "👍"].forEach((sticker) => {
            this.createButton(buttonContainer, sticker, () => this.selectSticker(sticker));
        });

        this.createButton(buttonContainer, "Thin Marker", () => (this.selectedThickness = 1));
        this.createButton(buttonContainer, "Thick Marker", () => (this.selectedThickness = 5));
    }

    private createButton(container: HTMLElement, label: string, onClick: () => void) {
        const button = document.createElement("button");
        button.innerText = label;
        button.addEventListener("click", onClick);
        container.appendChild(button);
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
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    private selectSticker(sticker: string) {
        this.selectedSticker = sticker;
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