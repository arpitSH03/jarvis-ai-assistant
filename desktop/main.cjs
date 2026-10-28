const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    frame: true,
    titleBarStyle: 'hidden',
    backgroundColor: '#030712',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Load Vite dev server or production build
  const devUrl = 'http://localhost:5173';
  mainWindow.loadURL(devUrl).catch(() => {
    // If dev server not running, try loading local dist build
    mainWindow.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html')).catch((err) => {
      console.log('Waiting for frontend server...', err);
    });
  });

  // IPC Handlers
  ipcMain.on('window-minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window-maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window-close', () => {
    if (mainWindow) mainWindow.close();
  });

  ipcMain.handle('window-toggle-pin', () => {
    if (mainWindow) {
      const isPinned = !mainWindow.isAlwaysOnTop();
      mainWindow.setAlwaysOnTop(isPinned);
      return isPinned;
    }
    return false;
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Register Global Keyboard Shortcut (Ctrl+Shift+J) to activate JARVIS
  const shortcutRegistered = globalShortcut.register('CommandOrControl+Shift+J', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('hotkey-activate');
    }
  });

  if (shortcutRegistered) {
    console.log('Global shortcut [Ctrl+Shift+J] registered successfully.');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
