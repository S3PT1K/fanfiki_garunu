(function() {
    const STORAGE_KEYS = {
        theme: 'preferred-theme',
        size: 'preferred-font-size',
        style: 'preferred-font-style',
        lang: 'preferred-language',
        mature: 'show-mature-content'
    };

    window.applyTheme = (theme) => {
        document.body.classList.toggle('dark-theme', theme === 'dark');
        localStorage.setItem(STORAGE_KEYS.theme, theme);
    };

    window.applyFontSize = (size) => {
        document.body.classList.remove('font-small', 'font-medium', 'font-large');
        document.body.classList.add(`font-${size}`);
        localStorage.setItem(STORAGE_KEYS.size, size);
    };

    window.applyFontStyle = (style) => {
        document.body.style.fontFamily = style;
        localStorage.setItem(STORAGE_KEYS.style, style);
    };

    window.applyLanguage = (lang) => {
        if (!window.translations?.[lang]) return;
        const dict = window.translations[lang];

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const translation = dict[el.getAttribute('data-i18n')];
            if (!translation) return;
            if (el.tagName === 'OPTION') el.textContent = translation;
            else if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(el.tagName)) el.textContent = translation;
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const translation = dict[el.getAttribute('data-i18n-placeholder')];
            if (translation) el.placeholder = translation;
        });

        localStorage.setItem(STORAGE_KEYS.lang, lang);
    };

    function initFilterButtons() {
        const selectors = [
            '.category-first-str', '.category-second-str', '.category-third-str', 
            '.category-fourth-str', '.category-sizes', '.category-features', 
            '.category-age-ratings', '.status', '.date'
        ];

        selectors.forEach(sel => {
            const container = document.querySelector(sel);
            if (!container) return;
            
            container.querySelectorAll('button').forEach((btn, idx) => {
                const catName = sel.replace('.', '').split('-')[0];
                btn.setAttribute('data-filter-id', `${catName}-${idx}`);
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    btn.classList.toggle('active');
                    const active = Array.from(document.querySelectorAll('button.active'))
                        .map(b => b.getAttribute('data-filter-id'));
                    localStorage.setItem('activeFilters', JSON.stringify(active));
                });
            });
        });

        const saved = JSON.parse(localStorage.getItem('activeFilters') || '[]');
        saved.forEach(id => {
            const btn = document.querySelector(`[data-filter-id="${id}"]`);
            if (btn) btn.classList.add('active');
        });
    }

    function initNavigationPanel() {
        const nav = document.querySelector('.nav-panel');
        if (!nav || nav.dataset.initialized) return;
        nav.dataset.initialized = 'true';

        const header = document.querySelector('.site-header, header, .header, .app-header');
        const content = document.querySelector('.site-content, main, .content, .main-panel, .main');
        const hHeight = header ? header.offsetHeight : 0;

        const hamburger = document.createElement('div');
        hamburger.innerHTML = '☰';
        hamburger.className = 'hamburger-menu';
        Object.assign(hamburger.style, {
            fontSize: '30px', cursor: 'pointer', position: 'fixed',
            top: '20px', left: '20px', zIndex: '1002',
            background: 'rgba(0,0,0,0.1)', padding: '5px 15px', borderRadius: '5px'
        });

        Object.assign(nav.style, {
            position: 'fixed', top: `${hHeight}px`, left: '0',
            width: '250px', height: `calc(100vh - ${hHeight}px)`,
            background: 'blanchedalmond', transition: 'transform 0.3s ease',
            zIndex: '999', transform: 'translateX(-100%)', overflowY: 'auto'
        });

        document.body.appendChild(hamburger);
        if (content) content.style.transition = 'margin-left 0.3s ease';

        const setNavState = (open) => {
            nav.style.transform = open ? 'translateX(0)' : 'translateX(-100%)';
            if (content) content.style.marginLeft = open ? '250px' : '0';
            else document.body.style.marginLeft = open ? '250px' : '0';
            hamburger.style.display = open ? 'none' : 'block';
            document.body.style.overflow = open ? 'hidden' : 'auto';
        };

        hamburger.addEventListener('click', () => setNavState(true));

        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !hamburger.contains(e.target) && nav.style.transform === 'translateX(0px)') {
                setNavState(false);
            }
        });

        const closeBtn = document.createElement('div');
        closeBtn.innerHTML = '×';
        Object.assign(closeBtn.style, {
            fontSize: '30px', cursor: 'pointer', position: 'absolute',
            top: '10px', right: '10px', width: '30px', height: '30px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ff0000', color: 'white', borderRadius: '50%'
        });
        closeBtn.addEventListener('click', () => setNavState(false));
        nav.appendChild(closeBtn);

        const pageUrls = {
            main: 'index.html', profile: 'profile.html', create: 'create.html',
            saves: 'saves.html', settings: 'settings.html', rules: 'rules.html', faq: 'FAQ.html'
        };

        nav.querySelectorAll('.buttons button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const page = btn.dataset.page;
                setNavState(false);
                if (page === 'back') window.history.back();
                else if (pageUrls[page]) window.location.href = pageUrls[page];
            });
        });
    }

    function loadSettings() {
        applyTheme(localStorage.getItem(STORAGE_KEYS.theme) || 'light');
        applyFontSize(localStorage.getItem(STORAGE_KEYS.size) || 'medium');
        applyFontStyle(localStorage.getItem(STORAGE_KEYS.style) || 'Monotype Corsiva');
        
        const lang = localStorage.getItem(STORAGE_KEYS.lang) || 'en';
        if (window.translations) applyLanguage(lang);

        const ids = ['themeSelect', 'fontSizeSelect', 'fontStyleSelect', 'languageSelect'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = localStorage.getItem(STORAGE_KEYS[id.replace('Select', '').toLowerCase()]) || el.value;
        });

        const mature = document.getElementById('matureContentCheckbox');
        if (mature) mature.checked = localStorage.getItem(STORAGE_KEYS.mature) === 'true';
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadSettings();
        initFilterButtons();
        initNavigationPanel();

        document.getElementById('saveSettingsBtn')?.addEventListener('click', () => {
            const theme = document.getElementById('themeSelect')?.value;
            const size = document.getElementById('fontSizeSelect')?.value;
            const style = document.getElementById('fontStyleSelect')?.value;
            const lang = document.getElementById('languageSelect')?.value;
            const mature = document.getElementById('matureContentCheckbox')?.checked;

            if (theme) applyTheme(theme);
            if (size) applyFontSize(size);
            if (style) applyFontStyle(style);
            if (lang) applyLanguage(lang);
            localStorage.setItem(STORAGE_KEYS.mature, mature);
        });

        document.querySelector('.LoginButton button')?.addEventListener('click', () => {
            window.location.href = 'authorization.html';
        });
    });
})();
// main.js (дополнение или замена существующего кода)

