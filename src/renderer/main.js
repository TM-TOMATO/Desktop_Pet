import * as PIXI from 'pixi.js';
import { StateMachine, PetState } from './core/StateMachine.js';
import { PetStats } from './core/PetStats.js';
import { PetContainer } from './objects/PetContainer.js';
import { FoodItem } from './objects/FoodItem.js';

(async () => {
  // 1. PixiJS App 초기화 (투명 캔버스)
  const app = new PIXI.Application();
  await app.init({
    resizeTo: window,
    backgroundAlpha: 0,
    antialias: true
  });

  const containerEl = document.getElementById('canvas-container');
  containerEl.appendChild(app.canvas);

  // 2. 세이브 데이터 로드 및 PetStats 초기화
  let saveData = null;
  if (window.electronAPI && window.electronAPI.loadData) {
    saveData = await window.electronAPI.loadData();
    console.log('[Renderer] Loaded save data:', saveData);
  }

  const petStats = new PetStats(saveData ? saveData.petInfo : {});
  
  // 3. 오프라인 시간 경과 계산 (방치 보상)
  if (saveData && saveData.lastOnlineTimestamp) {
    const offlineSec = Math.floor((Date.now() - saveData.lastOnlineTimestamp) / 1000);
    if (offlineSec > 60) { // 1분 이상 집을 비운 경우
      const minutes = Math.min(480, Math.floor(offlineSec / 60)); // 최대 8시간
      const gainedGold = minutes * 2;
      petStats.addGold(gainedGold);
      petStats.decayStats();
      console.log(`[Idle] Offline for ${minutes} mins. Gained ${gainedGold} gold.`);
    }
  }

  // 4. 펫 객체 및 상태 머신 생성
  const pet = new PetContainer(app);
  app.stage.addChild(pet);

  const stateMachine = new StateMachine(pet);

  // 활성화된 음식 아이템 리스트
  const activeFoods = [];

  // 5. UI 요소 참조
  const dialogEl = document.getElementById('pet-dialog');
  const dialogTextEl = document.getElementById('dialog-text');
  const radialMenuEl = document.getElementById('radial-menu');
  const statusModalEl = document.getElementById('status-modal');

  const barFullness = document.getElementById('bar-fullness');
  const barHappiness = document.getElementById('bar-happiness');
  const barExp = document.getElementById('bar-exp');

  // 말풍선 대사 출력
  function showDialog(text, durationMs = 3500) {
    dialogTextEl.innerText = text;
    dialogEl.style.left = `${pet.x - 50}px`;
    dialogEl.style.top = `${pet.y - 140}px`;
    dialogEl.classList.remove('hidden');

    setTimeout(() => {
      dialogEl.classList.add('hidden');
    }, durationMs);
  }

  // 6. HUD UI 동기화
  function updateHUD(snapshot) {
    if (barFullness) barFullness.style.width = `${snapshot.fullness}%`;
    if (barHappiness) barHappiness.style.width = `${snapshot.happiness}%`;
    if (barExp) {
      const expPercent = Math.min(100, Math.round((snapshot.exp / snapshot.maxExp) * 100));
      barExp.style.width = `${expPercent}%`;
    }
  }

  petStats.onStatChange = (snapshot) => {
    updateHUD(snapshot);

    // 허기 수치가 20 이하인 경우 HUNGRY 상태로 변경 유도
    if (snapshot.fullness <= 20 && stateMachine.currentState === PetState.IDLE) {
      stateMachine.changeState(PetState.HUNGRY);
      showDialog('꼬르륵... 배가 너무 고파요 😢');
    }
  };

  petStats.onLevelUp = (newLevel) => {
    stateMachine.changeState(PetState.HAPPY);
    showDialog(`🎉 우와! 레벨업! (Lv.${newLevel})`);
  };

  // 초기 HUD 설정
  updateHUD(petStats.getSnapshot());

  // 7. 펫 인터랙션 이벤트 바인딩
  pet.onDragStart = () => {
    stateMachine.changeState(PetState.DRAGGED);
    radialMenuEl.classList.add('hidden');
    showDialog('우와! 날 어디로 데려가는 거야? 😮');
  };

  pet.onDragEnd = () => {
    stateMachine.changeState(PetState.IDLE);
    showDialog('후아~ 안착! 🐾');
  };

  pet.onRightClick = (x, y) => {
    radialMenuEl.style.left = `${x - 60}px`;
    radialMenuEl.style.top = `${y - 60}px`;
    radialMenuEl.classList.remove('hidden');
  };

  // 8. 래디얼 메뉴 동작
  document.getElementById('btn-feed').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');

    // 음식 아이템 떨구기
    const food = new FoodItem(app, pet.x + (pet.walkDirection * 60), pet.y);
    app.stage.addChild(food);
    activeFoods.push(food);

    stateMachine.changeState(PetState.EATING);
    showDialog('냠냠! 🍎 맛있는 사과다!');

    // 1.5초 후 음식 소비 및 수치 증가
    setTimeout(() => {
      food.consume();
      petStats.feed(30);
    }, 1500);
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
    petStats.play(25);
    stateMachine.changeState(PetState.HAPPY);
    showDialog('신난다! 🎾 쓰다듬어줘서 고마워!');
  });

  document.getElementById('btn-info').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
    statusModalEl.classList.remove('hidden');
  });

  document.getElementById('btn-close').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-modal-close').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
  });

  // 9. Ghost Mode (클릭 투과 연동 - 이벤트 드라이븐 방식)
  let isCursorOverPet = false;
  let isCursorOverUI = false;

  function updateMouseIgnoreState() {
    if (!window.electronAPI) return;

    if (isCursorOverPet || isCursorOverUI || pet.isDragging) {
      window.electronAPI.setIgnoreMouseEvents(false);
    } else {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    }
  }

  // 펫 마우스 호버 이벤트
  pet.onPointerOver = () => {
    isCursorOverPet = true;
    updateMouseIgnoreState();
  };

  pet.onPointerOut = () => {
    isCursorOverPet = false;
    updateMouseIgnoreState();
  };

  // UI 요소 마우스 호버 감지 (말풍선, 메뉴, 모달)
  const interactiveUIElements = [dialogEl, radialMenuEl, statusModalEl];
  interactiveUIElements.forEach((el) => {
    if (!el) return;
    el.addEventListener('mouseenter', () => {
      isCursorOverUI = true;
      updateMouseIgnoreState();
    });
    el.addEventListener('mouseleave', () => {
      isCursorOverUI = false;
      updateMouseIgnoreState();
    });
  });

  // 초기 상태: 빈 공간 클릭 통과하도록 즉시 실행
  updateMouseIgnoreState();

  // 10. 주기적 게임 자동 저장 (매 30초)
  setInterval(() => {
    if (window.electronAPI && window.electronAPI.saveData) {
      window.electronAPI.saveData({
        version: '1.0.0',
        petInfo: petStats.getSnapshot()
      });
    }
  }, 30000);

  // 11. 메인 렌더링 및 틱 루프 (PIXI Ticker)
  app.ticker.add((ticker) => {
    const delta = ticker.deltaTime;

    // 수치 틱 연산
    petStats.update(delta);

    // FSM 상태 업데이트
    stateMachine.update(delta);

    // 펫 애니메이션 및 물리 업데이트
    pet.update(delta, stateMachine.currentState);

    // activeFoods 물리 업데이트
    for (let i = activeFoods.length - 1; i >= 0; i--) {
      const food = activeFoods[i];
      food.update(delta);
      if (food.isEaten) {
        activeFoods.splice(i, 1);
      }
    }

    // 말풍선 위치 추적
    if (!dialogEl.classList.contains('hidden')) {
      dialogEl.style.left = `${pet.x - 50}px`;
      dialogEl.style.top = `${pet.y - 140}px`;
    }
  });

  showDialog(`돌아온 걸 환영해! ${petStats.name}가 기다리고 있었어 🌟`);
})();
