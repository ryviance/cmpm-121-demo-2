export class MarkerLine {
    private points: { x: number; y: number }[] = [];
    private thickness: number;
    private color: string; // Store color
  
    constructor(x: number, y: number, thickness: number, color: string) {
      this.points.push({ x, y });
      this.thickness = thickness;
      this.color = color; // Initialize color
    }
  
    public drag(x: number, y: number) {
      this.points.push({ x, y });
    }
  
    public display(ctx: CanvasRenderingContext2D) {
        if (!ctx) return;
      
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
      
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
      
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.closePath();
      }      
  }  