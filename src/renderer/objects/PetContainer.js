const PIXI = require('pixi.js');
const path = require('path');
const fs = require('fs');
const { PetState } = require('../core/StateMachine.js');

class PetContainer extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
    this.pivot.set(32, 64);
    
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 80;

    this.walkDirection = 1;
    this.walkSpeed = 2.4; // 공중에 떠 있을 때 신나게 앞으로 튀어나가는 속도
    this.baseScale = 1.0;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.bouncePhase = 0;

    // 점프 이동 제어 변수 (1, 2, 10 프레임 착지 상태 여부)
    this.isGroundedFrame = true;

    this.animatedSprite = null;
    this.singleSprite = null;
    this.graphicsFallback = null;

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
      const logMsg = `Found ${filename} (${img.width}x${img.height})`;
      console.log(`✅ [AssetLoader] ${logMsg} from: ${foundPath}`);
      this.debugLog.push(logMsg);

      return { texture, width: img.width, height: img.height, image: img };
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

    // 1. 프레임시트 애니메이션 적용
    if (this.loadedAnimations[key] && this.loadedAnimations[key].length > 0) {
      const frames = this.loadedAnimations[key];

      if (this.singleSprite) this.singleSprite.visible = false;
      if (this.graphicsFallback) this.graphicsFallback.visible = false;

      const firstFrame = frames[0];
      const frameW = firstFrame.width || 64;
      const frameH = firstFrame.height || 64;
      this.pivot.set(frameW / 2, frameH);

      // 애니메이션 프레임 속도 설정 (idle: 3fps, walk: 0.25)
      const animSpeedMap = {
        idle: 3 / 60, // 약 0.05 (3fps)
        walk: 0.25,   // 부드러운 점프 모션 재생
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

      // walk 애니메이션 프레임별 점프/착지 감지
      if (key === 'walk') {
        this.animatedSprite.onFrameChange = (currentFrame) => {
          // 10개 프레임 기준 (0-indexed: 0, 1, 9번은 지면 착지 상태 -> 이동 멈춤)
          // 2 ~ 8번 프레임(3, 4, 5, 6, 7, 8, 9번 프레임)은 공중 점프 상태 -> 이동!
          const frameIdx = currentFrame % frames.length;
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
      return;
    }

    // 2. 단일 이미지 적용
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
      return;
    }

    // 3. 대체 젤리 슬라임 렌더링
    if (this.animatedSprite) this.animatedSprite.visible = false;
    if (this.singleSprite) this.singleSprite.visible = false;
    if (this.graphicsFallback) {
      this.pivot.set(32, 64);
      this.graphicsFallback.visible = true;
      this.drawFallbackPet(state);
    }
  }

  setupInteractions() {
    this.hitArea = new PIXI.Rectangle(0, 0, 64, 64);

    this.on('pointerover', () => {
      if (this.onPointerOver) this.onPointerOver();
    });

    this.on('pointerout', () => {
      if (!this.isDragging && this.onPointerOut) this.onPointerOut();
    });

    this.on('pointerdown', (e) => {
      this.isDragging = true;
      this.cursor = 'grabbing';
      this.dragOffset = {
        x: this.x - e.global.x,
        y: this.y - e.global.y
      };

      if (this.onDragStart) this.onDragStart();
    });

    window.addEventListener('pointermove', (e) => {
      if (this.isDragging) {
        this.x = e.clientX + this.dragOffset.x;
        this.y = e.clientY + this.dragOffset.y;
        this.clampPosition();
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.cursor = 'grab';
        if (this.onDragEnd) this.onDragEnd();
      }
    });

    this.on('rightdown', (e) => {
      e.stopPropagation();
      if (this.onRightClick) this.onRightClick(e.global.x, e.global.y);
    });
  }

  onStateChange(newState) {
    this.updateSpriteDisplay(newState);
  }

  setBaseScale(scaleVal) {
    this.baseScale = scaleVal;
    this.scale.set(this.walkDirection * this.baseScale, this.baseScale);
  }

  update(delta, currentState) {
    this.bouncePhase += delta * 0.1;

    if (currentState === PetState.WALK && !this.isDragging) {
      if (!this.isGroundedFrame) {
        this.x += this.walkDirection * this.walkSpeed * delta;
      }
      
      this.scale.set(this.walkDirection * this.baseScale, this.baseScale);

      const minX = 64;
      const maxX = window.innerWidth - 64;
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

    if (this.graphicsFallback && this.graphicsFallback.visible) {
      this.drawFallbackPet(currentState);
    }

    if (!this.isDragging) {
      const groundY = window.innerHeight - 30;
      if (this.y < groundY) {
        this.y += 4 * delta;
        if (this.y > groundY) this.y = groundY;
      }
    }
  }

  clampPosition() {
    const minX = 64;
    const maxX = window.innerWidth - 64;
    const minY = 128;
    const maxY = window.innerHeight - 30;

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.y = Math.max(minY, Math.min(maxY, this.y));
  }
}

if (typeof module !== 'undefined') {
  module.exports = { PetContainer };
}
