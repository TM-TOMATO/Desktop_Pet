const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const store = require('./store');

let mainWindow = null;
let tray = null;
let uIOhookInstance = null;

const DEFAULT_WIN_W = 440;
const DEFAULT_WIN_H = 490;

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
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setAlwaysOnTop(true, 'floating');
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupGlobalInputHook() {
  try {
    const { uIOhook } = require('uiohook-napi');
    uIOhookInstance = uIOhook;

    // 컴퓨터 화면 전체의 글로벌 마우스 클릭 감지
    uIOhook.on('click', () => {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
        mainWindow.webContents.send('global-input', { type: 'click' });
      }
    });

    // 컴퓨터 화면 전체의 글로벌 키보드 타자 감지
    uIOhook.on('keydown', () => {
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.webContents) {
        mainWindow.webContents.send('global-input', { type: 'keydown' });
      }
    });

    uIOhook.start();
    console.log('✅ [GlobalInput] uIOhook global input listener started successfully.');
  } catch (err) {
    console.log('⚠️ [GlobalInput] uIOhook initialization note:', err.message);
  }
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../../assets/ui/tray_icon.png').replace('app.asar', 'app.asar.unpacked'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '🎮 Retro Pet Console', enabled: false },
    { type: 'separator' },
    {
      label: '게임기 보이기 / 숨기기',
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) mainWindow.hide();
          else mainWindow.show();
        }
      }
    },
    {
      label: '항상 위에 고정',
      type: 'checkbox',
      checked: true,
      click: (item) => {
        if (mainWindow) {
          mainWindow.setAlwaysOnTop(item.checked, 'floating');
        }
      }
    },
    { type: 'separator' },
    {
      label: '전원 끄기 (종료)',
      click: () => {
        if (uIOhookInstance) uIOhookInstance.stop();
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Desktop Pet - 레트로 게임기');
  tray.setContextMenu(contextMenu);
}

// IPC Handlers
ipcMain.on('set-window-pos', (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
  }
});

ipcMain.on('set-window-size', (event, { w, h }) => {
  if (mainWindow) {
    mainWindow.setSize(Math.round(w), Math.round(h));
  }
});

ipcMain.handle('get-window-pos', () => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  }
  return { x: 0, y: 0 };
});

ipcMain.handle('get-work-area', () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  return {
    width: primaryDisplay.workAreaSize.width,
    height: primaryDisplay.workAreaSize.height,
    x: primaryDisplay.workArea.x,
    y: primaryDisplay.workArea.y
  };
});

ipcMain.on('quit-app', () => {
  if (uIOhookInstance) {
    try { uIOhookInstance.stop(); } catch (e) {}
  }
  app.quit();
});

ipcMain.handle('save-data', (event, data) => {
  return store.saveData(data);
});

ipcMain.handle('load-data', () => {
  return store.loadData();
});

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
  if (uIOhookInstance) {
    try { uIOhookInstance.stop(); } catch (e) {}
  }
  if (process.platform !== 'darwin') app.quit();
});
