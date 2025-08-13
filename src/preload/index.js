const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimize: () => ipcRenderer.send('minimize-window'),
    maximize: () => ipcRenderer.send('maximize-window'),
    close: () => ipcRenderer.send('close-window'),
    onWindowMaximized: (callback) => ipcRenderer.on('window-is-maximized', callback),
    onWindowUnmaximized: (callback) => ipcRenderer.on('window-is-unmaximized', callback),
    
    openSearchResults: (url) => ipcRenderer.send('open-search-results', url),

    onLoadInitialURL: (callback) => ipcRenderer.on('load-initial-url', (event, url) => callback(url)),

    getSearchEngines: () => ipcRenderer.invoke('get-search-engines'),
    getCurrentSearchEngine: () => ipcRenderer.invoke('get-current-search-engine'),
    setCurrentSearchEngine: (url) => ipcRenderer.send('set-current-search-engine', url)
});