const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const store = require('./store');

let mainWindow = null;
let tray = null;

const DEFAULT_WIN_W = 320;
const DEFAULT_WIN_H = 300;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: workW, height: workH } = primaryDisplay.workAreaSize;
  const { x: workX, y: workY } = primaryDisplay.workArea;

  const startX = Math.round(workX + (workW - DEFAULT_WIN_W) / 2);
  const startY = Math.round(workY + workH - DEFAULT_WIN_H);

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

  mainWindow.setAlwaysOnTop(true, 'screen-saver');
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  tray = new Tray(path.join(__dirname, '../../assets/ui/tray_icon.png').replace('app.asar', 'app.asar.unpacked'));
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '🐾 Desktop Pet 다마고치', enabled: false },
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
  if (process.platform !== 'darwin') app.quit();
});
