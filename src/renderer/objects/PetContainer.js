import * as PIXI from 'pixi.js';
import { PetState } from '../core/StateMachine.js';

export class PetContainer extends PIXI.Container {
  constructor(app) {
    super();
    this.app = app;
    this.pivot.set(64, 128); // 하단 중앙 Pivot (128x128 기준)
    
    // 위치 기본값 (화면 하단중앙 근처)
    this.x = window.innerWidth / 2;
    this.y = window.innerHeight - 80;

    // 이동 속도 및 물리 변수
    this.walkDirection = 1; // 1: 우측, -1: 좌측
    this.walkSpeed = 1.2;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.bouncePhase = 0;

    // 에셋 및 애니메이션 객체
    this.animatedSprite = null;
    this.singleSprite = null;
    this.graphicsFallback = null;

    // 로드된 텍스처 및 애니메이션 프레임 데이터 저장소
    this.loadedAnimations = {}; // { idle: [Texture1, Texture2, ...], walk: [...] }
    this.loadedSingleTextures = {}; // { idle: Texture, walk: Texture }

    // 마우스 및 인터랙션 설정
    this.eventMode = 'static';
    this.cursor = 'grab';

    // 렌더링 초기화
    this.initGraphics();
    this.setupInteractions();
  }

  async initGraphics() {
    // 1. 디폴트 슬라임/젤리 그래픽 생성 (Fallback)
    this.graphicsFallback = new PIXI.Graphics();
    this.drawFallbackPet(PetState.IDLE);
    this.addChild(this.graphicsFallback);

    // 2. 사용자의 스프라이트시트 및 이미지 에셋 자동 감지 및 로드
    await this.loadAllPetAssets();
  }

  drawFallbackPet(state) {
    if (!this.graphicsFallback) return;
    this.graphicsFallback.clear();

    const g = this.graphicsFallback;

    // 그림자 (Shadow)
    g.ellipse(64, 124, 36, 10);
    g.fill({ color: 0x000000, alpha: 0.18 });

    // 몸통 색상
    let bodyColor = 0xff758f;
    if (state === PetState.HAPPY) bodyColor = 0xffb703;
    if (state === PetState.HUNGRY) bodyColor = 0xa2d2ff;
    if (state === PetState.SLEEP) bodyColor = 0xb8c0ff;
    if (state === PetState.EATING) bodyColor = 0x80ed99;

    // 바운스 효과에 따른 몸통 형상
    const squish = Math.sin(this.bouncePhase) * 4;
    g.ellipse(64, 75 + squish / 2, 42 + squish, 38 - squish);
    g.fill({ color: bodyColor });
    g.stroke({ width: 3, color: 0xff4d6d });

    // 볼터치
    g.circle(44, 78, 6);
    g.fill({ color: 0xffb3c1, alpha: 0.8 });
    g.circle(84, 78, 6);
    g.fill({ color: 0xffb3c1, alpha: 0.8 });

    // 눈 (Eyes)
    if (state === PetState.SLEEP) {
      g.moveTo(48, 70); g.lineTo(56, 70);
      g.moveTo(72, 70); g.lineTo(80, 70);
      g.stroke({ width: 3, color: 0x2b2d42 });
    } else if (state === PetState.HAPPY || state === PetState.EATING) {
      g.arc(52, 70, 5, Math.PI, 0);
      g.arc(76, 70, 5, Math.PI, 0);
      g.stroke({ width: 3, color: 0x2b2d42 });
    } else {
      g.circle(52, 68, 5);
      g.fill({ color: 0x2b2d42 });
      g.circle(76, 68, 5);
      g.fill({ color: 0x2b2d42 });
      g.circle(50, 66, 2);
      g.fill({ color: 0xffffff });
      g.circle(74, 66, 2);
      g.fill({ color: 0xffffff });
    }
  }

