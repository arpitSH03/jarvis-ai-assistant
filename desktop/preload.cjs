const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('window-toggle-pin'),
  onHotkeyPressed: (callback) => ipcRenderer.on('hotkey-activate', callback),
});
