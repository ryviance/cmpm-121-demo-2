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
    const size = 30; // Can change the size of the sticker if needed
    ctx.font = `${size}px Arial`;
    ctx.fillText(this.emoji, this.x - size / 2, this.y + size / 2);
  }
}
