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

    // 이동 속도 및 상태 변수
    this.walkDirection = 1; // 1: 우측, -1: 좌측
    this.walkSpeed = 1.2;
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.bouncePhase = 0;

    // 이미지 에셋 캐시 및 스프라이트
    this.sprite = null;
    this.graphicsFallback = null;
    this.loadedTextures = {};

    // 펫 바운드 및 인터랙션 설정
    this.eventMode = 'static';
    this.cursor = 'grab';

    // 메인 그래픽 렌더링 초기화
    this.initGraphics();
    this.setupInteractions();
  }

  // 에셋 로드 및 Fallback 그래픽 생성
  async initGraphics() {
    // 1. 디폴트 귀여운 Slime / Jelly 그래픽 생성 (Fallback)
    this.graphicsFallback = new PIXI.Graphics();
    this.drawFallbackPet(PetState.IDLE);
    this.addChild(this.graphicsFallback);

    // 2. 사용자가 assets/sprites/ 에 이미지를 가져다 놓았는지 확인 후 로드 시도
    await this.tryLoadUserSprites();
  }

  drawFallbackPet(state) {
    if (!this.graphicsFallback) return;
    this.graphicsFallback.clear();

    const g = this.graphicsFallback;

    // 그림자 (Shadow)
    g.ellipse(64, 124, 36, 10);
    g.fill({ color: 0x000000, alpha: 0.18 });

    // 몸통 (Cute Jelly Body)
    let bodyColor = 0xff758f; // 분홍 젤리
    if (state === PetState.HAPPY) bodyColor = 0xffb703;
    if (state === PetState.HUNGRY) bodyColor = 0xa2d2ff;
    if (state === PetState.SLEEP) bodyColor = 0xb8c0ff;

    // 바운스 효과에 따른 몸통 모양
    const squish = Math.sin(this.bouncePhase) * 4;
    g.ellipse(64, 75 + squish / 2, 42 + squish, 38 - squish);
    g.fill({ color: bodyColor });
    g.stroke({ width: 3, color: 0xff4d6d });

    // 볼터치 (Cheeks)
    g.circle(44, 78, 6);
    g.fill({ color: 0xffb3c1, alpha: 0.8 });
    g.circle(84, 78, 6);
    g.fill({ color: 0xffb3c1, alpha: 0.8 });

    // 눈 (Eyes)
    if (state === PetState.SLEEP) {
      // 감은 눈 (Sleeping)
      g.moveTo(48, 70); g.lineTo(56, 70);
      g.moveTo(72, 70); g.lineTo(80, 70);
      g.stroke({ width: 3, color: 0x2b2d42 });
    } else if (state === PetState.HAPPY) {
      // 웃는 눈 (Happy ^ ^)
      g.arc(52, 70, 5, Math.PI, 0);
      g.arc(76, 70, 5, Math.PI, 0);
      g.stroke({ width: 3, color: 0x2b2d42 });
    } else {
      // 일반 동그란 눈 (Big Cute Eyes)
      g.circle(52, 68, 5);
      g.fill({ color: 0x2b2d42 });
      g.circle(76, 68, 5);
      g.fill({ color: 0x2b2d42 });
      // 반짝이는 눈동자 하이라이트
      g.circle(50, 66, 2);
      g.fill({ color: 0xffffff });
      g.circle(74, 66, 2);
      g.fill({ color: 0xffffff });
    }
  }

  async tryLoadUserSprites() {
    const spriteNames = ['idle', 'walk', 'happy', 'hungry', 'eating', 'sleep', 'drag'];
    
    for (const name of spriteNames) {
      const path = `../../assets/sprites/pet_${name}.png`;
      try {
        const texture = await PIXI.Assets.load(path);
        if (texture) {
          this.loadedTextures[name] = texture;
          console.log(`[AssetLoader] User sprite loaded: pet_${name}.png`);
        }
      } catch (err) {
        // 이미지가 아직 생성되지 않은 경우 무시하고 Fallback 렌더링 유지
      }
    }

    // 만약 idle 에셋이 존재하면 Sprite로 교체
    if (this.loadedTextures['idle']) {
      this.useTextureSprite('idle');
    }
  }

  useTextureSprite(textureKey) {
    const texture = this.loadedTextures[textureKey] || this.loadedTextures['idle'];
    if (!texture) return;

    if (!this.sprite) {
      this.sprite = new PIXI.Sprite(texture);
      this.sprite.anchor.set(0.5, 1.0);
      this.sprite.position.set(64, 128);
      this.addChild(this.sprite);
    } else {
      this.sprite.texture = texture;
    }

    if (this.graphicsFallback) {
      this.graphicsFallback.visible = false;
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
        
        // 화면 경계 체크
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

    // 우클릭 시 래디얼 메뉴
    this.on('rightdown', (e) => {
      e.stopPropagation();
      if (this.onRightClick) this.onRightClick(e.global.x, e.global.y);
    });
  }

  onStateChange(newState) {
    const keyMap = {
      [PetState.IDLE]: 'idle',
      [PetState.WALK]: 'walk',
      [PetState.HAPPY]: 'happy',
      [PetState.HUNGRY]: 'hungry',
      [PetState.EATING]: 'eating',
      [PetState.SLEEP]: 'sleep',
      [PetState.DRAGGED]: 'drag'
    };

    const key = keyMap[newState] || 'idle';
    if (this.loadedTextures[key]) {
      this.useTextureSprite(key);
    } else {
      this.drawFallbackPet(newState);
    }
  }

  update(delta, currentState) {
    this.bouncePhase += delta * 0.1;

    if (currentState === PetState.WALK && !this.isDragging) {
      this.x += this.walkDirection * this.walkSpeed * delta;
      
      // 좌우 반전 (Flip horizontal)
      this.scale.x = this.walkDirection;

      // 화면 좌우 벽 부딪힘 처리
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

    // 젤리 바운스 애니메이션
    if (!this.sprite && this.graphicsFallback) {
      this.drawFallbackPet(currentState);
    }

    // 낙하 물리 (바닥으로 떨어짐)
    if (!this.isDragging) {
      const groundY = window.innerHeight - 30;
      if (this.y < groundY) {
        this.y += 4 * delta; // 중력
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
