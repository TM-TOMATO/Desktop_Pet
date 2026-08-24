const { ipcRenderer } = require('electron');

// contextIsolation: false 환경 → window 직접 할당
window.electronAPI = {
  setWindowPosition: (x, y)  => ipcRenderer.send('set-window-pos', { x, y }),
  setWindowSize:     (w, h)  => ipcRenderer.send('set-window-size', { w, h }),
  getWindowPosition: ()      => ipcRenderer.invoke('get-window-pos'),
  getWorkArea:       ()      => ipcRenderer.invoke('get-work-area'),
  quitApp:           ()      => ipcRenderer.send('quit-app'),
  setMiniMode:       (mini)  => ipcRenderer.send('set-mini-mode', mini),
  setAlwaysOnTop:    (val)   => ipcRenderer.send('set-always-on-top', val),
  onGlobalInput:     (cb)    => ipcRenderer.on('global-input', (e, d) => cb(d)),
  onAlwaysOnTopChanged: (cb) => ipcRenderer.on('always-on-top-changed', (e, v) => cb(v)),
  saveData:          (data)  => ipcRenderer.invoke('save-data', data),
  loadData:          ()      => ipcRenderer.invoke('load-data'),
};
