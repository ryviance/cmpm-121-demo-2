export class Sticker {
    constructor(public x: number, public y: number, public emoji: string) {}
  
    display(ctx: CanvasRenderingContext2D) {
      const size = 30;
      ctx.font = `${size}px Arial`;
      ctx.fillText(this.emoji, this.x - size / 2, this.y + size / 2);
    }
  }