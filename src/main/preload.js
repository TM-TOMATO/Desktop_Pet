const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setWindowPosition: (x, y) => {
    ipcRenderer.send('set-window-pos', { x, y });
  },
  setWindowSize: (w, h) => {
    ipcRenderer.send('set-window-size', { w, h });
  },
  getWorkArea: () => ipcRenderer.invoke('get-work-area'),
  quitApp: () => {
    ipcRenderer.send('quit-app');
  },
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data')
});