let allFanfics = []; // здесь будем хранить все загруженные фанфики

// Основная функция загрузки и отображения (расширенная)
async function loadAndDisplayFanfics() {
    const container = document.getElementById('fanficsContainer');
    if (!container) return;
    try {
        allFanfics = await getFanfics(); // получаем массив из outer.js
        if (!allFanfics || allFanfics.length === 0) {
            container.innerHTML = '<p>😢 Пока нет фанфиков. Создай первый на странице "Create"!</p>';
            return;
        }
        renderFanfics(allFanfics); // отрисовываем все
    } catch (error) {
        console.error('Ошибка загрузки фанфиков:', error);
        container.innerHTML = '<p>❌ Не удалось загрузить фанфики. Проверь, запущен ли сервер (localhost:8080).</p>';
    }
}

// Функция отрисовки массива фанфиков в контейнере
function renderFanfics(fanficsArray) {
    const container = document.getElementById('fanficsContainer');
    if (!container) return;

    if (!fanficsArray || fanficsArray.length === 0) {
        container.innerHTML = '<p>🔍 Ничего не найдено по вашему запросу.</p>';
        return;
    }

    let html = '';
    fanficsArray.forEach((f, index) => {
        const fanficId = f.id || index;
        html += `
            <div class="fanfic-item" style="border-bottom: 2px solid brown; padding: 15px 0; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                    <div style="flex: 1;">
                        <h3 style="margin: 0 0 5px 0; color: #4a2a2a;">📌 ${escapeHtml(f.title)}</h3>
                        <p style="margin: 5px 0; color: #666;">
                            ✍️ <strong>Автор:</strong> ${escapeHtml(f.author)} &nbsp;|&nbsp;
                            🕒 ${escapeHtml(f.created_at) || 'дата неизвестна'}
                        </p>
                        <p style="margin-top: 10px; line-height: 1.4;">
                            ${escapeHtml(f.content ? f.content.substring(0, 50) : '')}${f.content && f.content.length > 50 ? '...' : ''}
                        </p>
                    </div>
                    <div style="margin-left: 15px;">
                        <button onclick="goToFanfic(${fanficId}, '${escapeHtml(f.title).replace(/'/g, "\\'")}')" 
                                style="padding: 8px 20px; background-color: #4a2a2a; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">
                            📖 Читать фанфик
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// Функция поиска (вызывается по кнопке или Enter)
function performSearch() {
    const searchInput = document.querySelector('.search-placeholder');
    const searchMethod = document.querySelector('.search-method select');
    if (!searchInput || !searchMethod) return;

    const query = searchInput.value.trim().toLowerCase();
    const method = searchMethod.value; // "Name", "Character" или "Author"

    if (!allFanfics.length) {
        alert('Фанфики ещё не загружены. Попробуйте позже.');
        return;
    }

    const filtered = allFanfics.filter(fanfic => {
        if (!query) return true; // если поле пустое, показываем всё

        let fieldValue = '';
        if (method === 'Name') {
            fieldValue = (fanfic.title || '').toLowerCase();
        } else if (method === 'Author') {
            fieldValue = (fanfic.author || '').toLowerCase();
        } else if (method === 'Character') {
            // Предполагаем, что в объекте fanfic есть поле characters (строка или массив)
            const chars = fanfic.characters || '';
            fieldValue = Array.isArray(chars) ? chars.join(' ').toLowerCase() : chars.toLowerCase();
        }
        return fieldValue.includes(query);
    });

    renderFanfics(filtered);
}

// Вспомогательная функция экранирования HTML
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Функция перехода на страницу фанфика (уже есть, но продублируем для надёжности)
function goToFanfic(fanficId, fanficTitle) {
    window.location.href = `asss.html?id=${fanficId}`;
}

// Вешаем обработчики после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем и показываем фанфики
    loadAndDisplayFanfics();

    // Назначаем обработчик на кнопку поиска
    const searchButton = document.querySelector('.search-button');
    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }

    // Поиск по нажатию Enter в поле ввода
    const searchInputField = document.querySelector('.search-placeholder');
    if (searchInputField) {
        searchInputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }

    // Опционально: сброс поиска при очистке поля (показываем всё)
    if (searchInputField) {
        searchInputField.addEventListener('input', (e) => {
            if (e.target.value.trim() === '') {
                renderFanfics(allFanfics);
            }
        });
    }
});