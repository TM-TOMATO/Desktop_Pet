const PIXI = require('pixi.js');
const path = require('path');
const fs = require('fs');

class FoodItem extends PIXI.Container {
  constructor(app, foodType, targetX, targetY) {
    super();
    this.app = app;
    this.foodType = foodType || 'apple';
    this.x = targetX || 52;
    this.y = 10;
    this.targetY = targetY || 130;
    this.isEaten = false;
    this.velocityY = 0;
    this.gravity = 0.4;

    this.initGraphics();
  }

  initGraphics() {
    // 1) Find item sprite if present (item_apple.png, food_apple.png, etc.)
    const candidates = [
      `item_${this.foodType}.png`,
      `food_${this.foodType}.png`
    ];
    let foundPath = null;
    const subDirs = ['assets/sprites', 'resources/assets/sprites'];
    for (const name of candidates) {
      for (const sub of subDirs) {
        const p = path.join(process.cwd(), sub, name);
        if (fs.existsSync(p)) { foundPath = p; break; }
      }
      if (foundPath) break;
    }

    if (foundPath) {
      try {
        const buf = fs.readFileSync(foundPath);
        const img = new Image();
        img.src = `data:image/png;base64,${buf.toString('base64')}`;
        const tex = PIXI.Texture.from(img);
        if (tex.source) tex.source.scaleMode = 'nearest';
        const spr = new PIXI.Sprite(tex);
        spr.anchor.set(0.5, 0.5);
        this.addChild(spr);
        return;
      } catch (e) {}
    }

    // Fallback vector drawing
    const g = new PIXI.Graphics();
    g.circle(0, 0, 8);
    g.fill({ color: 0xff4d6d });
    g.stroke({ width: 1.5, color: 0x0f380f });
    this.addChild(g);
  }

  update(delta) {
    if (this.isEaten) return;

    if (this.y < this.targetY) {
      this.velocityY += this.gravity * delta;
      this.y += this.velocityY;

      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.velocityY = -this.velocityY * 0.3;
        if (Math.abs(this.velocityY) < 0.8) {
          this.velocityY = 0;
        }
      }
    }
  }

  consume() {
    this.isEaten = true;
    this.destroy({ children: true });
  }
}

if (typeof module !== 'undefined') {
  module.exports = { FoodItem };
}
