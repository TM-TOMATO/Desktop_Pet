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
  const alwaysOnTopToggle = document.getElementById('always-on-top-toggle');
  const miniModeToggle = document.getElementById('mini-mode-toggle');
  const miniPanel = document.getElementById('mini-panel');
  const miniCanvasContainer = document.getElementById('mini-canvas-container');

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

  // ── 항상 위에 고정 토글 ──────────────────────────────────
  const savedAlwaysOnTop = (saveData && saveData.petInfo && saveData.petInfo.alwaysOnTop !== undefined)
    ? saveData.petInfo.alwaysOnTop : true;
  alwaysOnTopToggle.checked = savedAlwaysOnTop;
  if (window.electronAPI) window.electronAPI.setAlwaysOnTop(savedAlwaysOnTop);

  alwaysOnTopToggle.addEventListener('change', () => {
    if (window.electronAPI) window.electronAPI.setAlwaysOnTop(alwaysOnTopToggle.checked);
    petStats.alwaysOnTop = alwaysOnTopToggle.checked;
  });

  if (window.electronAPI && window.electronAPI.onAlwaysOnTopChanged) {
    window.electronAPI.onAlwaysOnTopChanged((val) => {
      alwaysOnTopToggle.checked = val;
    });
  }

  // ── 📦 미니 모드 (작은 화면 모드) ───────────────────────────
  let isMiniMode = false;

  function activateMiniMode() {
    isMiniMode = true;
    document.body.classList.add('mini-mode');
    miniPanel.classList.remove('hidden');
    miniModeToggle.checked = true;

    // PixiJS 캔버스를 미니 스크린으로 이동 및 리사이즈
    if (app.canvas && miniCanvasContainer) {
      miniCanvasContainer.appendChild(app.canvas);
      app.renderer.resize(128, 110);
    }

    // 펫 위치 및 이동 범위를 미니 모드에 맞게 재설정
    pet.setBounds(15, 113, 30, 105);
    pet.x = 64;
    pet.y = 105;
    pet.setBaseScale(1.0);

    if (window.electronAPI) window.electronAPI.setMiniMode(true);
  }

  function deactivateMiniMode() {
    isMiniMode = false;
    document.body.classList.remove('mini-mode');
    miniPanel.classList.add('hidden');
    miniModeToggle.checked = false;

    // PixiJS 캔버스를 원래 컨테이너로 복원
    if (app.canvas && containerEl) {
      containerEl.appendChild(app.canvas);
      app.renderer.resize(360, 220);
    }

    // 펫 위치 및 이동 범위를 기본 모드에 맞게 복원
    pet.setBounds(40, 340, 80, 220);
    pet.x = 180;
    pet.y = 220;
    pet.setBaseScale(1.5);

    if (window.electronAPI) window.electronAPI.setMiniMode(false);
  }

  miniModeToggle.addEventListener('change', () => {
    if (miniModeToggle.checked) activateMiniMode();
    else deactivateMiniMode();
  });

  document.getElementById('mini-btn-power').addEventListener('click', (e) => {
    e.stopPropagation();
    if (window.electronAPI) window.electronAPI.quitApp();
  });

  document.getElementById('mini-btn-expand').addEventListener('click', (e) => {
    e.stopPropagation();
    deactivateMiniMode();
  });

  // 미니 패널 드래그 이동
  let isMiniDragging = false;
  let miniDragStart = { x: 0, y: 0 };
  let miniWinStart = { x: 0, y: 0 };

  miniPanel.addEventListener('mousedown', async (e) => {
    if (e.target.closest('button')) return;
    if (e.button !== 0) return;
    isMiniDragging = true;
    miniDragStart = { x: e.screenX, y: e.screenY };
    if (window.electronAPI) {
      miniWinStart = await window.electronAPI.getWindowPosition();
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (isMiniDragging) {
      const dx = e.screenX - miniDragStart.x;
      const dy = e.screenY - miniDragStart.y;
      if (window.electronAPI) {
        window.electronAPI.setWindowPosition(miniWinStart.x + dx, miniWinStart.y + dy);
      }
    }
  });

  window.addEventListener('mouseup', () => { isMiniDragging = false; });

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
    pet.bouncePhase += 0.4;
    createCoinPopup(posX, posY, '+1 G');
  }

  function createCoinPopup(clientX, clientY, text) {
    let x = 180;
    let y = 90;

    if (clientX !== undefined && clientY !== undefined) {
      const rect = containerEl.getBoundingClientRect();
      const currentScale = isMiniMode ? 1.0 : (petStats.consoleScale || 1.0);
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

  // 3) 글로벌 마우스 클릭 & 키보드 감지
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
  let configCursorIndex = 0; // 0: Scale Slider, 1: AlwaysOnTop Toggle, 2: Hitbox Toggle, 3: MiniMode Toggle

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
    configCursorIndex = 0;
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

  // ⚙️ CONFIG 설정 메뉴 열기 및 커서 렌더링
  function openConfigMenu() {
    closeAllMenus();
    currentMenuMode = 'CONFIG';
    configCursorIndex = 0;
    settingsModalEl.classList.remove('hidden');
    renderConfigMenuCursor();
  }

  function renderConfigMenuCursor() {
    const rows = settingsModalEl.querySelectorAll('.osd-setting-row');
    rows.forEach((row, idx) => {
      if (idx === configCursorIndex) {
        row.classList.add('config-active');
      } else {
        row.classList.remove('config-active');
      }
    });
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
    } else if (currentMenuMode === 'STATUS') {
      closeAllMenus();
    } else if (currentMenuMode === 'CONFIG') {
      // ⚙️ CONFIG 메뉴: A 확인 버튼으로 토글 스위치 ON/OFF
      if (configCursorIndex === 1) {
        alwaysOnTopToggle.checked = !alwaysOnTopToggle.checked;
        alwaysOnTopToggle.dispatchEvent(new Event('change'));
      } else if (configCursorIndex === 2) {
        hitboxToggle.checked = !hitboxToggle.checked;
        hitboxToggle.dispatchEvent(new Event('change'));
      } else if (configCursorIndex === 3) {
        miniModeToggle.checked = !miniModeToggle.checked;
        miniModeToggle.dispatchEvent(new Event('change'));
      }
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
      // ⚙️ CONFIG 메뉴: 상하(UP/DOWN)로 항목 선택, 좌우(LEFT/RIGHT)로 슬라이더 조종
      if (direction === 'UP') {
        configCursorIndex = (configCursorIndex - 1 + 4) % 4;
        renderConfigMenuCursor();
      } else if (direction === 'DOWN') {
        configCursorIndex = (configCursorIndex + 1) % 4;
        renderConfigMenuCursor();
      } else if (direction === 'LEFT' || direction === 'RIGHT') {
        if (configCursorIndex === 0) {
          const step = direction === 'LEFT' ? -5 : 5;
          scaleRange.value = Math.max(70, Math.min(160, parseInt(scaleRange.value, 10) + step));
          scaleRange.dispatchEvent(new Event('input'));
        }
      }
    }
  }

  // 🔘 물리/화면 버튼 클릭 & 누름 시각 효과(Pressed) 바인딩
  function bindButtonEvents(btnId, normalFn, pressedClass = 'pressed') {
    const el = document.getElementById(btnId);
    if (!el) return;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      normalFn();
    });

    el.addEventListener('mousedown', () => {
      el.classList.add(pressedClass);
      if (btnId === 'btn-dpad-up') { dpadKeyState.up = true; update8WayDpadVisual(); }
      if (btnId === 'btn-dpad-down') { dpadKeyState.down = true; update8WayDpadVisual(); }
      if (btnId === 'btn-dpad-left') { dpadKeyState.left = true; update8WayDpadVisual(); }
      if (btnId === 'btn-dpad-right') { dpadKeyState.right = true; update8WayDpadVisual(); }

      if (buttonTextures[btnId] && buttonTextures[btnId].pressed) {
        el.style.backgroundImage = `url("${buttonTextures[btnId].pressed}")`;
      }
    });

    const release = () => {
      el.classList.remove(pressedClass);
      if (btnId === 'btn-dpad-up') { dpadKeyState.up = false; update8WayDpadVisual(); }
      if (btnId === 'btn-dpad-down') { dpadKeyState.down = false; update8WayDpadVisual(); }
      if (btnId === 'btn-dpad-left') { dpadKeyState.left = false; update8WayDpadVisual(); }
      if (btnId === 'btn-dpad-right') { dpadKeyState.right = false; update8WayDpadVisual(); }

      if (buttonTextures[btnId] && buttonTextures[btnId].normal) {
        el.style.backgroundImage = `url("${buttonTextures[btnId].normal}")`;
      }
    };

    el.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  }

  bindButtonEvents('btn-action-a', () => handleButtonActionA());
  bindButtonEvents('btn-action-b', () => handleButtonActionB());
  bindButtonEvents('btn-dpad-up', () => handleDpadNav('UP'));
  bindButtonEvents('btn-dpad-down', () => handleDpadNav('DOWN'));
  bindButtonEvents('btn-dpad-left', () => handleDpadNav('LEFT'));
  bindButtonEvents('btn-dpad-right', () => handleDpadNav('RIGHT'));

  // 8. ⌨️ 키보드 레트로 컨트롤러 & 클리커 입력
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      dpadKeyState.up = true;
      update8WayDpadVisual();
      triggerVisualButtonPress('btn-dpad-up');
      handleDpadNav('UP');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      dpadKeyState.down = true;
      update8WayDpadVisual();
      triggerVisualButtonPress('btn-dpad-down');
      handleDpadNav('DOWN');
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      dpadKeyState.left = true;
      update8WayDpadVisual();
      triggerVisualButtonPress('btn-dpad-left');
      handleDpadNav('LEFT');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      dpadKeyState.right = true;
      update8WayDpadVisual();
      triggerVisualButtonPress('btn-dpad-right');
      handleDpadNav('RIGHT');
    } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
      triggerVisualButtonPress('btn-action-a');
      handleButtonActionA();
    } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'Backspace') {
      triggerVisualButtonPress('btn-action-b');
      handleButtonActionB();
    } else if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
      if (currentMenuMode === 'NONE') {
        triggerPetClick(undefined, undefined);
      } else {
        triggerVisualButtonPress('btn-action-a');
        handleButtonActionA();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      dpadKeyState.up = false;
      update8WayDpadVisual();
      releaseVisualButtonPress('btn-dpad-up');
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      dpadKeyState.down = false;
      update8WayDpadVisual();
      releaseVisualButtonPress('btn-dpad-down');
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      dpadKeyState.left = false;
      update8WayDpadVisual();
      releaseVisualButtonPress('btn-dpad-left');
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      dpadKeyState.right = false;
      update8WayDpadVisual();
      releaseVisualButtonPress('btn-dpad-right');
    }
    if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') releaseVisualButtonPress('btn-action-a');
    if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'Backspace') releaseVisualButtonPress('btn-action-b');
    if (e.key === ' ' || e.key === 'c' || e.key === 'C') releaseVisualButtonPress('btn-action-a');
  });

  function triggerVisualButtonPress(btnId) {
    const el = document.getElementById(btnId);
    if (!el) return;
    el.classList.add('pressed');
    if (buttonTextures[btnId] && buttonTextures[btnId].pressed) {
      el.style.backgroundImage = `url("${buttonTextures[btnId].pressed}")`;
    }
  }

  function releaseVisualButtonPress(btnId) {
    const el = document.getElementById(btnId);
    if (!el) return;
    el.classList.remove('pressed');
    if (buttonTextures[btnId] && buttonTextures[btnId].normal) {
      el.style.backgroundImage = `url("${buttonTextures[btnId].normal}")`;
    }
  }

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

  // 11. 🔘 통합 8방향 십자키 (8-Way D-Pad) & 커스텀 버튼 에셋 자동 바인딩
  const buttonTextures = {};
  const dpad8WayTextures = {};
  const dpadKeyState = { up: false, down: false, left: false, right: false };
  const dpadContainerEl = document.querySelector('.dpad');

  function update8WayDpadVisual() {
    if (!dpadContainerEl) return;
    let dir = 'neutral';

    if (dpadKeyState.up && dpadKeyState.left) dir = 'up_left';
    else if (dpadKeyState.up && dpadKeyState.right) dir = 'up_right';
    else if (dpadKeyState.down && dpadKeyState.left) dir = 'down_left';
    else if (dpadKeyState.down && dpadKeyState.right) dir = 'down_right';
    else if (dpadKeyState.up) dir = 'up';
    else if (dpadKeyState.down) dir = 'down';
    else if (dpadKeyState.left) dir = 'left';
    else if (dpadKeyState.right) dir = 'right';

    if (dpad8WayTextures[dir]) {
      dpadContainerEl.style.backgroundImage = `url("${dpad8WayTextures[dir]}")`;
    } else if (dpad8WayTextures['neutral']) {
      dpadContainerEl.style.backgroundImage = `url("${dpad8WayTextures['neutral']}")`;
    }
  }

  function findSpriteFile(fileNames) {
    const names = Array.isArray(fileNames) ? fileNames : [fileNames];
    for (const fileName of names) {
      const candidates = [
        path.join(__dirname, '../../../assets/sprites', fileName),
        path.join(__dirname, '../../assets/sprites', fileName),
        path.join(process.cwd(), 'assets/sprites', fileName),
        path.join(process.cwd(), 'resources/assets/sprites', fileName)
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) return p;
      }
    }
    return null;
  }

  // 8방향 십자키 스프라이트 매핑 로드 (기본 중립 1장 + 8방향 눌림)
  const dpad8WayFiles = {
    neutral: ['btn_dpad.png'],
    up: ['btn_dpad_pressed_up.png', 'btn_dpad_up_pressed.png'],
    down: ['btn_dpad_pressed_down.png', 'btn_dpad_down_pressed.png'],
    left: ['btn_dpad_pressed_left.png', 'btn_dpad_left_pressed.png'],
    right: ['btn_dpad_pressed_right.png', 'btn_dpad_right_pressed.png'],
    up_left: ['btn_dpad_pressed_up_left.png', 'btn_dpad_up_left_pressed.png', 'btn_dpad_pressed_ul.png'],
    up_right: ['btn_dpad_pressed_up_right.png', 'btn_dpad_up_right_pressed.png', 'btn_dpad_pressed_ur.png'],
    down_left: ['btn_dpad_pressed_down_left.png', 'btn_dpad_down_left_pressed.png', 'btn_dpad_pressed_dl.png'],
    down_right: ['btn_dpad_pressed_down_right.png', 'btn_dpad_down_right_pressed.png', 'btn_dpad_pressed_dr.png']
  };

  for (const [dirKey, candidateFiles] of Object.entries(dpad8WayFiles)) {
    const filePath = findSpriteFile(candidateFiles);
    if (filePath) {
      try {
        const buf = fs.readFileSync(filePath);
        dpad8WayTextures[dirKey] = `data:image/png;base64,${buf.toString('base64')}`;
        console.log(`🕹️ [8WayDpad] Loaded ${dirKey} sprite: ${path.basename(filePath)}`);
      } catch (e) {}
    }
  }

  if (dpadContainerEl && dpad8WayTextures.neutral) {
    dpadContainerEl.style.backgroundImage = `url("${dpad8WayTextures.neutral}")`;
    dpadContainerEl.style.backgroundSize = 'contain';
    dpadContainerEl.style.backgroundRepeat = 'no-repeat';
    dpadContainerEl.style.backgroundPosition = 'center';

    // 통합 이미지가 있으면 개별 버튼의 자체 배경은 투명화
    ['btn-dpad-up', 'btn-dpad-down', 'btn-dpad-left', 'btn-dpad-right'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.style.backgroundColor = 'transparent';
        btn.style.borderColor = 'transparent';
        btn.style.boxShadow = 'none';
        btn.innerText = '';
      }
    });
    const center = document.querySelector('.dpad-center');
    if (center) center.style.backgroundColor = 'transparent';
  }

  // 액션 및 시스템 버튼 스프라이트 매핑 로드
  const buttonSpriteMap = {
    'btn-action-a': { normal: 'btn_action_a.png', pressed: 'btn_action_a_pressed.png' },
    'btn-action-b': { normal: 'btn_action_b.png', pressed: 'btn_action_b_pressed.png' },
    'btn-power': { normal: 'btn_power.png', pressed: 'btn_power_pressed.png' },
    'mini-btn-power': { normal: 'mini_btn_power.png', pressed: 'mini_btn_power_pressed.png' },
    'mini-btn-expand': { normal: 'mini_btn_expand.png', pressed: 'mini_btn_expand_pressed.png' }
  };

  for (const [btnId, spriteFiles] of Object.entries(buttonSpriteMap)) {
    const el = document.getElementById(btnId);
    if (!el) continue;

    buttonTextures[btnId] = {};

    const normPath = findSpriteFile(spriteFiles.normal);
    if (normPath) {
      try {
        const buf = fs.readFileSync(normPath);
        const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
        buttonTextures[btnId].normal = dataUrl;
        el.style.backgroundImage = `url("${dataUrl}")`;
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.backgroundPosition = 'center';
        el.style.backgroundColor = 'transparent';
        el.style.borderColor = 'transparent';
        el.innerText = '';
        console.log(`🔘 [ButtonLoader] Loaded normal sprite for #${btnId}`);
      } catch (err) {
        console.error(`Failed to load button sprite ${spriteFiles.normal}:`, err);
      }
    }

    const pressPath = findSpriteFile(spriteFiles.pressed);
    if (pressPath) {
      try {
        const buf = fs.readFileSync(pressPath);
        const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
        buttonTextures[btnId].pressed = dataUrl;
        console.log(`🔘 [ButtonLoader] Loaded pressed sprite for #${btnId}`);
      } catch (err) {
        console.error(`Failed to load pressed button sprite ${spriteFiles.pressed}:`, err);
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

    for (let i = activeFoods.length - 1; i >= 0; i--) {
      const food = activeFoods[i];
      food.update(delta);
      if (food.isEaten) {
        activeFoods.splice(i, 1);
      }
    }
  });
})();
