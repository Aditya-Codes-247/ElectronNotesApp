const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const NOTES_PATH = path.join(app.getPath('userData'), 'notes.json');

function loadNotes() {
  try {
    return JSON.parse(fs.readFileSync(NOTES_PATH, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function saveNotes(notes) {
  fs.writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2));
}

function createWindow () {
  const win = new BrowserWindow({
    width: 700,
    height: 500,
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#00000000',
    frame: true,
    transparent: true,
    webPreferences: {
      preload: path.join(__dirname, 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for notes CRUD operations
ipcMain.handle('notes:load', () => loadNotes());
ipcMain.handle('notes:save', (event, notes) => saveNotes(notes));
