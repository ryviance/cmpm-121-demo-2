export class MarkerLine {
    points: Array<{ x: number; y: number }>;

    constructor(initialPoint: { x: number; y: number }) {
        this.points = [initialPoint];
    }

    // Add a new point as the line is dragged
    drag(x: number, y: number) {
        this.points.push({ x, y });
    }

    // Display the line on the canvas
    display(ctx: CanvasRenderingContext2D) {
        if (this.points.length > 0) {
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            this.points.forEach((point) => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
            ctx.closePath();
        }
    }
}