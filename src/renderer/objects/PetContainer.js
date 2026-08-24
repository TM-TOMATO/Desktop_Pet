const PIXI = require('pixi.js');
const path = require('path');
const fs = require('fs');
const { PetState } = require('../core/StateMachine.js');

class PetContainer extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
    this.pivot.set(32, 64); // 64x64 프레임 하단 중앙

    // 챔버 내부 (380x232) 기준 초기 위치
    this.x = 190;
    this.y = 220;

    this.walkDirection = 1;
    this.walkSpeed = 1.8;
    this.baseScale = 1.5; // 기본 1.5배 (챔버에 최적화된 96x96 크기)
    this.bouncePhase = 0;
    this.velocityY = 0;

    // 점프 이동 상태 변수 (1, 2, 10 프레임 착지 상태)
    this.isGroundedFrame = true;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.animatedSprite = null;
    this.singleSprite = null;
    this.graphicsFallback = null;
    this.hitboxGraphics = null;
    this.showHitbox = false;

    this.loadedAnimations = {};
    this.loadedSingleTextures = {};

    this.eventMode = 'static';
    this.cursor = 'grab';

    this.debugLog = [];

    this.initGraphics();
    this.setupInteractions();
  }

  async initGraphics() {
    this.graphicsFallback = new PIXI.Graphics();
    this.drawFallbackPet(PetState.IDLE);
    this.addChild(this.graphicsFallback);

    await this.loadAllPetAssets();
  }

  drawFallbackPet(state) {
    if (!this.graphicsFallback) return;
    this.graphicsFallback.clear();

    const g = this.graphicsFallback;

    g.ellipse(32, 60, 20, 6);
    g.fill({ color: 0x000000, alpha: 0.18 });

    let bodyColor = 0xff758f;
    if (state === PetState.HAPPY) bodyColor = 0xffb703;
    if (state === PetState.HUNGRY) bodyColor = 0xa2d2ff;
    if (state === PetState.SLEEP) bodyColor = 0xb8c0ff;
    if (state === PetState.EATING) bodyColor = 0x80ed99;

    const squish = Math.sin(this.bouncePhase) * 2;
    g.ellipse(32, 36 + squish / 2, 22 + squish, 20 - squish);
    g.fill({ color: bodyColor });
    g.stroke({ width: 2, color: 0xff4d6d });

    // 볼터치
    g.circle(22, 38, 3);
    g.fill({ color: 0xffb3c1, alpha: 0.8 });
    g.circle(42, 38, 3);
    g.fill({ color: 0xffb3c1, alpha: 0.8 });

    // 눈
    if (state === PetState.SLEEP) {
      g.moveTo(24, 33); g.lineTo(28, 33);
      g.moveTo(36, 33); g.lineTo(40, 33);
      g.stroke({ width: 2, color: 0x2b2d42 });
    } else if (state === PetState.HAPPY || state === PetState.EATING) {
      g.arc(26, 33, 3, Math.PI, 0);
      g.arc(38, 33, 3, Math.PI, 0);
      g.stroke({ width: 2, color: 0x2b2d42 });
    } else {
      g.circle(26, 32, 3);
      g.fill({ color: 0x2b2d42 });
      g.circle(38, 32, 3);
      g.fill({ color: 0x2b2d42 });
      g.circle(25, 31, 1);
      g.fill({ color: 0xffffff });
      g.circle(37, 31, 1);
      g.fill({ color: 0xffffff });
    }
  }

  async loadTextureViaDataUrl(filename) {
    const candidates = [
      path.join(__dirname, '../../../assets/sprites', filename),
      path.join(__dirname, '../../assets/sprites', filename),
      path.join(process.cwd(), 'assets/sprites', filename),
      path.join(process.cwd(), 'resources/assets/sprites', filename),
      path.join(process.cwd(), 'resources/app/assets/sprites', filename)
    ];

    let foundPath = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) return null;

    try {
      const buffer = fs.readFileSync(foundPath);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:image/png;base64,${base64}`;

      const img = new Image();
      img.src = dataUrl;
      if (img.decode) {
        await img.decode();
      } else {
        await new Promise((res) => { img.onload = res; img.onerror = res; });
      }

      const texture = PIXI.Texture.from(img);
      if (texture.source) {
        texture.source.scaleMode = 'nearest';
      }
      const logMsg = `Found ${filename} (${img.width}x${img.height})`;
      console.log(`✅ [AssetLoader] ${logMsg} from: ${foundPath}`);
      this.debugLog.push(logMsg);

      return { texture, width: img.width, height: img.height };
    } catch (err) {
      console.error(`❌ [AssetLoader] Failed to decode '${filename}':`, err);
      return null;
    }
  }

  async loadAllPetAssets() {
    const states = ['idle', 'walk', 'happy', 'hungry', 'eating', 'sleep', 'drag'];
    let loadedCount = 0;

    for (const stateKey of states) {
      const sheetFileName = `pet_${stateKey}_sheet.png`;
      const sheetData = await this.loadTextureViaDataUrl(sheetFileName);

      if (sheetData && sheetData.width > 0 && sheetData.height > 0) {
        const frames = this.sliceTextureToFrames(sheetData.texture, sheetData.width, sheetData.height);
        if (frames.length > 0) {
          this.loadedAnimations[stateKey] = frames;
          console.log(`🎉 [AssetLoader] Animation '${stateKey}' ready with ${frames.length} frames.`);
          loadedCount++;
          continue;
        }
      }

      const singleFileName = `pet_${stateKey}.png`;
      const singleData = await this.loadTextureViaDataUrl(singleFileName);

      if (singleData && singleData.width > 0) {
        this.loadedSingleTextures[stateKey] = singleData.texture;
        console.log(`🎉 [AssetLoader] Single sprite '${stateKey}' ready (${singleData.width}px).`);
        loadedCount++;
      }
    }

    console.log(`[AssetLoader] Total ${loadedCount} state assets prepared.`);
    this.updateSpriteDisplay(PetState.IDLE);
  }

  sliceTextureToFrames(baseTexture, width, height) {
    const frames = [];
    const frameSize = height > 0 ? height : 64;
    const count = Math.max(1, Math.floor(width / frameSize));

    for (let i = 0; i < count; i++) {
      const rect = new PIXI.Rectangle(i * frameSize, 0, frameSize, frameSize);
      const frameTexture = new PIXI.Texture({
        source: baseTexture.source || baseTexture,
        frame: rect
      });
      if (frameTexture.source) {
        frameTexture.source.scaleMode = 'nearest';
      }
      frames.push(frameTexture);
    }

    return frames;
  }

  updateSpriteDisplay(state) {
    const keyMap = {
      [PetState.IDLE]: 'idle',
      [PetState.WALK]: 'walk',
      [PetState.HAPPY]: 'happy',
      [PetState.HUNGRY]: 'hungry',
      [PetState.EATING]: 'eating',
      [PetState.SLEEP]: 'sleep',
      [PetState.DRAGGED]: 'drag'
    };

    const key = keyMap[state] || 'idle';

    if (this.loadedAnimations[key] && this.loadedAnimations[key].length > 0) {
      const frames = this.loadedAnimations[key];

      if (this.singleSprite) this.singleSprite.visible = false;
      if (this.graphicsFallback) this.graphicsFallback.visible = false;

      const firstFrame = frames[0];
      const frameW = firstFrame.width || 64;
      const frameH = firstFrame.height || 64;
      this.pivot.set(frameW / 2, frameH);

      const animSpeedMap = {
        idle: 3 / 60, // 3fps
        walk: 0.25,
        happy: 0.25,
        eating: 0.2
      };
      const speed = animSpeedMap[key] || 0.2;

      if (!this.animatedSprite) {
        this.animatedSprite = new PIXI.AnimatedSprite(frames);
        this.animatedSprite.anchor.set(0.5, 1.0);
        this.animatedSprite.position.set(frameW / 2, frameH);
        this.animatedSprite.animationSpeed = speed;
        this.addChild(this.animatedSprite);
      } else {
        this.animatedSprite.textures = frames;
        this.animatedSprite.position.set(frameW / 2, frameH);
        this.animatedSprite.animationSpeed = speed;
      }

      if (key === 'walk') {
        this.animatedSprite.onFrameChange = (currentFrame) => {
          const frameIdx = currentFrame % frames.length;
          // 0, 1, 9번 프레임은 착지(정지), 나머지는 점프 이동
          if (frameIdx === 0 || frameIdx === 1 || frameIdx === frames.length - 1) {
            this.isGroundedFrame = true;
          } else {
            this.isGroundedFrame = false;
          }
        };
      } else {
        this.animatedSprite.onFrameChange = null;
        this.isGroundedFrame = true;
      }

      this.animatedSprite.visible = true;
      this.animatedSprite.play();
      this.updateHitbox();
      return;
    }

    if (this.loadedSingleTextures[key]) {
      const texture = this.loadedSingleTextures[key];

      if (this.animatedSprite) {
        this.animatedSprite.visible = false;
        this.animatedSprite.stop();
      }
      if (this.graphicsFallback) this.graphicsFallback.visible = false;

      const texW = texture.width || 64;
      const texH = texture.height || 64;
      this.pivot.set(texW / 2, texH);

      if (!this.singleSprite) {
        this.singleSprite = new PIXI.Sprite(texture);
        this.singleSprite.anchor.set(0.5, 1.0);
        this.singleSprite.position.set(texW / 2, texH);
        this.addChild(this.singleSprite);
      } else {
        this.singleSprite.texture = texture;
        this.singleSprite.position.set(texW / 2, texH);
      }

      this.singleSprite.visible = true;
      this.updateHitbox();
      return;
    }

    if (this.animatedSprite) this.animatedSprite.visible = false;
    if (this.singleSprite) this.singleSprite.visible = false;
    if (this.graphicsFallback) {
      this.pivot.set(32, 64);
      this.graphicsFallback.visible = true;
      this.drawFallbackPet(state);
      this.updateHitbox();
    }
  }

  setupInteractions() {
    // 64x64 프레임 중 실제 캐릭터가 위치한 하단 중앙 영역만 정밀하게 히트박스로 지정 (투명 여백 제거)
    this.hitArea = new PIXI.Rectangle(16, 26, 32, 38);

    this.on('pointerdown', (e) => {
      if (e.button === 2) return;
      this.isDragging = true;
      this.cursor = 'grabbing';

      const container = document.getElementById('canvas-container');
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
      const localMouseX = e.clientX - rect.left;
      const localMouseY = e.clientY - rect.top;

      // 마우스가 클릭한 정확한 위치 기준으로 오프셋 계산 (오른쪽 위 쏠림 해결)
      this.dragOffset = {
        x: this.x - localMouseX,
        y: this.y - localMouseY
      };
      if (this.onDragStart) this.onDragStart();
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDragging) {
        const container = document.getElementById('canvas-container');
        const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0 };
        const localMouseX = e.clientX - rect.left;
        const localMouseY = e.clientY - rect.top;

        this.x = localMouseX + this.dragOffset.x;
        this.y = localMouseY + this.dragOffset.y;
        this.clampPosition();
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.cursor = 'grab';
        this.velocityY = 0;
        if (this.onDragEnd) this.onDragEnd();
      }
    });
  }

  clampPosition() {
    const minX = 40;
    const maxX = 340;
    const minY = 80;
    const maxY = 220;

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }

  updateHitbox() {
    if (!this.showHitbox) {
      if (this.hitboxGraphics) this.hitboxGraphics.visible = false;
      return;
    }
    if (!this.hitboxGraphics) {
      this.hitboxGraphics = new PIXI.Graphics();
      this.addChild(this.hitboxGraphics);
    }
    this.hitboxGraphics.clear();
    // 캐릭터 실제 영역에 맞춘 정밀 히트박스
    this.hitboxGraphics.rect(16, 26, 32, 38);
    this.hitboxGraphics.fill({ color: 0x00e5ff, alpha: 0.25 });
    this.hitboxGraphics.stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.95 });
    this.hitboxGraphics.visible = true;
  }

  setHitboxVisible(visible) {
    this.showHitbox = visible;
    this.updateHitbox();
  }

  onStateChange(newState) {
    this.updateSpriteDisplay(newState);
  }

  setBaseScale(scaleVal) {
    this.baseScale = scaleVal;
    this.scale.set(this.walkDirection * this.baseScale, this.baseScale);
    this.updateHitbox();
  }

  update(delta, currentState) {
    this.bouncePhase += delta * 0.1;

    // 챔버 내부 걷기 이동 물리 (좌우 벽 반사)
    if (currentState === PetState.WALK && !this.isDragging) {
      if (!this.isGroundedFrame) {
        this.x += this.walkDirection * this.walkSpeed * delta;
      }

      this.scale.set(this.walkDirection * this.baseScale, this.baseScale);

      const minX = 45;
      const maxX = 335;
      if (this.x <= minX) {
        this.x = minX;
        this.walkDirection = 1;
      } else if (this.x >= maxX) {
        this.x = maxX;
        this.walkDirection = -1;
      }
    } else if (currentState === PetState.IDLE) {
      this.scale.set(1 * this.baseScale, this.baseScale);
    }

    // 챔버 내부 중력 낙하 (드래그 후 놓았을 때 챔버 바닥 y = 220으로 착지)
    const groundY = 220;
    if (!this.isDragging && this.y < groundY) {
      this.velocityY += 0.6 * delta;
      this.y += this.velocityY;
      if (this.y >= groundY) {
        this.y = groundY;
        this.velocityY = 0;
      }
    }

    if (this.graphicsFallback && this.graphicsFallback.visible) {
      this.drawFallbackPet(currentState);
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { PetContainer };
}
