const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 마우스 이벤트 통과 (Ghost Mode) 설정
  setIgnoreMouseEvents: (ignore, options) => {
    ipcRenderer.send('set-ignore-mouse-events', ignore, options);
  },
  // 윈도우 이동 / 닫기
  moveWindow: (deltaX, deltaY) => {
    ipcRenderer.send('move-window', { deltaX, deltaY });
  },
  quitApp: () => {
    ipcRenderer.send('quit-app');
  }
});
