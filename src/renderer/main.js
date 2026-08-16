const PIXI = require('pixi.js');
const { StateMachine, PetState } = require('./core/StateMachine.js');
const { PetStats } = require('./core/PetStats.js');
const { PetContainer } = require('./objects/PetContainer.js');
const { FoodItem } = require('./objects/FoodItem.js');

(async () => {
  // 1. PixiJS App 초기화
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
    if (offlineSec > 60) {
      const minutes = Math.min(480, Math.floor(offlineSec / 60));
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
  const activeFoods = [];

  // 5. UI 요소 참조
  const dialogEl = document.getElementById('pet-dialog');
  const dialogTextEl = document.getElementById('dialog-text');
  const radialMenuEl = document.getElementById('radial-menu');
  const statusModalEl = document.getElementById('status-modal');
  const settingsModalEl = document.getElementById('settings-modal');

  const barFullness = document.getElementById('bar-fullness');
  const barHappiness = document.getElementById('bar-happiness');
  const barExp = document.getElementById('bar-exp');
  const scaleRange = document.getElementById('scale-range');
  const scaleValueLabel = document.getElementById('scale-value');
  const hitboxToggle = document.getElementById('hitbox-toggle');

  // 저장된 스케일 적용
  const savedScale = petStats.scaleFactor || 1.0;
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

  function showDialog(text, durationMs = 3500) {
    dialogTextEl.innerText = text;
    dialogEl.style.left = `${pet.x - 50}px`;
    dialogEl.style.top = `${pet.y - 140}px`;
    dialogEl.classList.remove('hidden');

    setTimeout(() => {
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

  // 6. 펫 인터랙션 이벤트 바인딩
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

  // 7. 래디얼 메뉴 동작
  document.getElementById('btn-feed').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');

    const food = new FoodItem(app, pet.x + (pet.walkDirection * 60), pet.y);
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
    radialMenuEl.classList.add('hidden');
    petStats.play(25);
    stateMachine.changeState(PetState.HAPPY);
    showDialog('신난다! 🎾 쓰다듬어줘서 고마워!');
  });

  document.getElementById('btn-info').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
    statusModalEl.classList.remove('hidden');
  });

  document.getElementById('btn-settings').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
    settingsModalEl.classList.remove('hidden');
  });

  document.getElementById('btn-close').addEventListener('click', () => {
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-modal-close').addEventListener('click', () => {
    statusModalEl.classList.add('hidden');
  });

  document.getElementById('btn-settings-close').addEventListener('click', () => {
    settingsModalEl.classList.add('hidden');
  });

  // 8. Ghost Mode - 위치 기반 마우스 투과 제어
  // forward:true 상태에서도 mousemove 이벤트는 발생하므로,
  // 매 마우스 이동마다 펫/UI 위에 있는지 직접 좌표 비교
  let _isIgnoring = false;

  function setIgnore(ignore) {
    if (!window.electronAPI) return;
    if (_isIgnoring === ignore) return;  // 불필요한 IPC 호출 방지
    _isIgnoring = ignore;
    if (ignore) {
      window.electronAPI.setIgnoreMouseEvents(true, { forward: true });
    } else {
      window.electronAPI.setIgnoreMouseEvents(false);
    }
  }

  window.addEventListener('mousemove', (e) => {
    if (pet.isDragging) {
      setIgnore(false);
      return;
    }

    const mx = e.clientX;
    const my = e.clientY;

    // 펫 히트박스 체크 (스케일 반영)
    const halfW = 32 * pet.baseScale;
    const h     = 64 * pet.baseScale;
    const overPet = (
      mx >= pet.x - halfW && mx <= pet.x + halfW &&
      my >= pet.y - h     && my <= pet.y
    );

    // UI 요소 위 체크 (HTML elementFromPoint 활용)
    const el = document.elementFromPoint(mx, my);
    const uiRoots = [radialMenuEl, statusModalEl, settingsModalEl, dialogEl];
    const overUI = el && uiRoots.some(root => root && root !== document.body && root.contains(el));

    setIgnore(!(overPet || overUI));
  });

  // contextmenu(우클릭)도 마우스 캡처 해제 후 처리
  window.addEventListener('contextmenu', (e) => {
    setIgnore(false);
  }, true); // capture 단계에서 먼저 처리

  // 9. 주기적 게임 자동 저장 (매 30초)
  setInterval(() => {
    if (window.electronAPI && window.electronAPI.saveData) {
      window.electronAPI.saveData({
        version: '1.0.0',
        petInfo: petStats.getSnapshot()
      });
    }
  }, 30000);

  // 10. 메인 렌더링 및 틱 루프 (PIXI Ticker)
  app.ticker.add((ticker) => {
    const delta = ticker.deltaTime;

    petStats.update(delta);
    stateMachine.update(delta);
    pet.update(delta, stateMachine.currentState);

    for (let i = activeFoods.length - 1; i >= 0; i--) {
      const food = activeFoods[i];
      food.update(delta);
      if (food.isEaten) {
        activeFoods.splice(i, 1);
      }
    }

    if (!dialogEl.classList.contains('hidden')) {
      dialogEl.style.left = `${pet.x - 50}px`;
      dialogEl.style.top = `${pet.y - 140}px`;
    }
  });

  // 로드된 사용자 에셋 상태 표시
  setTimeout(() => {
    if (pet.debugLog.length > 0) {
      showDialog(`🎨 적용 성공: ${pet.debugLog.join(', ')}`, 5000);
    } else {
      showDialog(`⚠️ 에셋 미감지: assets/sprites/ 폴더를 확인해줘!`, 5000);
    }
  }, 1000);
})();
