const PIXI = require('pixi.js');
const path = require('path');
const fs = require('fs');
const { StateMachine, PetState } = require('./core/StateMachine.js');
const { PetStats } = require('./core/PetStats.js');
const { PetContainer } = require('./objects/PetContainer.js');
const { FoodItem } = require('./objects/FoodItem.js');

// 픽셀 아트 선명도 유지 (Nearest-Neighbor Filter)
if (PIXI.TextureSource && PIXI.TextureSource.defaultOptions) {
  PIXI.TextureSource.defaultOptions.scaleMode = 'nearest';
}

(async () => {
  // 1. PixiJS App 초기화 (레트로 LCD 스크린 360x220)
  const app = new PIXI.Application();
  await app.init({
    width: 360,
    height: 220,
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

  // 3. 펫 객체 및 상태 머신 생성
  const pet = new PetContainer(app);
  app.stage.addChild(pet);

  const stateMachine = new StateMachine(pet);
  const activeFoods = [];

  // 4. UI 및 OSD 메뉴 요소 참조
  const appScalerEl = document.getElementById('app-scaler');
  const screenGlassEl = document.getElementById('screen-glass');
  const displayClicksEl = document.getElementById('display-clicks');
  const displayGoldEl = document.getElementById('display-gold');
  const coinPopupLayer = document.getElementById('coin-popup-layer');

  const osdMenuEl = document.getElementById('osd-menu');
  const osdFeedMenuEl = document.getElementById('osd-feed-menu');
  const feedItemListEl = document.getElementById('feed-item-list');
  const statusModalEl = document.getElementById('status-modal');
  const shopModalEl = document.getElementById('shop-modal');
  const settingsModalEl = document.getElementById('settings-modal');

  const statLevelEl = document.getElementById('stat-level');
  const statClicksEl = document.getElementById('stat-clicks');
  const statGoldEl = document.getElementById('stat-gold');
  const shopGoldDisplayEl = document.getElementById('shop-gold-display');

  const barFullness = document.getElementById('bar-fullness');
  const barHappiness = document.getElementById('bar-happiness');
  const scaleRange = document.getElementById('scale-range');
  const scaleValueLabel = document.getElementById('scale-value');
  const hitboxToggle = document.getElementById('hitbox-toggle');

  // 🎮 게임기 전체 크기 조작 함수 (Scale Console Unit)
  const BASE_CONSOLE_W = 440;
  const BASE_CONSOLE_H = 490;

  function setConsoleScale(scaleVal) {
    scaleVal = Math.max(0.7, Math.min(1.6, scaleVal));
    if (appScalerEl) {
      appScalerEl.style.transform = `scale(${scaleVal})`;
    }
    const newW = Math.round(BASE_CONSOLE_W * scaleVal);
    const newH = Math.round(BASE_CONSOLE_H * scaleVal);
    if (window.electronAPI && window.electronAPI.setWindowSize) {
      window.electronAPI.setWindowSize(newW, newH);
    }
    petStats.consoleScale = scaleVal;
  }

  // 저장된 게임기 전체 크기 적용
  const savedConsoleScale = (saveData && saveData.petInfo && saveData.petInfo.consoleScale) || 1.0;
  scaleRange.value = Math.round(savedConsoleScale * 100);
  scaleValueLabel.textContent = `${Math.round(savedConsoleScale * 100)}%`;
  setConsoleScale(savedConsoleScale);

  scaleRange.addEventListener('input', () => {
    const pct = parseInt(scaleRange.value, 10);
    scaleValueLabel.textContent = `${pct}%`;
    setConsoleScale(pct / 100);
  });

  hitboxToggle.addEventListener('change', () => {
    pet.setHitboxVisible(hitboxToggle.checked);
  });

  // 상단 LCD 카운터 스트립 및 상태 HUD 갱신
  function updateHUD(snapshot) {
    const paddedClicks = String(snapshot.clicks || 0).padStart(5, '0');
    const paddedGold = String(snapshot.gold || 0).padStart(5, '0');

    if (displayClicksEl) displayClicksEl.innerText = paddedClicks;
    if (displayGoldEl) displayGoldEl.innerText = `${paddedGold} G`;

    if (statLevelEl) statLevelEl.innerText = `Lv.${snapshot.level}`;
    if (statClicksEl) statClicksEl.innerText = `${snapshot.clicks} 회`;
    if (statGoldEl) statGoldEl.innerText = `${snapshot.gold} G`;
    if (shopGoldDisplayEl) shopGoldDisplayEl.innerText = `${snapshot.gold} G`;

    if (barFullness) barFullness.style.width = `${snapshot.fullness}%`;
    if (barHappiness) barHappiness.style.width = `${snapshot.happiness}%`;
  }

  petStats.onStatChange = (snapshot) => {
    updateHUD(snapshot);
    if (snapshot.fullness <= 20 && stateMachine.currentState === PetState.IDLE) {
      stateMachine.changeState(PetState.HUNGRY);
    }
  };

  petStats.onLevelUp = () => {
    stateMachine.changeState(PetState.HAPPY);
  };

  updateHUD(petStats.getSnapshot());

  // 5. 🖱️ & ⌨️ 컴퓨터 화면 전체(글로벌) 클릭 & 키보드 타자 인식 클리커 엔진
  function triggerPetClick(posX, posY) {
    if (currentMenuMode !== 'NONE') return;

    petStats.clickPet(1);

    // 펫 바운스 리액션
    pet.bouncePhase += 0.4;

    // 플로팅 코인 이펙트
    createCoinPopup(posX, posY, '+1 G');
  }

  function createCoinPopup(clientX, clientY, text) {
    let x = 180;
    let y = 90;

    if (clientX !== undefined && clientY !== undefined) {
      const rect = containerEl.getBoundingClientRect();
      const currentScale = petStats.consoleScale || 1.0;
      x = (clientX - rect.left) / currentScale;
      y = (clientY - rect.top) / currentScale;
    } else {
      x = pet.x - 15;
      y = pet.y - 45;
    }

    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.innerText = text;
    popup.style.left = `${Math.max(10, Math.min(310, x - 15))}px`;
    popup.style.top = `${Math.max(10, Math.min(170, y - 20))}px`;

    coinPopupLayer.appendChild(popup);
    setTimeout(() => {
      popup.remove();
    }, 700);
  }

  // 1) 펫 직접 클릭 감지
  pet.onPetClick = () => {
    if (currentMenuMode === 'NONE') {
      triggerPetClick(undefined, undefined);
    }
  };

  // 2) 게임기 LCD 화면 영역 클릭 감지
  screenGlassEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.osd-menu, .osd-modal')) return;
    if (currentMenuMode === 'NONE') {
      triggerPetClick(e.clientX, e.clientY);
    }
  });

  // 3) 🌐 컴퓨터 화면 전체 (다른 작업창, 게임, 크롬 등) 마우스 클릭 & 키보드 입력 실시간 감지!
  if (window.electronAPI && window.electronAPI.onGlobalInput) {
    window.electronAPI.onGlobalInput(() => {
      if (currentMenuMode === 'NONE') {
        triggerPetClick(undefined, undefined);
      }
    });
  }

  // 6. 🎮 레트로 OSD 메뉴 컨트롤러 (D-Pad & A/B 버튼 제어)
  let currentMenuMode = 'NONE'; // 'NONE' | 'MAIN' | 'FEED' | 'SHOP' | 'STATUS' | 'CONFIG'
  let menuCursorIndex = 0;

  const mainMenuItems = [
    { label: '🍎 FEED (음식주기)', action: () => openFeedMenu() },
    { label: '🎾 PLAY (놀아주기)', action: () => doPlayAction() },
    { label: '🛒 SHOP (상점)', action: () => openShopMenu() },
    { label: '📊 STATUS (상태보기)', action: () => openStatusMenu() },
    { label: '⚙️ CONFIG (설정)', action: () => openConfigMenu() }
  ];

  const shopItemsData = [
    { key: 'apple', name: '사과 (+20허기)', price: 10 },
    { key: 'meat', name: '고기 (+50허기)', price: 25 },
    { key: 'fish', name: '생선 (+35허기)', price: 20 },
    { key: 'candy', name: '캔디 (+40행복)', price: 40 }
  ];

  function closeAllMenus() {
    currentMenuMode = 'NONE';
    menuCursorIndex = 0;
    osdMenuEl.classList.add('hidden');
    osdFeedMenuEl.classList.add('hidden');
    statusModalEl.classList.add('hidden');
    shopModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
  }

  function openMainMenu() {
    closeAllMenus();
    currentMenuMode = 'MAIN';
    menuCursorIndex = 0;
    osdMenuEl.classList.remove('hidden');
    renderMainMenuCursor();
  }

  function renderMainMenuCursor() {
    const itemEls = osdMenuEl.querySelectorAll('.osd-item');
    itemEls.forEach((el, idx) => {
      if (idx === menuCursorIndex) {
        el.classList.add('active');
        el.innerText = `▶ ${mainMenuItems[idx].label}`;
      } else {
        el.classList.remove('active');
        el.innerText = `  ${mainMenuItems[idx].label}`;
      }
    });
  }

  function openFeedMenu() {
    closeAllMenus();
    currentMenuMode = 'FEED';
    menuCursorIndex = 0;
    osdFeedMenuEl.classList.remove('hidden');
    renderFeedMenuItems();
  }

  function renderFeedMenuItems() {
    const inv = petStats.inventory || {};
    const availableFoods = [
      { key: 'apple', label: '🍎 사과', count: inv.apple || 0, fullness: 20 },
      { key: 'meat', label: '🍗 고기', count: inv.meat || 0, fullness: 50 },
      { key: 'fish', label: '🐟 생선', count: inv.fish || 0, fullness: 35 },
      { key: 'candy', label: '🍬 캔디', count: inv.candy || 0, fullness: 10 }
    ];

    feedItemListEl.innerHTML = '';
    availableFoods.forEach((food, idx) => {
      const row = document.createElement('div');
      row.className = `osd-item ${idx === menuCursorIndex ? 'active' : ''}`;
      row.innerText = `${idx === menuCursorIndex ? '▶ ' : '  '}${food.label} [x${food.count}]`;
      feedItemListEl.appendChild(row);
    });
  }

  function feedSelectedItem() {
    const availableFoods = ['apple', 'meat', 'fish', 'candy'];
    const selectedKey = availableFoods[menuCursorIndex];

    if (petStats.useItem(selectedKey)) {
      const food = new FoodItem(app, pet.x + (pet.walkDirection * 35), 210);
      app.stage.addChild(food);
      activeFoods.push(food);

      stateMachine.changeState(PetState.EATING);
      const restoreMap = { apple: 20, meat: 50, fish: 35, candy: 10 };
      setTimeout(() => {
        food.consume();
        petStats.feed(restoreMap[selectedKey] || 20);
      }, 1400);

      closeAllMenus();
    }
  }

  function doPlayAction() {
    closeAllMenus();
    petStats.play(25);
    stateMachine.changeState(PetState.HAPPY);
  }

  function openShopMenu() {
    closeAllMenus();
    currentMenuMode = 'SHOP';
    menuCursorIndex = 0;
    shopModalEl.classList.remove('hidden');
    renderShopMenuCursor();
  }

  function renderShopMenuCursor() {
    const rows = shopModalEl.querySelectorAll('.osd-shop-row');
    rows.forEach((row, idx) => {
      const item = shopItemsData[idx];
      if (idx === menuCursorIndex) {
        row.classList.add('active');
        row.innerHTML = `<span>▶ ${item.name}</span> <b>${item.price}G</b>`;
      } else {
        row.classList.remove('active');
        row.innerHTML = `<span>&nbsp;&nbsp;${item.name}</span> <b>${item.price}G</b>`;
      }
    });
  }

  function buySelectedItem() {
    const item = shopItemsData[menuCursorIndex];
    if (item && petStats.spendGold(item.price)) {
      petStats.addItem(item.key, 1);
      createCoinPopup(undefined, undefined, `구매완료!`);
    } else {
      createCoinPopup(undefined, undefined, `골드부족!`);
    }
  }

  function openStatusMenu() {
    closeAllMenus();
    currentMenuMode = 'STATUS';
    statusModalEl.classList.remove('hidden');
  }

  function openConfigMenu() {
    closeAllMenus();
    currentMenuMode = 'CONFIG';
    settingsModalEl.classList.remove('hidden');
  }

  // 7. 🔘 D-Pad & A/B 버튼 이벤트 처리 함수
  function handleButtonActionA() {
    if (currentMenuMode === 'NONE') {
      openMainMenu();
    } else if (currentMenuMode === 'MAIN') {
      const selected = mainMenuItems[menuCursorIndex];
      if (selected) selected.action();
    } else if (currentMenuMode === 'FEED') {
      feedSelectedItem();
    } else if (currentMenuMode === 'SHOP') {
      buySelectedItem();
    } else if (currentMenuMode === 'STATUS' || currentMenuMode === 'CONFIG') {
      closeAllMenus();
    }
  }

  function handleButtonActionB() {
    if (currentMenuMode === 'MAIN') {
      closeAllMenus();
    } else if (currentMenuMode === 'FEED' || currentMenuMode === 'SHOP' || currentMenuMode === 'STATUS' || currentMenuMode === 'CONFIG') {
      openMainMenu();
    } else {
      closeAllMenus();
    }
  }

  function handleDpadNav(direction) {
    if (currentMenuMode === 'MAIN') {
      if (direction === 'UP') menuCursorIndex = (menuCursorIndex - 1 + mainMenuItems.length) % mainMenuItems.length;
      if (direction === 'DOWN') menuCursorIndex = (menuCursorIndex + 1) % mainMenuItems.length;
      renderMainMenuCursor();
    } else if (currentMenuMode === 'FEED') {
      if (direction === 'UP') menuCursorIndex = (menuCursorIndex - 1 + 4) % 4;
      if (direction === 'DOWN') menuCursorIndex = (menuCursorIndex + 1) % 4;
      renderFeedMenuItems();
    } else if (currentMenuMode === 'SHOP') {
      if (direction === 'UP') menuCursorIndex = (menuCursorIndex - 1 + shopItemsData.length) % shopItemsData.length;
      if (direction === 'DOWN') menuCursorIndex = (menuCursorIndex + 1) % shopItemsData.length;
      renderShopMenuCursor();
    } else if (currentMenuMode === 'CONFIG') {
      if (direction === 'LEFT') {
        scaleRange.value = Math.max(70, parseInt(scaleRange.value, 10) - 5);
        scaleRange.dispatchEvent(new Event('input'));
      }
      if (direction === 'RIGHT') {
        scaleRange.value = Math.min(160, parseInt(scaleRange.value, 10) + 5);
        scaleRange.dispatchEvent(new Event('input'));
      }
    }
  }

  // 물리/화면 D-Pad & A/B 버튼 클릭 바인딩
  document.getElementById('btn-action-a').addEventListener('click', (e) => {
    e.stopPropagation();
    handleButtonActionA();
  });

  document.getElementById('btn-action-b').addEventListener('click', (e) => {
    e.stopPropagation();
    handleButtonActionB();
  });

  document.getElementById('btn-dpad-up').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDpadNav('UP');
  });

  document.getElementById('btn-dpad-down').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDpadNav('DOWN');
  });

  document.getElementById('btn-dpad-left').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDpadNav('LEFT');
  });

  document.getElementById('btn-dpad-right').addEventListener('click', (e) => {
    e.stopPropagation();
    handleDpadNav('RIGHT');
  });

  // 8. ⌨️ 키보드 레트로 컨트롤러 & 클리커 입력
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      handleDpadNav('UP');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      handleDpadNav('DOWN');
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      handleDpadNav('LEFT');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      handleDpadNav('RIGHT');
    } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
      handleButtonActionA();
    } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'Backspace') {
      handleButtonActionB();
    } else if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
      if (currentMenuMode === 'NONE') {
        triggerPetClick(undefined, undefined);
      } else {
        handleButtonActionA();
      }
    }
  });

  // 9. 전원 끄기 버튼 (POWER)
  document.getElementById('btn-power').addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.electronAPI && window.electronAPI.quitApp) {
      window.electronAPI.quitApp();
    }
  });

  // 10. 🎮 기계 본체 케이스 윈도우 드래그 이동 (어디든 잡고 이동)
  const casingEl = document.getElementById('console-casing');
  let isCasingDragging = false;
  let startWinPos = { x: 0, y: 0 };
  let startCursorScreen = { x: 0, y: 0 };

  casingEl.addEventListener('mousedown', async (e) => {
    // 버튼, 스크린, 인풋을 클릭한 경우는 창 드래그 제외
    if (e.target.closest('button, #screen-bezel, input, label')) return;
    if (e.button !== 0) return;

    isCasingDragging = true;
    startCursorScreen = { x: e.screenX, y: e.screenY };

    if (window.electronAPI && window.electronAPI.getWindowPosition) {
      startWinPos = await window.electronAPI.getWindowPosition();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isCasingDragging) {
      const deltaX = e.screenX - startCursorScreen.x;
      const deltaY = e.screenY - startCursorScreen.y;
      const newWinX = Math.round(startWinPos.x + deltaX);
      const newWinY = Math.round(startWinPos.y + deltaY);

      if (window.electronAPI && window.electronAPI.setWindowPosition) {
        window.electronAPI.setWindowPosition(newWinX, newWinY);
      }
    }
  });

  window.addEventListener('mouseup', () => {
    isCasingDragging = false;
  });

  // 11. 커스텀 버튼 이미지 에셋 자동 바인딩
  const buttonSpriteMap = {
    'btn-action-a': 'btn_action_a.png',
    'btn-action-b': 'btn_action_b.png',
    'btn-power': 'btn_power.png',
    'btn-dpad-up': 'btn_dpad_up.png',
    'btn-dpad-down': 'btn_dpad_down.png',
    'btn-dpad-left': 'btn_dpad_left.png',
    'btn-dpad-right': 'btn_dpad_right.png'
  };

  for (const [btnId, fileName] of Object.entries(buttonSpriteMap)) {
    const el = document.getElementById(btnId);
    if (!el) continue;

    const candidates = [
      path.join(__dirname, '../../../assets/sprites', fileName),
      path.join(__dirname, '../../assets/sprites', fileName),
      path.join(process.cwd(), 'assets/sprites', fileName),
      path.join(process.cwd(), 'resources/assets/sprites', fileName)
    ];

    for (const p of candidates) {
      if (fs.existsSync(p)) {
        try {
          const buf = fs.readFileSync(p);
          const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
          el.style.backgroundImage = `url("${dataUrl}")`;
          el.style.backgroundSize = 'contain';
          el.style.backgroundRepeat = 'no-repeat';
          el.style.backgroundPosition = 'center';
          el.style.backgroundColor = 'transparent';
          el.style.borderColor = 'transparent';
          el.innerText = '';
          console.log(`🔘 [ButtonLoader] Custom sprite applied to #${btnId}: ${fileName}`);
          break;
        } catch (err) {
          console.error(`Failed to load button sprite ${fileName}:`, err);
        }
      }
    }
  }

  // 12. 주기적 게임 자동 저장 (매 30초)
  setInterval(() => {
    if (window.electronAPI && window.electronAPI.saveData) {
      const snap = petStats.getSnapshot();
      snap.consoleScale = petStats.consoleScale || 1.0;
      window.electronAPI.saveData({
        version: '1.0.0',
        petInfo: snap
      });
    }
  }, 30000);

  // 13. 메인 렌더링 및 틱 루프 (PIXI Ticker)
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
})();
