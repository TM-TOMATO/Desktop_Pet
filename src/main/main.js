const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const store = require('./store');

let mainWindow = null;
let tray = null;
let ignoreHandlerRegistered = false;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  const { x: workX, y: workY } = primaryDisplay.workArea;

  // 작업표시줄 바로 위에 붙이기: workArea 기준으로 전체 작업 영역 커버
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: workX,
    y: workY,
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

  // Always on top 레벨 설정
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // 기본적으로 마우스 통과(Ghost Mode) 설정
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  // IPC 핸들러 (중복 등록 방지)
  if (!ignoreHandlerRegistered) {
    ignoreHandlerRegistered = true;

    ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      if (win) {
        if (ignore) {
          win.setIgnoreMouseEvents(true, { forward: true });
        } else {
          win.setIgnoreMouseEvents(false);
        }
      }
    });

    ipcMain.on('move-window', (event, { deltaX, deltaY }) => {
      if (mainWindow) {
        const [currentX, currentY] = mainWindow.getPosition();
        mainWindow.setPosition(currentX + deltaX, currentY + deltaY);
      }
    });

    ipcMain.on('quit-app', () => {
      app.quit();
    });

    ipcMain.handle('save-data', (event, data) => {
      return store.saveData(data);
    });

    ipcMain.handle('load-data', () => {
      return store.loadData();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../../assets/ui/tray_icon.png').replace('app.asar', 'app.asar.unpacked'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '🐾 펫 바탕화면 상주 중', enabled: false },
    { type: 'separator' },
    {
      label: '펫 보이기 / 숨기기',
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
          mainWindow.setAlwaysOnTop(item.checked, 'screen-saver');
        }
      }
    },
    { type: 'separator' },
    {
      label: '종료',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Desktop Pet - 다마고치');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  createWindow();
  
  try {
    createTray();
  } catch (err) {
    console.log('Tray creation skipped (icon missing or non-GUI env):', err.message);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
