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
  // 1. UI 및 레이어 참조
  const appScalerEl = document.getElementById('app-scaler');
  const screenGlassEl = document.getElementById('screen-glass');
  const displayClicksEl = document.getElementById('display-clicks');
  const displayGoldEl = document.getElementById('display-gold');
  const coinPopupLayer = document.getElementById('coin-popup-layer');

  const layerCaseBg = document.getElementById('layer-case-bg');
  const layerScreenBg = document.getElementById('layer-screen-bg');
  const layerModalBg = document.getElementById('layer-modal-bg');
  const layerMenuTitle = document.getElementById('layer-menu-title');
  const layerMenuItems = [
    document.getElementById('layer-menu-item-0'),
    document.getElementById('layer-menu-item-1'),
    document.getElementById('layer-menu-item-2'),
    document.getElementById('layer-menu-item-3'),
    document.getElementById('layer-menu-item-4')
  ];
  const layerDpad = document.getElementById('layer-dpad');
  const layerPower = document.getElementById('layer-power');
  const layerActionA = document.getElementById('layer-action-a');
  const layerActionB = document.getElementById('layer-action-b');

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

  // 2. 🖼️ 통합 256x256 레이어 스프라이트 로더 & 상태 스왑
  const dpad8WayTextures = {};
  const powerTextures = {};
  const actionATextures = {};
  const actionBTextures = {};
  const dpadKeyState = { up: false, down: false, left: false, right: false };
  let hasModalSprite = false;

  const customMenuSprites = {
    cursor: null,
    labels: {}
  };

  function findSpriteFile(fileNames) {
    const names = Array.isArray(fileNames) ? fileNames : [fileNames];
    const subDirs = ['assets/sprites', 'assets/fonts', 'assets/ui', 'assets'];
    for (const fileName of names) {
      for (const sub of subDirs) {
        const candidates = [
          path.join(process.cwd(), sub, fileName),
          path.join(process.cwd(), 'resources', sub, fileName),
          path.join(process.cwd(), 'resources/app.asar', sub, fileName),
          path.join(process.resourcesPath || '', sub, fileName),
          path.join(__dirname, '../../', sub, fileName),
          path.join(__dirname, '../../../', sub, fileName),
          'C:/Users/user/OneDrive/Desktop/Desktop_Pet/' + sub + '/' + fileName
        ];
        for (const p of candidates) {
          if (fs.existsSync(p)) return p;
        }
      }
    }
    return null;
  }

  function loadAllSpritesAndFonts() {
    // 1) 케이스 배경 (console_case_bg.png)
    const casePath = findSpriteFile('console_case_bg.png');
    if (casePath && layerCaseBg) {
      try {
        const buf = fs.readFileSync(casePath);
        layerCaseBg.style.backgroundImage = `url("data:image/png;base64,${buf.toString('base64')}")`;
        console.log('🎮 [CaseLoader] console_case_bg.png loaded.');
      } catch (e) {}
    }

    // 2) LCD 스크린 배경 (screen_bg.png)
    const screenBgPath = findSpriteFile('screen_bg.png');
    if (screenBgPath && layerScreenBg) {
      try {
        const buf = fs.readFileSync(screenBgPath);
        layerScreenBg.style.backgroundImage = `url("data:image/png;base64,${buf.toString('base64')}")`;
        console.log('📺 [ScreenLoader] screen_bg.png loaded.');
      } catch (e) {}
    }

    // 2.5) OSD 모달/메뉴 스프라이트 배경 (ui_modal_bg.png)
    const modalBgPath = findSpriteFile(['ui_modal_bg.png', 'modal_bg.png', 'menu_bg.png']);
    if (modalBgPath && layerModalBg) {
      try {
        const buf = fs.readFileSync(modalBgPath);
        layerModalBg.style.backgroundImage = `url("data:image/png;base64,${buf.toString('base64')}")`;
        document.body.classList.add('has-modal-sprite');
        hasModalSprite = true;
        console.log('🖼️ [ModalLoader] ui_modal_bg.png loaded.');
      } catch (e) {}
    }

    // 3) 8방향 십자키 스프라이트 매핑
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
        } catch (e) {}
      }
    }

    if (dpad8WayTextures.neutral && layerDpad) {
      layerDpad.style.backgroundImage = `url("${dpad8WayTextures.neutral}")`;
    }

    // 4) 전원 버튼 스프라이트 매핑
    const powerNorm = findSpriteFile('btn_power.png');
    const powerPress = findSpriteFile('btn_power_pressed.png');
    if (powerNorm) {
      powerTextures.normal = `data:image/png;base64,${fs.readFileSync(powerNorm).toString('base64')}`;
      if (layerPower) layerPower.style.backgroundImage = `url("${powerTextures.normal}")`;
    }
    if (powerPress) {
      powerTextures.pressed = `data:image/png;base64,${fs.readFileSync(powerPress).toString('base64')}`;
    }

    // 5) A / B 버튼 스프라이트 매핑
    const aNorm = findSpriteFile('btn_action_a.png');
    const aPress = findSpriteFile('btn_action_a_pressed.png');
    if (aNorm) {
      actionATextures.normal = `data:image/png;base64,${fs.readFileSync(aNorm).toString('base64')}`;
      if (layerActionA) layerActionA.style.backgroundImage = `url("${actionATextures.normal}")`;
    }
    if (aPress) {
      actionATextures.pressed = `data:image/png;base64,${fs.readFileSync(aPress).toString('base64')}`;
    }

    const bNorm = findSpriteFile('btn_action_b.png');
    const bPress = findSpriteFile('btn_action_b_pressed.png');
    if (bNorm) {
      actionBTextures.normal = `data:image/png;base64,${fs.readFileSync(bNorm).toString('base64')}`;
      if (layerActionB) layerActionB.style.backgroundImage = `url("${actionBTextures.normal}")`;
    }
    if (bPress) {
      actionBTextures.pressed = `data:image/png;base64,${fs.readFileSync(bPress).toString('base64')}`;
    }

    // 6) 🔤 커스텀 폰트 자동 감지 및 로드
    function findAnyFontFile() {
      const fontNames = [
        'pixel_font.ttf', 'custom_font.ttf', 'retro_font.ttf',
        'custom_font.woff2', 'custom_font.otf', 'Galmuri11.ttf', 'DungGeunMo.ttf'
      ];
      for (const name of fontNames) {
        const p = findSpriteFile(name);
        if (p) return p;
      }
      const searchDirs = [
        path.join(process.cwd(), 'assets/fonts'),
        path.join(process.cwd(), 'assets/sprites'),
        path.join(process.cwd(), 'resources/assets/fonts'),
        'C:/Users/user/OneDrive/Desktop/Desktop_Pet/assets/fonts',
        'C:/Users/user/OneDrive/Desktop/Desktop_Pet/assets/sprites'
      ];
      for (const d of searchDirs) {
        if (fs.existsSync(d)) {
          const files = fs.readdirSync(d);
          for (const f of files) {
            if (/\.(ttf|woff2|otf)$/i.test(f)) return path.join(d, f);
          }
        }
      }
      return null;
    }

    const detectedFontPath = findAnyFontFile();
    if (detectedFontPath) {
      try {
        const fontData = fs.readFileSync(detectedFontPath);
        const fontBase64 = fontData.toString('base64');
        const fontExt = path.extname(detectedFontPath).toLowerCase().replace('.', '');
        const fontFormat = fontExt === 'woff2' ? 'woff2' : (fontExt === 'otf' ? 'opentype' : 'truetype');

        let fontStyleEl = document.getElementById('dynamic-custom-font');
        if (!fontStyleEl) {
          fontStyleEl = document.createElement('style');
          fontStyleEl.id = 'dynamic-custom-font';
          document.head.appendChild(fontStyleEl);
        }
        fontStyleEl.textContent = `
          @font-face {
            font-family: 'CustomRetroFont';
            src: url("data:font/${fontExt};charset=utf-8;base64,${fontBase64}") format('${fontFormat}');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
          *, html, body, button, input, select, textarea,
          .osd-title, .osd-items, .osd-item, .osd-hint, .osd-stat-row, .osd-setting-row,
          .screen-hud-strip, .coin-popup, .osd-shop-row, .osd-shop-gold, .osd-bar-bg {
            font-family: 'CustomRetroFont', 'Consolas', 'Courier New', monospace !important;
            -webkit-font-smoothing: none !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeSpeed !important;
          }
        `;

        try {
          const fontFace = new FontFace('CustomRetroFont', `url("data:font/${fontExt};charset=utf-8;base64,${fontBase64}")`);
          fontFace.load().then(f => document.fonts.add(f)).catch(e => {});
        } catch (e) {}

        console.log('🔤 [FontLoader] Custom pixel font loaded & applied globally:', detectedFontPath);
      } catch (e) {
        console.warn('Font load error:', e);
      }
    }

    // 8) 🎯 커스텀 메뉴 제목, 커서 & 256x256 라벨 스프라이트
    const titlePath = findSpriteFile(['ui_title_main.png', 'menu_title.png', 'title_main.png']);
    if (titlePath) {
      customMenuSprites.title = `data:image/png;base64,${fs.readFileSync(titlePath).toString('base64')}`;
      if (layerMenuTitle) layerMenuTitle.style.backgroundImage = `url("${customMenuSprites.title}")`;
    }

    const cursorPath = findSpriteFile(['ui_cursor.png', 'menu_cursor.png', 'cursor.png']);
    if (cursorPath) {
      customMenuSprites.cursor = `data:image/png;base64,${fs.readFileSync(cursorPath).toString('base64')}`;
    }

    const labelKeys = ['feed', 'play', 'shop', 'status', 'config'];
    for (const key of labelKeys) {
      const normP = findSpriteFile([`menu_label_${key}.png`, `label_${key}.png`]);
      if (normP) {
        customMenuSprites.labels[key] = `data:image/png;base64,${fs.readFileSync(normP).toString('base64')}`;
      }
      const actP = findSpriteFile([`menu_label_${key}_active.png`, `label_${key}_active.png`]);
      if (actP) {
        customMenuSprites.labels[key + '_active'] = `data:image/png;base64,${fs.readFileSync(actP).toString('base64')}`;
      }
    }
  }

  // 앱 시작 즉시 배경/스프라이트/폰트 로드
  loadAllSpritesAndFonts();

  function reloadAllAssets() {
    loadAllSpritesAndFonts();
    createCoinPopup(undefined, undefined, '에셋 갱신!');
  }

  function update8WayDpadVisual() {
    if (!layerDpad) return;
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
      layerDpad.style.backgroundImage = `url("${dpad8WayTextures[dir]}")`;
    } else if (dpad8WayTextures['neutral']) {
      layerDpad.style.backgroundImage = `url("${dpad8WayTextures['neutral']}")`;
    }
  }

  // 3. PixiJS App 초기화 (LCD 화면 105x143 px)
  const app = new PIXI.Application();
  await app.init({
    width: 105,
    height: 143,
    backgroundAlpha: 0,
    antialias: false,
    roundPixels: true
  });

  const containerEl = document.getElementById('canvas-container');
  containerEl.appendChild(app.canvas);

  // 4. 세이브 데이터 로드 및 PetStats 초기화
  let saveData = null;
  if (window.electronAPI && window.electronAPI.loadData) {
    saveData = await window.electronAPI.loadData();
  }

  const petStats = new PetStats(saveData ? saveData.petInfo : {});

  // 5. 펫 객체 및 상태 머신 생성
  const pet = new PetContainer(app);
  pet.setBounds(16, 89, 20, 137);
  pet.x = 52;
  pet.y = 137;
  pet.setBaseScale(1.0);
  app.stage.addChild(pet);

  const stateMachine = new StateMachine(pet);
  const activeFoods = [];

  // 🎮 게임기 전체 크기 조작 함수 (256x256 기준 스케일, 기본 200% = 512x512 px)
  const BASE_CONSOLE_W = 256;
  const BASE_CONSOLE_H = 256;

  function setConsoleScale(scaleVal) {
    scaleVal = Math.max(1.0, Math.min(3.0, scaleVal));
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

  if (scaleRange) {
    scaleRange.addEventListener('input', (e) => {
      const scalePercent = parseInt(e.target.value, 10);
      scaleValueLabel.innerText = `${scalePercent}%`;
      setConsoleScale(scalePercent / 100);
    });
  }

  const initScale = petStats.consoleScale || 2.0;
  if (scaleRange) scaleRange.value = Math.round(initScale * 100);
  if (scaleValueLabel) scaleValueLabel.innerText = `${Math.round(initScale * 100)}%`;
  setConsoleScale(initScale);

  if (hitboxToggle) {
    hitboxToggle.addEventListener('change', (e) => {
      pet.toggleHitbox(e.target.checked);
      if (e.target.checked) {
        document.body.classList.add('hitbox-debug');
      } else {
        document.body.classList.remove('hitbox-debug');
      }
    });
  }

  if (alwaysOnTopToggle) {
    alwaysOnTopToggle.addEventListener('change', (e) => {
      if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
        window.electronAPI.setAlwaysOnTop(e.target.checked);
      }
    });
  }

  if (window.electronAPI && window.electronAPI.onAlwaysOnTopChanged) {
    window.electronAPI.onAlwaysOnTopChanged((val) => {
      if (alwaysOnTopToggle) alwaysOnTopToggle.checked = val;
    });
  }

  let isMiniMode = false;
  let isMiniDragging = false;
  let miniDragOffset = { x: 0, y: 0 };
  let miniWinStart = { x: 0, y: 0 };

  function activateMiniMode() {
    isMiniMode = true;
    if (miniModeToggle) miniModeToggle.checked = true;
    appScalerEl.classList.add('hidden');
    miniPanel.classList.remove('hidden');
    miniCanvasContainer.appendChild(app.canvas);
    app.renderer.resize(100, 100);
    pet.setBounds(10, 80, 10, 95);
    pet.x = 50;
    pet.y = 95;
    if (window.electronAPI && window.electronAPI.setMiniMode) {
      window.electronAPI.setMiniMode(true);
    }
  }

  function deactivateMiniMode() {
    isMiniMode = false;
    if (miniModeToggle) miniModeToggle.checked = false;
    miniPanel.classList.add('hidden');
    appScalerEl.classList.remove('hidden');
    containerEl.appendChild(app.canvas);
    app.renderer.resize(105, 143);
    pet.setBounds(16, 89, 20, 137);
    pet.x = 52;
    pet.y = 137;
    setConsoleScale(petStats.consoleScale || 2.0);
    if (window.electronAPI && window.electronAPI.setMiniMode) {
      window.electronAPI.setMiniMode(false);
    }
  }

  if (miniModeToggle) {
    miniModeToggle.addEventListener('change', (e) => {
      if (e.target.checked) activateMiniMode();
      else deactivateMiniMode();
    });
  }

  const miniExpandBtn = document.getElementById('mini-expand-btn');
  const miniCloseBtn = document.getElementById('mini-close-btn');

  if (miniExpandBtn) miniExpandBtn.addEventListener('click', () => deactivateMiniMode());
  if (miniCloseBtn) miniCloseBtn.addEventListener('click', () => {
    if (window.electronAPI && window.electronAPI.quitApp) window.electronAPI.quitApp();
  });

  const miniHeader = document.querySelector('.mini-header');
  if (miniHeader) {
    miniHeader.addEventListener('mousedown', async (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isMiniDragging = true;
      miniDragOffset = { x: e.screenX, y: e.screenY };
      if (window.electronAPI && window.electronAPI.getWindowPosition) {
        miniWinStart = await window.electronAPI.getWindowPosition();
      }
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (isMiniDragging && window.electronAPI && window.electronAPI.setWindowPosition) {
      const dx = e.screenX - miniDragOffset.x;
      const dy = e.screenY - miniDragOffset.y;
      window.electronAPI.setWindowPosition(Math.round(miniWinStart.x + dx), Math.round(miniWinStart.y + dy));
    }
  });

  window.addEventListener('mouseup', () => { isMiniDragging = false; });

  // 상단 LCD 카운터 스트립 및 상태 HUD 갱신
  function updateHUD(snapshot) {
    const paddedClicks = String(snapshot.clicks || 0).padStart(5, '0');
    const paddedGold = String(snapshot.gold || 0).padStart(5, '0');

    if (displayClicksEl) displayClicksEl.innerText = paddedClicks;
    if (displayGoldEl) displayGoldEl.innerText = `${paddedGold}G`;

    if (statLevelEl) statLevelEl.innerText = `Lv.${snapshot.level}`;
    if (statClicksEl) statClicksEl.innerText = `${snapshot.clicks}회`;
    if (statGoldEl) statGoldEl.innerText = `${snapshot.gold}G`;
    if (shopGoldDisplayEl) shopGoldDisplayEl.innerText = `${snapshot.gold}G`;

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

  // 6. 🖱️ & ⌨️ 컴퓨터 화면 전체(글로벌) 클릭 & 키보드 타자 인식 클리커 엔진
  let lastClickTime = 0;
  function triggerPetClick(posX, posY) {
    if (currentMenuMode !== 'NONE') return;
    const now = Date.now();
    if (now - lastClickTime < 60) return;
    lastClickTime = now;

    petStats.clickPet(1);
    pet.bouncePhase += 0.4;
    createCoinPopup(posX, posY, '+1 G');
  }

  function createCoinPopup(clientX, clientY, text) {
    let x = 52;
    let y = 60;

    if (clientX !== undefined && clientY !== undefined) {
      const rect = containerEl.getBoundingClientRect();
      const currentScale = isMiniMode ? 1.0 : (petStats.consoleScale || 1.5);
      x = (clientX - rect.left) / currentScale;
      y = (clientY - rect.top) / currentScale;
    } else {
      x = pet.x - 10;
      y = pet.y - 30;
    }

    const popup = document.createElement('div');
    popup.className = 'coin-popup';
    popup.innerText = text;
    popup.style.left = `${Math.max(4, Math.min(80, x - 10))}px`;
    popup.style.top = `${Math.max(4, Math.min(110, y - 10))}px`;

    coinPopupLayer.appendChild(popup);
    setTimeout(() => {
      popup.remove();
    }, 600);
  }

  // 1) 펫 직접 클릭 감지
  pet.onPetClick = () => {
    if (currentMenuMode === 'NONE') {
      triggerPetClick(undefined, undefined);
    }
  };

  // 2) LCD 화면 영역 클릭 감지
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

  // 7. 🎮 레트로 OSD 메뉴 컨트롤러
  let currentMenuMode = 'NONE';
  let menuCursorIndex = 0;
  let configCursorIndex = 0;
  let isDevMode = false;

  const mainMenuItems = [
    { label: 'FEED  (음식)', action: () => openFeedMenu() },
    { label: 'PLAY  (놀기)', action: () => doPlayAction() },
    { label: 'SHOP  (상점)', action: () => openShopMenu() },
    { label: 'STATUS(상태)', action: () => openStatusMenu() },
    { label: 'CONFIG(설정)', action: () => openConfigMenu() }
  ];

  const shopItemsData = [
    { key: 'apple', name: '사과 (+20)', price: 10 },
    { key: 'meat', name: '고기 (+50)', price: 25 },
    { key: 'fish', name: '생선 (+35)', price: 20 },
    { key: 'candy', name: '캔디 (+40)', price: 40 }
  ];

  function closeAllMenus() {
    currentMenuMode = 'NONE';
    menuCursorIndex = 0;
    configCursorIndex = 0;
    if (layerModalBg) layerModalBg.classList.add('hidden');
    if (layerMenuTitle) layerMenuTitle.classList.add('hidden');
    layerMenuItems.forEach(el => el && el.classList.add('hidden'));
    osdMenuEl.classList.add('hidden');
    osdFeedMenuEl.classList.add('hidden');
    statusModalEl.classList.add('hidden');
    shopModalEl.classList.add('hidden');
    settingsModalEl.classList.add('hidden');
  }

  // 초기 상태에서 메뉴 완전 닫힘 보장
  closeAllMenus();

  function openMainMenu() {
    closeAllMenus();
    currentMenuMode = 'MAIN';
    menuCursorIndex = 0;
    if (layerModalBg && hasModalSprite) layerModalBg.classList.remove('hidden');
    if (layerMenuTitle && customMenuSprites.title) layerMenuTitle.classList.remove('hidden');
    osdMenuEl.classList.remove('hidden');
    renderMainMenuCursor();
  }

  function renderMainMenuCursor() {
    const itemEls = osdMenuEl.querySelectorAll('.osd-item');
    const itemKeys = ['feed', 'play', 'shop', 'status', 'config'];
    
    // 메인 메뉴 타이틀 256x256 스프라이트가 있으면 텍스트 타이틀 숨김
    const osdTitleEl = osdMenuEl.querySelector('.osd-title');
    if (osdTitleEl) {
      if (customMenuSprites.title) osdTitleEl.style.opacity = '0';
      else osdTitleEl.style.opacity = '1';
    }

    itemEls.forEach((el, idx) => {
      const key = itemKeys[idx];
      const isSel = idx === menuCursorIndex;
      if (isSel) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }

      const normImg = customMenuSprites.labels[key];
      const actImg = customMenuSprites.labels[key + '_active'] || normImg;
      const targetImg = isSel ? actImg : normImg;

      // 256x256 오버레이 레이어가 있으면 해당 레이어에 표시
      const layerEl = layerMenuItems[idx];
      if (layerEl) {
        if (targetImg) {
          layerEl.style.backgroundImage = `url("${targetImg}")`;
          layerEl.classList.remove('hidden');
        } else {
          layerEl.classList.add('hidden');
        }
      }

      // 만약 256x256 스프라이트 라벨이 있으면 텍스트는 보이지 않게 처리하고 히트존 유지
      if (targetImg) {
        el.style.opacity = '0';
      } else {
        el.style.opacity = '1';
        el.innerText = `${isSel ? '▶ ' : '  '}${mainMenuItems[idx].label}`;
      }
    });
  }

  function openFeedMenu() {
    closeAllMenus();
    currentMenuMode = 'FEED';
    menuCursorIndex = 0;
    if (layerModalBg && hasModalSprite) layerModalBg.classList.remove('hidden');
    osdFeedMenuEl.classList.remove('hidden');
    renderFeedMenuItems();
  }

  function renderFeedMenuItems() {
    const inv = petStats.inventory || {};
    const availableFoods = [
      { key: 'apple', label: '🍎 사과', count: inv.apple || 0 },
      { key: 'meat', label: '🍗 고기', count: inv.meat || 0 },
      { key: 'fish', label: '🐟 생선', count: inv.fish || 0 },
      { key: 'candy', label: '🍬 캔디', count: inv.candy || 0 }
    ];

    feedItemListEl.innerHTML = '';
    availableFoods.forEach((food, idx) => {
      const row = document.createElement('div');
      row.className = `osd-item ${idx === menuCursorIndex ? 'active' : ''}`;
      row.innerHTML = `${idx === menuCursorIndex ? '▶' : '&nbsp;&nbsp;'} ${food.label} <b style="float:right;">${food.count}개</b>`;
      row.addEventListener('click', () => {
        menuCursorIndex = idx;
        feedSelectedItem();
      });
      feedItemListEl.appendChild(row);
    });
  }

  function feedSelectedItem() {
    const inv = petStats.inventory || {};
    const availableFoods = [
      { key: 'apple', fullness: 20, happiness: 5 },
      { key: 'meat', fullness: 50, happiness: 10 },
      { key: 'fish', fullness: 35, happiness: 15 },
      { key: 'candy', fullness: 10, happiness: 40 }
    ];

    const targetFood = availableFoods[menuCursorIndex];
    if (targetFood && inv[targetFood.key] > 0) {
      petStats.useItem(targetFood.key);
      petStats.feed(targetFood.fullness, targetFood.happiness);
      stateMachine.changeState(PetState.EATING);

      const foodDrop = new FoodItem(app, targetFood.key, pet.x, 20);
      activeFoods.push(foodDrop);
      app.stage.addChild(foodDrop);

      createCoinPopup(undefined, undefined, '냠냠!');
      renderFeedMenuItems();
    } else {
      createCoinPopup(undefined, undefined, '음식 없음');
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
    if (layerModalBg && hasModalSprite) layerModalBg.classList.remove('hidden');
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
      createCoinPopup(undefined, undefined, `구매!`);
    } else {
      createCoinPopup(undefined, undefined, `골드부족`);
    }
  }

  function openStatusMenu() {
    closeAllMenus();
    currentMenuMode = 'STATUS';
    if (layerModalBg && hasModalSprite) layerModalBg.classList.remove('hidden');
    statusModalEl.classList.remove('hidden');
  }

  function setDevMode(enabled, notify = true) {
    isDevMode = enabled;
    const devRows = settingsModalEl.querySelectorAll('.dev-only-row');
    devRows.forEach(r => {
      if (isDevMode) r.classList.remove('hidden');
      else r.classList.add('hidden');
    });
    if (!isDevMode && hitboxToggle && hitboxToggle.checked) {
      hitboxToggle.checked = false;
      hitboxToggle.dispatchEvent(new Event('change'));
    }
    if (notify) {
      createCoinPopup(undefined, undefined, isDevMode ? 'DEV ON!' : 'DEV OFF');
    }
    renderConfigMenuCursor();
  }

  function getVisibleConfigRows() {
    return Array.from(settingsModalEl.querySelectorAll('.osd-setting-row')).filter(r => !r.classList.contains('hidden'));
  }

  function openConfigMenu() {
    closeAllMenus();
    currentMenuMode = 'CONFIG';
    configCursorIndex = 0;
    if (layerModalBg && hasModalSprite) layerModalBg.classList.remove('hidden');
    settingsModalEl.classList.remove('hidden');
    renderConfigMenuCursor();
  }

  function renderConfigMenuCursor() {
    const rows = getVisibleConfigRows();
    if (configCursorIndex >= rows.length) configCursorIndex = Math.max(0, rows.length - 1);
    const allRows = settingsModalEl.querySelectorAll('.osd-setting-row');
    allRows.forEach(r => r.classList.remove('config-active'));
    if (rows[configCursorIndex]) {
      rows[configCursorIndex].classList.add('config-active');
    }
  }

  // 8. 🔘 D-Pad & A/B 버튼 액션
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
      const rows = getVisibleConfigRows();
      const activeRow = rows[configCursorIndex];
      if (activeRow) {
        const toggle = activeRow.querySelector('input[type="checkbox"]');
        if (toggle) {
          toggle.checked = !toggle.checked;
          toggle.dispatchEvent(new Event('change'));
        }
        const reloadBtn = activeRow.querySelector('#btn-reload-assets');
        if (reloadBtn) {
          reloadAllAssets();
        }
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
      const rowCount = getVisibleConfigRows().length;
      if (direction === 'UP') {
        configCursorIndex = (configCursorIndex - 1 + rowCount) % rowCount;
        renderConfigMenuCursor();
      } else if (direction === 'DOWN') {
        configCursorIndex = (configCursorIndex + 1) % rowCount;
        renderConfigMenuCursor();
      } else if (direction === 'LEFT' || direction === 'RIGHT') {
        if (configCursorIndex === 0) {
          const step = direction === 'LEFT' ? -10 : 10;
          scaleRange.value = Math.max(100, Math.min(300, parseInt(scaleRange.value, 10) + step));
          scaleRange.dispatchEvent(new Event('input'));
        }
      }
    }
  }

  // 9. 🔘 히트존 마우스 이벤트 바인딩
  function bindHitBtn(id, dirKey, actionFn, layerEl, textures) {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      actionFn();
    });

    el.addEventListener('mousedown', () => {
      if (dirKey) {
        dpadKeyState[dirKey] = true;
        update8WayDpadVisual();
      }
      if (layerEl && textures && textures.pressed) {
        layerEl.style.backgroundImage = `url("${textures.pressed}")`;
      }
    });

    const release = () => {
      if (dirKey) {
        dpadKeyState[dirKey] = false;
        update8WayDpadVisual();
      }
      if (layerEl && textures && textures.normal) {
        layerEl.style.backgroundImage = `url("${textures.normal}")`;
      }
    };

    el.addEventListener('mouseup', release);
    el.addEventListener('mouseleave', release);
  }

  bindHitBtn('btn-dpad-up', 'up', () => handleDpadNav('UP'));
  bindHitBtn('btn-dpad-down', 'down', () => handleDpadNav('DOWN'));
  bindHitBtn('btn-dpad-left', 'left', () => handleDpadNav('LEFT'));
  bindHitBtn('btn-dpad-right', 'right', () => handleDpadNav('RIGHT'));
  bindHitBtn('btn-action-a', null, () => handleButtonActionA(), layerActionA, actionATextures);
  bindHitBtn('btn-action-b', null, () => handleButtonActionB(), layerActionB, actionBTextures);

  // 전원 버튼: 짧은 클릭 -> 전원 끄기 / 10초 꾹 누름 -> 개발자 모드 토글
  let powerLongPressTimer = null;
  let powerLongPressTriggered = false;

  const powerBtnEl = document.getElementById('btn-power');
  if (powerBtnEl) {
    const startPowerPress = () => {
      powerLongPressTriggered = false;
      if (layerPower && powerTextures.pressed) {
        layerPower.style.backgroundImage = `url("${powerTextures.pressed}")`;
      }
      powerLongPressTimer = setTimeout(() => {
        powerLongPressTriggered = true;
        setDevMode(!isDevMode, true);
        if (layerPower && powerTextures.normal) {
          layerPower.style.backgroundImage = `url("${powerTextures.normal}")`;
        }
      }, 10000); // 10초 꾹 누름 감지
    };

    const cancelPowerPress = () => {
      if (powerLongPressTimer) {
        clearTimeout(powerLongPressTimer);
        powerLongPressTimer = null;
      }
      if (layerPower && powerTextures.normal) {
        layerPower.style.backgroundImage = `url("${powerTextures.normal}")`;
      }
    };

    powerBtnEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      startPowerPress();
    });

    powerBtnEl.addEventListener('mouseup', (e) => {
      e.stopPropagation();
      const wasTriggered = powerLongPressTriggered;
      cancelPowerPress();
      if (!wasTriggered) {
        if (window.electronAPI && window.electronAPI.quitApp) window.electronAPI.quitApp();
      }
    });

    powerBtnEl.addEventListener('mouseleave', cancelPowerPress);
  }

  // 에셋 새로고침 버튼 핸들러
  const btnReloadAssets = document.getElementById('btn-reload-assets');
  if (btnReloadAssets) {
    btnReloadAssets.addEventListener('click', (e) => {
      e.stopPropagation();
      reloadAllAssets();
    });
  }

  // 10. ⌨️ 키보드 입력 바인딩
  window.addEventListener('keydown', (e) => {
    if (e.repeat) return;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      dpadKeyState.up = true;
      update8WayDpadVisual();
      handleDpadNav('UP');
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      dpadKeyState.down = true;
      update8WayDpadVisual();
      handleDpadNav('DOWN');
    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      dpadKeyState.left = true;
      update8WayDpadVisual();
      handleDpadNav('LEFT');
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      dpadKeyState.right = true;
      update8WayDpadVisual();
      handleDpadNav('RIGHT');
    } else if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
      if (layerActionA && actionATextures.pressed) layerActionA.style.backgroundImage = `url("${actionATextures.pressed}")`;
      handleButtonActionA();
    } else if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'Backspace') {
      if (layerActionB && actionBTextures.pressed) layerActionB.style.backgroundImage = `url("${actionBTextures.pressed}")`;
      handleButtonActionB();
    } else if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
      if (currentMenuMode === 'NONE') {
        triggerPetClick(undefined, undefined);
      } else {
        if (layerActionA && actionATextures.pressed) layerActionA.style.backgroundImage = `url("${actionATextures.pressed}")`;
        handleButtonActionA();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      dpadKeyState.up = false;
      update8WayDpadVisual();
    }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      dpadKeyState.down = false;
      update8WayDpadVisual();
    }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
      dpadKeyState.left = false;
      update8WayDpadVisual();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
      dpadKeyState.right = false;
      update8WayDpadVisual();
    }
    if (e.key === 'Enter' || e.key === 'z' || e.key === 'Z') {
      if (layerActionA && actionATextures.normal) layerActionA.style.backgroundImage = `url("${actionATextures.normal}")`;
    }
    if (e.key === 'Escape' || e.key === 'x' || e.key === 'X' || e.key === 'Backspace') {
      if (layerActionB && actionBTextures.normal) layerActionB.style.backgroundImage = `url("${actionBTextures.normal}")`;
    }
    if (e.key === ' ' || e.key === 'c' || e.key === 'C') {
      if (layerActionA && actionATextures.normal) layerActionA.style.backgroundImage = `url("${actionATextures.normal}")`;
    }
  });

  // 11. 🎮 기계 본체 케이스 드래그 이동
  const casingEl = document.getElementById('console-casing');
  let isCasingDragging = false;
  let startWinPos = { x: 0, y: 0 };
  let startCursorScreen = { x: 0, y: 0 };

  casingEl.addEventListener('mousedown', async (e) => {
    if (e.target.closest('button, .screen-viewport, input, label')) return;
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

  // 12. 주기적 게임 자동 저장 (매 30초)
  setInterval(() => {
    if (window.electronAPI && window.electronAPI.saveData) {
      const snap = petStats.getSnapshot();
      snap.consoleScale = petStats.consoleScale || 1.5;
      window.electronAPI.saveData({
        version: '1.0.0',
        petInfo: snap
      });
    }
  }, 30000);

  // 13. 메인 렌더링 루프 (PIXI Ticker)
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