  async loadAllPetAssets() {
    const states = ['idle', 'walk', 'happy', 'hungry', 'eating', 'sleep', 'drag'];

    for (const stateKey of states) {
      // 1. 프레임시트 (pet_<state>_sheet.png) 시도
      const sheetPath = `../../assets/sprites/pet_${stateKey}_sheet.png`;
      try {
        const texture = await PIXI.Assets.load(sheetPath);
        if (texture) {
          // 가로 연속 프레임 잘라내기 (4프레임 기준 디폴트 파싱)
          const frames = this.sliceTextureToFrames(texture, 4);
          this.loadedAnimations[stateKey] = frames;
          console.log(`[AssetLoader] Spritesheet loaded: pet_${stateKey}_sheet.png (${frames.length} frames)`);
          continue;
        }
      } catch (e) {
        // sheet 파일 없음
      }

      // 2. 단일 PNG (pet_<state>.png) 시도
      const singlePath = `../../assets/sprites/pet_${stateKey}.png`;
      try {
        const texture = await PIXI.Assets.load(singlePath);
        if (texture) {
          this.loadedSingleTextures[stateKey] = texture;
          console.log(`[AssetLoader] Single sprite loaded: pet_${stateKey}.png`);
        }
      } catch (e) {
        // single 파일 없음
      }
    }

    // 기본 애니메이션/스프라이트 적용 시도
    this.updateSpriteDisplay(PetState.IDLE);
  }

  // 가로 연속 프레임시트를 N등분하여 PIXI.Texture 배열로 반환
  sliceTextureToFrames(baseTexture, defaultFrameCount = 4) {
    const frames = [];
    const width = baseTexture.width;
    const height = baseTexture.height;

    // 프레임 수가 가로/세로 비례로 결정 (가로 폭이 세로보다 크면 가로 분할)
    const frameWidth = height; // 정사각형 프레임 가정
    const count = Math.max(1, Math.floor(width / frameWidth));

    for (let i = 0; i < count; i++) {
      const rect = new PIXI.Rectangle(i * frameWidth, 0, frameWidth, height);
      const frameTexture = new PIXI.Texture({
        source: baseTexture.source,
        frame: rect
      });
      frames.push(frameTexture);
    }

    return frames;
  }

  // 상태에 따른 AnimatedSprite 또는 SingleSprite 업데이트
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

    // 1. 프레임시트 애니메이션이 존재하는 경우 (PIXI.AnimatedSprite 사용)
    if (this.loadedAnimations[key] && this.loadedAnimations[key].length > 0) {
      const frames = this.loadedAnimations[key];

      if (this.singleSprite) {
        this.singleSprite.visible = false;
      }
      if (this.graphicsFallback) {
        this.graphicsFallback.visible = false;
      }

      if (!this.animatedSprite) {
        this.animatedSprite = new PIXI.AnimatedSprite(frames);
        this.animatedSprite.anchor.set(0.5, 1.0);
        this.animatedSprite.position.set(64, 128);
        this.animatedSprite.animationSpeed = 0.12; // 재생 속도
        this.addChild(this.animatedSprite);
      } else {
        this.animatedSprite.textures = frames;
      }

      this.animatedSprite.visible = true;
      this.animatedSprite.play();
      return;
    }

    // 2. 단일 이미지가 존재하는 경우 (PIXI.Sprite 사용)
    if (this.loadedSingleTextures[key]) {
      const texture = this.loadedSingleTextures[key];

      if (this.animatedSprite) {
        this.animatedSprite.visible = false;
        this.animatedSprite.stop();
      }
      if (this.graphicsFallback) {
        this.graphicsFallback.visible = false;
      }

      if (!this.singleSprite) {
        this.singleSprite = new PIXI.Sprite(texture);
        this.singleSprite.anchor.set(0.5, 1.0);
        this.singleSprite.position.set(64, 128);
        this.addChild(this.singleSprite);
      } else {
        this.singleSprite.texture = texture;
      }

      this.singleSprite.visible = true;
      return;
    }

    // 3. 에셋이 없는 경우 Fallback 젤리 그래픽 출력
    if (this.animatedSprite) this.animatedSprite.visible = false;
    if (this.singleSprite) this.singleSprite.visible = false;
    if (this.graphicsFallback) {
      this.graphicsFallback.visible = true;
      this.drawFallbackPet(state);
    }
  }

  setupInteractions() {
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

  update(delta, currentState) {
    this.bouncePhase += delta * 0.1;

    if (currentState === PetState.WALK && !this.isDragging) {
      this.x += this.walkDirection * this.walkSpeed * delta;
      this.scale.x = this.walkDirection;

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
      this.scale.x = 1;
    }

    if (this.graphicsFallback && this.graphicsFallback.visible) {
      this.drawFallbackPet(currentState);
    }

    // 낙하 물리
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
