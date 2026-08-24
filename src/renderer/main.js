const PIXI = require('pixi.js');
const { StateMachine, PetState } = require('./core/StateMachine.js');
const { PetStats } = require('./core/PetStats.js');
const { PetContainer } = require('./objects/PetContainer.js');
const { FoodItem } = require('./objects/FoodItem.js');

// 픽셀 아트 선명도 유지 (Nearest Filtering)
if (PIXI.TextureSource && PIXI.TextureSource.defaultOptions) {
  PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';
}

(async () => {
  const WIN_W = 320;
  const WIN_H = 300;

  // 1. PixiJS App 초기화 (320x300 컴팩트 윈도우, 픽셀 아트용 antialias: false)
  const app = new PIXI.Application();
  await app.init({
    width: WIN_W,
    height: WIN_H,
    backgroundAlpha: 0,
    antialias: false,
    roundPixels: true
  });

  const containerEl = document.getElementById('canvas-container');
  containerEl.appendChild(app.canvas);

  // 2. 화면 작업 영역(WorkArea) 및 초기 위치 계산
  let workArea = null;
  if (window.electronAPI && window.electronAPI.getWorkArea) {
    workArea = await window.electronAPI.getWorkArea();
  }

  const screenW = workArea ? workArea.width : window.screen.availWidth;
  const screenH = workArea ? workArea.height : window.screen.availHeight;
  const workX = workArea ? workArea.x : 0;
  const workY = workArea ? workArea.y : 0;

  // 기본 바닥 높이 (작업표시줄 위)
  const defaultGroundY = workY + screenH - WIN_H;
  let groundY = defaultGroundY;
  let currentWinX = workX + Math.round((screenW - WIN_W) / 2);
  let currentWinY = defaultGroundY;
  let velocityY = 0;

  let isDragging = false;
  let dragMouseOffsetX = 160;
  let dragMouseOffsetY = 240;

  // 3. 세이브 데이터 로드 및 PetStats 초기화
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

  // 저장된 스케일 적용 (기본 2.0 = 200%)
  const savedScale = petStats.scaleFactor || 2.0;
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

  // 6. 펫 마우스 드래그 이동 (어디든 부드럽게 끌어서 이동)
  window.addEventListener('mousedown', (e) => {
    // 좌클릭만 드래그 시작 (모달 및 메뉴 버튼 클릭 시는 제외)
    if (e.button !== 0) return;
    if (e.target.closest('#radial-menu, #status-modal, #settings-modal')) return;

    isDragging = true;
    dragMouseOffsetX = e.clientX;
    dragMouseOffsetY = e.clientY;

    stateMachine.changeState(PetState.DRAGGED);
    radialMenuEl.classList.add('hidden');
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
    showDialog('우와! 날 어디로 데려가는 거야? 😮');
  });

  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      currentWinX = Math.round(e.screenX - dragMouseOffsetX);
      currentWinY = Math.round(e.screenY - dragMouseOffsetY);

      if (window.electronAPI && window.electronAPI.setWindowPosition) {
        window.electronAPI.setWindowPosition(currentWinX, currentWinY);
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (isDragging && e.button === 0) {
      isDragging = false;
      velocityY = 0;
      stateMachine.changeState(PetState.IDLE);
      showDialog('후아~ 안착! 🐾');
    }
  });

  // 우클릭 메뉴
  pet.onRightClick = () => {
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
    radialMenuEl.classList.toggle('hidden');
  };

  // 7. 래디얼 메뉴 동작
  document.getElementById('btn-feed').addEventListener('click', (e) => {
    e.stopPropagation();
    radialMenuEl.classList.add('hidden');

    const food = new FoodItem(app, pet.x + (pet.walkDirection * 40), pet.y);
    app.stage.addChild(food);
    activeFoods.push(food);

    stateMachine.changeState(PetState.EATING);
    showDialog('냠냠! 🍎 맛있는 사과다!');

    setTimeout(() => {
      food.consume();
      petStats.feed(30);
    }, 1500);
  });

  document.getElementById('btn-play').addEventListener('click', (e) => {
    e.stopPropagation();
    radialMenuEl.classList.add('hidden');
    petStats.play(25);
    stateMachine.changeState(PetState.HAPPY);
    showDialog('신난다! 🎾 쓰다듬어줘서 고마워!');
  });

  document.getElementById('btn-info').addEventListener('click', (e) => {
    e.stopPropagation();
    radialMenuEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
    statusModalEl.classList.remove('hidden');
  });

  document.getElementById('btn-settings').addEventListener('click', (e) => {
    e.stopPropagation();
    radialMenuEl.classList.add('hidden');
    statusModalEl.classList.add('hidden');
    settingsModalEl.classList.remove('hidden');
  });

  document.getElementById('btn-close').addEventListener('click', (e) => {
    e.stopPropagation();
    radialMenuEl.classList.add('hidden');
  });

  document.getElementById('btn-modal-close').addEventListener('click', (e) => {
    e.stopPropagation();
    statusModalEl.classList.add('hidden');
  });

  document.getElementById('btn-settings-close').addEventListener('click', (e) => {
    e.stopPropagation();
    settingsModalEl.classList.add('hidden');
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

    // 공중 낙하 중력 물리 (화면 아래 바닥으로 자연스럽게 착지)
    if (!isDragging && currentWinY < groundY) {
      velocityY += 0.8 * delta;
      currentWinY += velocityY;

      if (currentWinY >= groundY) {
        currentWinY = groundY;
        velocityY = 0;
      }

      if (window.electronAPI && window.electronAPI.setWindowPosition) {
        window.electronAPI.setWindowPosition(currentWinX, currentWinY);
      }
    }

    // 걷기 점프 이동 물리 (바닥에 있을 때 & 공중 프레임일 때만 전진)
    if (!isDragging && currentWinY >= groundY && stateMachine.currentState === PetState.WALK) {
      if (!pet.isGroundedFrame) {
        currentWinX += pet.walkDirection * pet.walkSpeed * delta;

        const minX = workX;
        const maxX = workX + screenW - WIN_W;

        if (currentWinX <= minX) {
          currentWinX = minX;
          pet.walkDirection = 1;
        } else if (currentWinX >= maxX) {
          currentWinX = maxX;
          pet.walkDirection = -1;
        }

        if (window.electronAPI && window.electronAPI.setWindowPosition) {
          window.electronAPI.setWindowPosition(currentWinX, currentWinY);
        }
      }
    }

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
      showDialog(`🎨 적용 성공: ${pet.debugLog.join(', ')}`, 4000);
    } else {
      showDialog(`안녕! 바탕화면 다마고치야 🐾`, 3500);
    }
  }, 800);
})();
