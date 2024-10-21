export class ToolPreview {
    private thickness: number;
    private x: number;
    private y: number;

    constructor(thickness: number, x: number, y: number) {
        this.thickness = thickness;
        this.x = x;
        this.y = y;
    }

    // Update position based on mouse movement
    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Update the thickness when the tool changes
    updateThickness(thickness: number) {
        this.thickness = thickness;
    }

    // Draw the preview circle
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
}
