const PIXI = require('pixi.js');
const { StateMachine, PetState } = require('./core/StateMachine.js');
const { PetStats } = require('./core/PetStats.js');
const { PetContainer } = require('./objects/PetContainer.js');
const { FoodItem } = require('./objects/FoodItem.js');

// 픽셀 아트 선명도 유지 (Nearest-Neighbor Filter)
if (PIXI.TextureSource && PIXI.TextureSource.defaultOptions) {
  PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';
}

(async () => {
  // 1. PixiJS App 초기화 (챔버 뷰포트 내부 380x232)
  const app = new PIXI.Application();
  await app.init({
    width: 380,
    height: 232,
    backgroundAlpha: 0,
    antialias: false,
    roundPixels: true
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

  // 오프라인 방치 보상 계산
  if (saveData && saveData.lastOnlineTimestamp) {
    const offlineSec = Math.floor((Date.now() - saveData.lastOnlineTimestamp) / 1000);
    if (offlineSec > 60) {
      const minutes = Math.min(480, Math.floor(offlineSec / 60));
      const gainedGold = minutes * 2;
      petStats.addGold(gainedGold);
      petStats.decayStats();
      console.log(`[Idle] Offline for ${minutes} mins. Gained ${gainedGold} gold.`);
    }
  }

  // 3. 펫 객체 및 상태 머신 생성
  const pet = new PetContainer(app);
  app.stage.addChild(pet);

  const stateMachine = new StateMachine(pet);
  const activeFoods = [];

  // 4. UI 요소 참조
  const headerEl = document.getElementById('machine-header');
  const dialogEl = document.getElementById('pet-dialog');
  const dialogTextEl = document.getElementById('dialog-text');
  const statusModalEl = document.getElementById('status-modal');
  const settingsModalEl = document.getElementById('settings-modal');

  const barFullness = document.getElementById('bar-fullness');
  const barHappiness = document.getElementById('bar-happiness');
  const barExp = document.getElementById('bar-exp');
  const scaleRange = document.getElementById('scale-range');
  const scaleValueLabel = document.getElementById('scale-value');
  const hitboxToggle = document.getElementById('hitbox-toggle');

  // 저장된 스케일 적용 (기본 1.5 = 150%)
  const savedScale = petStats.scaleFactor || 1.5;
  scaleRange.value = Math.round(savedScale * 100);
  scaleValueLabel.textContent = `${Math.round(savedScale * 100)}%`;
  pet.setBaseScale(savedScale);

  scaleRange.addEventListener('input', () => {
    const pct = parseInt(scaleRange.value, 10);
    scaleValueLabel.textContent = `${pct}%`;
    const scaleVal = pct / 100;
    pet.setBaseScale(scaleVal);
    petStats.setScaleFactor(scaleVal);
  });

  hitboxToggle.addEventListener('change', () => {
    pet.setHitboxVisible(hitboxToggle.checked);
  });

  let dialogTimer = null;
  function showDialog(text, durationMs = 3500) {
    if (dialogTimer) clearTimeout(dialogTimer);
    dialogTextEl.innerText = text;
    dialogEl.classList.remove('hidden');

    dialogTimer = setTimeout(() => {
      dialogEl.classList.add('hidden');
    }, durationMs);
  }

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

    if (snapshot.fullness <= 20 && stateMachine.currentState === PetState.IDLE) {
      stateMachine.changeState(PetState.HUNGRY);
      showDialog('꼬르륵... 배가 너무 고파요 😢');
    }
  };

  petStats.onLevelUp = (newLevel) => {
    stateMachine.changeState(PetState.HAPPY);
    showDialog(`🎉 우와! 레벨업! (Lv.${newLevel})`);
  };

  updateHUD(petStats.getSnapshot());

  // 5. 기계 본체 윈도우 드래그 이동 (상단 헤더 바를 잡고 이동)
  let isWindowDragging = false;
  let dragOffsetScreenX = 0;
  let dragOffsetScreenY = 0;

  headerEl.addEventListener('mousedown', (e) => {
    if (e.target.closest('.header-actions')) return;
    if (e.button !== 0) return;

    isWindowDragging = true;
    dragOffsetScreenX = e.clientX;
    dragOffsetScreenY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (isWindowDragging) {
      const newWinX = Math.round(e.screenX - dragOffsetScreenX);
      const newWinY = Math.round(e.screenY - dragOffsetScreenY);

      if (window.electronAPI && window.electronAPI.setWindowPosition) {
        window.electronAPI.setWindowPosition(newWinX, newWinY);
      }
    }
  });

  window.addEventListener('mouseup', () => {
    isWindowDragging = false;
  });

  // 6. 펫 내부 인터랙션 이벤트 바인딩
  pet.onDragStart = () => {
    stateMachine.changeState(PetState.DRAGGED);
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
    showDialog('우와! 챔버 안에서 둥실둥실~ 😮');
  };

  pet.onDragEnd = () => {
    stateMachine.changeState(PetState.IDLE);
    showDialog('후아~ 챔버 바닥 안착! 🐾');
  };

  // 7. 하단 기계 조작 패널 (Control Deck) 동작
  document.getElementById('btn-feed').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');

    const food = new FoodItem(app, pet.x + (pet.walkDirection * 35), 220);
    app.stage.addChild(food);
    activeFoods.push(food);

    stateMachine.changeState(PetState.EATING);
    showDialog('냠냠! 🍎 맛있는 사과다!');

    setTimeout(() => {
      food.consume();
      petStats.feed(30);
    }, 1500);
  });

  document.getElementById('btn-play').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
    petStats.play(25);
    stateMachine.changeState(PetState.HAPPY);
    showDialog('신난다! 🎾 기계 너머로 교감 중!');
  });

  document.getElementById('btn-info').addEventListener('click', () => {
    settingsModalEl.classList.add('hidden');
    statusModalEl.classList.toggle('hidden');
  });

  document.getElementById('btn-settings').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.toggle('hidden');
  });

  document.getElementById('btn-modal-close').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
  });

  document.getElementById('btn-settings-close').addEventListener('click', () => {
    settingsModalEl.classList.add('hidden');
  });

  // 헤더 닫기/숨기기 버튼
  document.getElementById('btn-quit-app').addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.quitApp) {
      window.electronAPI.quitApp();
    }
  });

  document.getElementById('btn-minimize-app').addEventListener('click', () => {
    showDialog('트레이 아이콘에서 언제든 다시 열 수 있어! 🐾', 2000);
    setTimeout(() => {
      if (window.electronAPI && window.electronAPI.setWindowPosition) {
        // 창 숨기기 또는 닫기
      }
    }, 1000);
  });

  // 8. 주기적 게임 자동 저장 (매 30초)
  setInterval(() => {
    if (window.electronAPI && window.electronAPI.saveData) {
      window.electronAPI.saveData({
        version: '1.0.0',
        petInfo: petStats.getSnapshot()
      });
    }
  }, 30000);

  // 9. 메인 렌더링 및 틱 루프 (PIXI Ticker)
  app.ticker.add((ticker) => {
    const delta = ticker.deltaTime;

    petStats.update(delta);
    stateMachine.update(delta);
    pet.update(delta, stateMachine.currentState);

    // 활성화된 음식 아이템 업데이트
    for (let i = activeFoods.length - 1; i >= 0; i--) {
      const food = activeFoods[i];
      food.update(delta);
      if (food.isEaten) {
        activeFoods.splice(i, 1);
      }
    }
  });

  // 로드된 사용자 에셋 상태 표시
  setTimeout(() => {
    if (pet.debugLog.length > 0) {
      showDialog(`🎨 챔버 가동 완료: ${pet.debugLog.join(', ')}`, 4000);
    } else {
      showDialog(`사이버 펫 챔버 유닛 가동 완료 🐾`, 3500);
    }
  }, 600);
})();
