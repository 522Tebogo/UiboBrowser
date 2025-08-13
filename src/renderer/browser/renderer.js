const addressBar = document.getElementById('address-bar');
const backBtn = document.getElementById('back-btn');
const forwardBtn = document.getElementById('forward-btn');
const reloadBtn = document.getElementById('reload-btn');
const addTabBtn = document.getElementById('add-tab-btn');
const tabBar = document.getElementById('tab-bar');
const webviewContainer = document.getElementById('webview-container');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const moonIcon = themeToggleBtn.querySelector('.icon-moon');
const sunIcon = themeToggleBtn.querySelector('.icon-sun');

let tabs = [];
let activeTabId = null;

function generateId() { return `tab_${Date.now()}_${Math.random()}`; }

function createNewTab(url) {
  if (!url) {
      console.error("createNewTab was called without a URL.");
      url = 'https://www.google.com';
  }
  const tabId = generateId();
  const tabElement = document.createElement('div');
  tabElement.className = 'tab';
  tabElement.dataset.tabId = tabId;
  tabElement.innerHTML = `<span class="tab-title">加载中...</span><button class="tab-close-btn">×</button>`;

  const webviewElement = document.createElement('webview');
  webviewElement.dataset.tabId = tabId;
  webviewElement.src = url;

  tabBar.insertBefore(tabElement, addTabBtn);
  webviewContainer.appendChild(webviewElement);
  
  const tabData = { id: tabId, title: '加载中...', element: tabElement, webview: webviewElement };
  tabs.push(tabData);
  
  tabElement.addEventListener('click', () => switchToTab(tabId));
  tabElement.querySelector('.tab-close-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    closeTab(tabId);
  });
  
  webviewElement.addEventListener('dom-ready', () => {
    webviewElement.addEventListener('page-title-updated', (e) => {
      tabData.title = e.title;
      tabElement.querySelector('.tab-title').textContent = e.title;
      tabElement.querySelector('.tab-title').title = e.title;
    });
    if (tabId === activeTabId) updateNavState();
  });

  webviewElement.addEventListener('did-finish-load', () => {
    if (tabId === activeTabId) updateNavState();
    const newTitle = webviewElement.getTitle();
    tabData.title = newTitle;
    tabElement.querySelector('.tab-title').textContent = newTitle;
    tabElement.querySelector('.tab-title').title = newTitle;
  });

  switchToTab(tabId);
}

function switchToTab(tabId) {
    if (!tabs.find(t => t.id === tabId)) return;
    if (activeTabId) {
        const oldTab = tabs.find(t => t.id === activeTabId);
        if (oldTab) {
            oldTab.element.classList.remove('active');
            oldTab.webview.classList.remove('active');
        }
    }
    const newTab = tabs.find(t => t.id === tabId);
    newTab.element.classList.add('active');
    newTab.webview.classList.add('active');
    activeTabId = tabId;
    updateNavState();
}

function closeTab(tabId) {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;
    const tabData = tabs[tabIndex];
    tabData.element.remove();
    tabData.webview.remove();
    tabs.splice(tabIndex, 1);
    if (activeTabId === tabId) {
        if (tabs.length > 0) {
            switchToTab(tabs[Math.max(0, tabIndex - 1)].id);
        } else {
            window.electronAPI.close();
        }
    }
}

function getActiveTab() {
    if (!activeTabId) return null;
    return tabs.find(t => t.id === activeTabId);
}

function updateNavState() {
    const activeTab = getActiveTab();
    if (!activeTab || !activeTab.webview.getURL) {
        addressBar.value = '';
        backBtn.disabled = true;
        forwardBtn.disabled = true;
        reloadBtn.disabled = true;
        return;
    }
    try {
        addressBar.value = activeTab.webview.getURL();
        backBtn.disabled = !activeTab.webview.canGoBack();
        forwardBtn.disabled = !activeTab.webview.canGoForward();
    } catch (error) {
        console.warn('Could not update nav state:', error);
    }
}

addressBar.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const activeTab = getActiveTab();
        if (activeTab) {
            let input = addressBar.value.trim();
            if (input) {
                let url;
                if ((input.includes('.') && !input.includes(' ')) || input.startsWith('localhost')) {
                    url = input.startsWith('http') ? input : `http://${input}`;
                } else {
                    const currentEngine = await window.electronAPI.getCurrentSearchEngine();
                    url = currentEngine.url.replace('{s}', encodeURIComponent(input));
                }
                activeTab.webview.loadURL(url);
            }
        }
    }
});

backBtn.addEventListener('click', () => getActiveTab()?.webview.goBack());
forwardBtn.addEventListener('click', () => getActiveTab()?.webview.goForward());
reloadBtn.addEventListener('click', () => getActiveTab()?.webview.reload());

addTabBtn.addEventListener('click', async () => {
    const currentEngine = await window.electronAPI.getCurrentSearchEngine();
    createNewTab(currentEngine.homeUrl);
});

// --- 主题切换逻辑 ---
async function setupTheme() {
    const savedTheme = await window.electronAPI.getTheme();
    document.body.dataset.theme = savedTheme;
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    if (theme === 'dark') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline';
    } else {
        moonIcon.style.display = 'inline';
        sunIcon.style.display = 'none';
    }
}

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.body.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = newTheme;
    window.electronAPI.setTheme(newTheme);
    updateThemeIcons(newTheme);
});

// --- 窗口控制按钮事件 ---
const minimizeBtn = document.getElementById('minimize-btn');
const maximizeBtn = document.getElementById('maximize-btn');
const closeBtn = document.getElementById('close-btn');
minimizeBtn.addEventListener('click', () => window.electronAPI.minimize());
maximizeBtn.addEventListener('click', () => window.electronAPI.maximize());
closeBtn.addEventListener('click', () => window.electronAPI.close());

const maximizeIcon = maximizeBtn.querySelector('.icon-maximize');
const restoreIcon = maximizeBtn.querySelector('.icon-restore');
window.electronAPI.onWindowMaximized(() => {
  maximizeIcon.style.display = 'none';
  restoreIcon.style.display = 'inline';
});
window.electronAPI.onWindowUnmaximized(() => {
  maximizeIcon.style.display = 'inline';
  restoreIcon.style.display = 'none';
});

// --- 初始化逻辑 ---
let initialTabCreated = false;

window.electronAPI.onLoadInitialURL((url) => {
    if (!initialTabCreated) {
        createNewTab(url);
        initialTabCreated = true;
    }
});

setTimeout(() => {
    if (!initialTabCreated) {
        createNewTab('https://www.google.com');
        initialTabCreated = true;
    }
}, 500);

setupTheme(); // 在初始化最后调用