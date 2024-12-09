export class MarkerLine {
  private points: Array<{ x: number; y: number }>;
  private thickness: number;

  constructor(x: number, y: number, thickness: number) {
    this.points = [{ x, y }];
    this.thickness = thickness; // Store the line thickness
  }

  drag(x: number, y: number) {
    this.points.push({ x, y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.points.length > 0) {
      ctx.lineWidth = this.thickness; // Set the thickness
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
