const searchInput = document.getElementById('search-input');
const searchEngineSelect = document.getElementById('search-engine-select');
const searchEngineIcon = document.getElementById('search-engine-icon');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const moonIcon = themeToggleBtn.querySelector('.icon-moon');
const sunIcon = themeToggleBtn.querySelector('.icon-sun');

let currentSearchEngine = {};

function updateIcon(engine) {
    searchEngineIcon.src = `../../assets/icons/${engine.name}.png`;
    searchEngineIcon.alt = engine.name;
}

async function initializeSettings() {
    const engines = await window.electronAPI.getSearchEngines();
    currentSearchEngine = await window.electronAPI.getCurrentSearchEngine();

    engines.forEach(engine => {
        const option = document.createElement('option');
        option.value = engine.url;
        option.textContent = engine.name;
        searchEngineSelect.appendChild(option);
    });

    searchEngineSelect.value = currentSearchEngine.url;
    updateIcon(currentSearchEngine);
}

searchEngineSelect.addEventListener('change', async () => {
    const newSearchUrl = searchEngineSelect.value;
    window.electronAPI.setCurrentSearchEngine(newSearchUrl);
    currentSearchEngine = await window.electronAPI.getCurrentSearchEngine();
    updateIcon(currentSearchEngine);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            const finalUrl = currentSearchEngine.url.replace('{s}', encodeURIComponent(query));
            window.electronAPI.openSearchResults(finalUrl);
        }
    }
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


// --- 窗口控制按钮 ---
const minimizeBtn = document.getElementById('minimize-btn-hp');
const maximizeBtn = document.getElementById('maximize-btn-hp');
const closeBtn = document.getElementById('close-btn-hp');

minimizeBtn.addEventListener('click', () => window.electronAPI.minimize());
maximizeBtn.addEventListener('click', () => window.electronAPI.maximize());
closeBtn.addEventListener('click', () => window.electronAPI.close());

// --- 初始化 ---
initializeSettings();
setupTheme();