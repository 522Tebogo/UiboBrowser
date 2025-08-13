const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ---- 窗口控制 API ----
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    onWindowMaximized: (callback) => ipcRenderer.on('window-is-maximized', callback),
    onWindowUnmaximized: (callback) => ipcRenderer.on('window-is-unmaximized', callback),
    
    // ---- 主页搜索 API ----
    openSearchResults: (url) => ipcRenderer.send('open-search-results', url),

    // ---- 浏览器窗口接收初始URL的API ----
    onLoadInitialURL: (callback) => ipcRenderer.on('load-initial-url', (event, url) => callback(url)),

    // ---- 搜索引擎设置 API ----
    getSearchEngines: () => ipcRenderer.invoke('get-search-engines'),
    getCurrentSearchEngine: () => ipcRenderer.invoke('get-current-search-engine'),
    setCurrentSearchEngine: (url) => ipcRenderer.send('set-current-search-engine', url)
});