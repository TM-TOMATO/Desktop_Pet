const { ipcRenderer } = require('electron');

// contextIsolation: false 환경에서는 window 직접 할당
window.electronAPI = {
  setWindowPosition: (x, y) => {
    ipcRenderer.send('set-window-pos', { x, y });
  },
  setWindowSize: (w, h) => {
    ipcRenderer.send('set-window-size', { w, h });
  },
  getWindowPosition: () => ipcRenderer.invoke('get-window-pos'),
  getWorkArea: () => ipcRenderer.invoke('get-work-area'),
  quitApp: () => {
    ipcRenderer.send('quit-app');
  },
  onGlobalInput: (callback) => {
    ipcRenderer.on('global-input', (event, data) => callback(data));
  },
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data')
};
