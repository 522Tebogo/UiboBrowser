const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const contextMenu = require('electron-context-menu');

let store;

const searchEngines = [
    { name: 'Google',      url: 'https://www.google.com/search?q={s}',     homeUrl: 'https://www.google.com' },
    { name: 'Bing 中国版', url: 'https://cn.bing.com/search?q={s}',        homeUrl: 'https://cn.bing.com' },
    { name: 'Bing 国际版', url: 'https://www.bing.com/search?q={s}',        homeUrl: 'https://www.bing.com' },
    { name: '百度',        url: 'https://www.baidu.com/s?wd={s}',          homeUrl: 'https://www.baidu.com' },
    { name: '搜狗',        url: 'https://www.sogou.com/web?query={s}',     homeUrl: 'https://www.sogou.com' },
    { name: '360搜索',     url: 'https://www.so.com/s?q={s}',             homeUrl: 'https://www.so.com' }
];

function createBrowserWindow() {
  const browserWin = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    webPreferences: {
      webviewTag: true,
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  contextMenu({ window: browserWin, showInspectElement: true });

  browserWin.on('maximize', () => browserWin.webContents.send('window-is-maximized'));
  browserWin.on('unmaximize', () => browserWin.webContents.send('window-is-unmaximized'));
  
  browserWin.loadFile(path.join(__dirname, '../renderer/browser/index.html'));
  
  return browserWin; 
}

function createHomepageWindow() {
  const homepageWin = new BrowserWindow({
    width: 800,
    height: 600,
    resizable: true,
    frame: false,
    transparent: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/index.js') 
    }
  });
  homepageWin.loadFile(path.join(__dirname, '../renderer/homepage/homepage.html'));
}

app.whenReady().then(async () => {
    const { default: Store } = await import('electron-store');
    
    store = new Store({
        defaults: {
            searchEngine: 'https://www.google.com/search?q={s}'
        }
    });

    createHomepageWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createHomepageWindow();
    });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-search-results', (event, url) => {
  const newBrowserWindow = createBrowserWindow();
  newBrowserWindow.webContents.once('did-finish-load', () => {
    newBrowserWindow.webContents.send('load-initial-url', url);
  });
  const homepageWin = BrowserWindow.fromWebContents(event.sender);
  if (homepageWin) homepageWin.close();
});

ipcMain.handle('get-search-engines', () => searchEngines);

ipcMain.handle('get-current-search-engine', () => {
    const currentSearchUrl = store.get('searchEngine');
    return searchEngines.find(engine => engine.url === currentSearchUrl) || searchEngines[0];
});

ipcMain.on('set-current-search-engine', (event, url) => {
    store.set('searchEngine', url);
});

ipcMain.on('minimize-window', () => BrowserWindow.getFocusedWindow()?.minimize());
ipcMain.on('maximize-window', () => {
  const win = BrowserWindow.getFocusedWindow();
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});
ipcMain.on('close-window', () => BrowserWindow.getFocusedWindow()?.close());