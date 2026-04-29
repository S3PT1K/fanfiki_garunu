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