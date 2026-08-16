const PIXI = require('pixi.js');

class FoodItem extends PIXI.Container {
  constructor(app, targetX, targetY) {
    super();
    this.app = app;
    this.x = targetX;
    this.y = targetY - 150;
    this.targetY = targetY;
    this.isEaten = false;
    this.velocityY = 0;
    this.gravity = 0.5;

    this.initGraphics();
  }

  initGraphics() {
    const g = new PIXI.Graphics();
    
    // 사과 몸통
    g.circle(0, 0, 14);
    g.fill({ color: 0xff4d6d });
    g.stroke({ width: 2, color: 0xc9184a });

    // 사과 잎사귀
    g.ellipse(3, -14, 5, 3);
    g.fill({ color: 0x52b788 });

    this.addChild(g);
  }

  update(delta) {
    if (this.isEaten) return;

    if (this.y < this.targetY) {
      this.velocityY += this.gravity * delta;
      this.y += this.velocityY;

      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.velocityY = -this.velocityY * 0.4;
        if (Math.abs(this.velocityY) < 1) {
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
