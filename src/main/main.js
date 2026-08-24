const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const store = require('./store');

let mainWindow = null;
let tray = null;
let uIOhookInstance = null;
let isAlwaysOnTop = true;

const DEFAULT_WIN_W = 440;
const DEFAULT_WIN_H = 490;
const MINI_WIN_W = 150;
const MINI_WIN_H = 170;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: workW, height: workH } = primaryDisplay.workAreaSize;
  const { x: workX, y: workY } = primaryDisplay.workArea;

  const startX = Math.round(workX + workW - DEFAULT_WIN_W - 20);
  const startY = Math.round(workY + workH - DEFAULT_WIN_H - 20);

  mainWindow = new BrowserWindow({
    width: DEFAULT_WIN_W,
    height: DEFAULT_WIN_H,
    x: startX,
    y: startY,
    transparent: true,
    frame: false,
    alwaysOnTop: isAlwaysOnTop,
    resizable: false,
    hasShadow: false,
    skipTaskbar: false,      // ✅ 작업표시줄에 앱 표시 (최소화/복원 가능)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  if (isAlwaysOnTop) {
    mainWindow.setAlwaysOnTop(true, 'floating');
  }

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupGlobalInputHook() {
  try {
    const { uIOhook } = require('uiohook-napi');
    uIOhookInstance = uIOhook;

    uIOhook.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
        mainWindow.webContents.send('global-input', { type: 'click' });
      }
    });

    uIOhook.on('keydown', () => {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
        mainWindow.webContents.send('global-input', { type: 'keydown' });
      }
    });

    uIOhook.start();
    console.log('✅ [GlobalInput] uIOhook started.');
  } catch (err) {
    console.log('⚠️ [GlobalInput] uIOhook note:', err.message);
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../../assets/ui/tray_icon.png');
  const resolvedIcon = iconPath.includes('app.asar')
    ? iconPath.replace('app.asar', 'app.asar.unpacked')
    : iconPath;

  try {
    tray = new Tray(resolvedIcon);
  } catch (e) {
    // 트레이 아이콘 없으면 스킵
    console.log('Tray icon not found, skipping tray creation.');
    return;
  }

  const buildMenu = () => Menu.buildFromTemplate([
    { label: '🎮 Retro Pet Console', enabled: false },
    { type: 'separator' },
    {
      label: '게임기 보이기 / 복원',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.restore();
        }
      }
    },
    {
      label: '항상 위에 고정',
      type: 'checkbox',
      checked: isAlwaysOnTop,
      click: (item) => {
        isAlwaysOnTop = item.checked;
        if (mainWindow) {
          mainWindow.setAlwaysOnTop(isAlwaysOnTop, 'floating');
          mainWindow.webContents.send('always-on-top-changed', isAlwaysOnTop);
        }
        tray.setContextMenu(buildMenu());
      }
    },
    { type: 'separator' },
    {
      label: '전원 끄기 (종료)',
      click: () => {
        if (uIOhookInstance) { try { uIOhookInstance.stop(); } catch (e) {} }
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Desktop Pet - 레트로 게임기');
  tray.setContextMenu(buildMenu());

  // 트레이 더블클릭으로 창 복원
  tray.on('double-click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.restore();
    }
  });
}

// ─── IPC Handlers ──────────────────────────────────────────────────────────

ipcMain.on('set-window-pos', (event, { x, y }) => {
  if (mainWindow) mainWindow.setPosition(Math.round(x), Math.round(y));
});

ipcMain.on('set-window-size', (event, { w, h }) => {
  if (mainWindow) mainWindow.setSize(Math.round(w), Math.round(h));
});

ipcMain.handle('get-window-pos', () => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  }
  return { x: 0, y: 0 };
});

ipcMain.handle('get-work-area', () => {
  const d = screen.getPrimaryDisplay();
  return { width: d.workAreaSize.width, height: d.workAreaSize.height, x: d.workArea.x, y: d.workArea.y };
});

// 미니 모드 전환 (창 크기 리사이즈)
ipcMain.on('set-mini-mode', (event, isMini) => {
  if (!mainWindow) return;
  const [curX, curY] = mainWindow.getPosition();
  const d = screen.getPrimaryDisplay();
  const { width: workW, height: workH, x: workX, y: workY } = d.workArea;

  if (isMini) {
    // 미니 모드: 우하단 구석 배치
    const nx = Math.min(curX, workX + workW - MINI_WIN_W - 10);
    const ny = Math.min(curY, workY + workH - MINI_WIN_H - 10);
    mainWindow.setSize(MINI_WIN_W, MINI_WIN_H);
    mainWindow.setPosition(nx, ny);
  } else {
    // 일반 모드 복원
    const nx = Math.max(workX, Math.min(curX, workX + workW - DEFAULT_WIN_W - 10));
    const ny = Math.max(workY, Math.min(curY, workY + workH - DEFAULT_WIN_H - 10));
    mainWindow.setSize(DEFAULT_WIN_W, DEFAULT_WIN_H);
    mainWindow.setPosition(nx, ny);
  }
});

// 항상 위 토글
ipcMain.on('set-always-on-top', (event, val) => {
  isAlwaysOnTop = val;
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(val, 'floating');
  }
});

ipcMain.on('quit-app', () => {
  if (uIOhookInstance) { try { uIOhookInstance.stop(); } catch (e) {} }
  app.quit();
});

ipcMain.handle('save-data', (event, data) => store.saveData(data));
ipcMain.handle('load-data', () => store.loadData());

// ─── App Lifecycle ──────────────────────────────────────────────────────────

app.whenReady().then(() => {
  createWindow();
  setupGlobalInputHook();

  try {
    createTray();
  } catch (err) {
    console.log('Tray creation skipped:', err.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (uIOhookInstance) { try { uIOhookInstance.stop(); } catch (e) {} }
  if (process.platform !== 'darwin') app.quit();
});
