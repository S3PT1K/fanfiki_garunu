window.translations = {
    en: {
        'profile-nick': 'Nick',
        'nav-main': 'Main',
        'nav-profile': 'Profile',
        'nav-create': 'Create',
        'nav-saves': 'Saves',
        'nav-settings': 'Settings',
        'nav-rules': 'Rules',
        'nav-faq': 'FAQ',
        'nav-back': '← Back',
        'settings-title': 'Settings',
        'theme-label': 'Theme:',
        'theme-light': 'Light',
        'theme-dark': 'Dark',
        'font-size-label': 'Font size:',
        'font-small': 'Small',
        'font-medium': 'Medium',
        'font-large': 'Large',
        'mature-content': 'Show mature content',
        'font-style-label': 'Font style:',
        'language-label': 'Language:',
        'save-btn': 'Save Settings',
        'genres': 'Genres',
        'sizes': 'Sizes',
        'features': 'Features',
        'age-ratings': 'Age ratings',
        'status': 'Status',
        'date': 'Date',
        'search-placeholder': 'search..'
    },
    ru: {
        'profile-nick': 'Ник',
        'nav-main': 'Главная',
        'nav-profile': 'Профиль',
        'nav-create': 'Создать',
        'nav-saves': 'Сохраненное',
        'nav-settings': 'Настройки',
        'nav-rules': 'Правила',
        'nav-faq': 'ЧаВо',
        'nav-back': '← Назад',
        'settings-title': 'Настройки',
        'theme-label': 'Тема:',
        'theme-light': 'Светлая',
        'theme-dark': 'Темная',
        'font-size-label': 'Размер шрифта:',
        'font-small': 'Маленький',
        'font-medium': 'Средний',
        'font-large': 'Большой',
        'mature-content': 'Показывать контент 18+',
        'font-style-label': 'Стиль шрифта:',
        'language-label': 'Язык:',
        'save-btn': 'Сохранить настройки',
        'genres': 'Жанры',
        'sizes': 'Размеры',
        'features': 'Особенности',
        'age-ratings': 'Возрастные рейтинги',
        'status': 'Статус',
        'date': 'Дата',
        'search-placeholder': 'поиск..'
    },
    es: {
        'profile-nick': 'Apodo',
        'nav-main': 'Principal',
        'nav-profile': 'Perfil',
        'nav-create': 'Crear',
        'nav-saves': 'Guardados',
        'nav-settings': 'Ajustes',
        'nav-rules': 'Reglas',
        'nav-faq': 'FAQ',
        'nav-back': '← Atrás',
        'settings-title': 'Ajustes',
        'theme-label': 'Tema:',
        'theme-light': 'Claro',
        'theme-dark': 'Oscuro',
        'font-size-label': 'Tamaño de fuente:',
        'font-small': 'Pequeño',
        'font-medium': 'Mediano',
        'font-large': 'Grande',
        'mature-content': 'Mostrar contenido maduro',
        'font-style-label': 'Estilo de fuente:',
        'language-label': 'Idioma:',
        'save-btn': 'Guardar ajustes',
        'genres': 'Géneros',
        'sizes': 'Tamaños',
        'features': 'Características',
        'age-ratings': 'Clasificaciones por edad',
        'status': 'Estado',
        'date': 'Fecha',
        'search-placeholder': 'buscar..'
    },
    fr: {
        'profile-nick': 'Pseudo',
        'nav-main': 'Accueil',
        'nav-profile': 'Profil',
        'nav-create': 'Créer',
        'nav-saves': 'Sauvegardes',
        'nav-settings': 'Paramètres',
        'nav-rules': 'Règles',
        'nav-faq': 'FAQ',
        'nav-back': '← Retour',
        'settings-title': 'Paramètres',
        'theme-label': 'Thème:',
        'theme-light': 'Clair',
        'theme-dark': 'Sombre',
        'font-size-label': 'Taille de police:',
        'font-small': 'Petite',
        'font-medium': 'Moyenne',
        'font-large': 'Grande',
        'mature-content': 'Afficher le contenu mature',
        'font-style-label': 'Style de police:',
        'language-label': 'Langue:',
        'save-btn': 'Enregistrer',
        'genres': 'Genres',
        'sizes': 'Tailles',
        'features': 'Caractéristiques',
        'age-ratings': 'Classifications par âge',
        'status': 'Statut',
        'date': 'Date',
        'search-placeholder': 'chercher..'
    },
    ja: {
        'profile-nick': 'ニックネーム',
        'nav-main': 'メイン',
        'nav-profile': 'プロフィール',
        'nav-create': '作成',
        'nav-saves': '保存済み',
        'nav-settings': '設定',
        'nav-rules': 'ルール',
        'nav-faq': 'FAQ',
        'nav-back': '← 戻る',
        'settings-title': '設定',
        'theme-label': 'テーマ:',
        'theme-light': 'ライト',
        'theme-dark': 'ダーク',
        'font-size-label': 'フォントサイズ:',
        'font-small': '小',
        'font-medium': '中',
        'font-large': '大',
        'mature-content': '成人向けコンテンツを表示',
        'font-style-label': 'フォントスタイル:',
        'language-label': '言語:',
        'save-btn': '設定を保存',
        'genres': 'ジャンル',
        'sizes': 'サイズ',
        'features': '特徴',
        'age-ratings': '年齢制限',
        'status': 'ステータス',
        'date': '日付',
        'search-placeholder': '検索..'
    }
};

// Функция применения языка (теперь с поддержкой placeholder)
function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
                // Для полей ввода не меняем текст
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Обработка placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // Обновляем опции селектов
    document.querySelectorAll('select option').forEach(option => {
        const i18nKey = option.getAttribute('data-i18n');
        if (i18nKey && translations[lang] && translations[lang][i18nKey]) {
            option.textContent = translations[lang][i18nKey];
        }
    });
    
    localStorage.setItem('preferred-language', lang);
}

function loadSettingsForm() {
    const savedTheme = localStorage.getItem('preferred-theme') || 'light';
    const savedFontSize = localStorage.getItem('preferred-font-size') || 'medium';
    const savedFontStyle = localStorage.getItem('preferred-font-style') || 'Monotype Corsiva';
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    const savedMature = localStorage.getItem('show-mature-content') === 'true';

    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('fontSizeSelect').value = savedFontSize;
    document.getElementById('fontStyleSelect').value = savedFontStyle;
    document.getElementById('languageSelect').value = savedLanguage;
    document.getElementById('matureContentCheckbox').checked = savedMature;
}

function saveSettings() {
    const theme = document.getElementById('themeSelect').value;
    const fontSize = document.getElementById('fontSizeSelect').value;
    const fontStyle = document.getElementById('fontStyleSelect').value;
    const language = document.getElementById('languageSelect').value;
    const showMature = document.getElementById('matureContentCheckbox').checked;

    applyTheme(theme);
    applyFontSize(fontSize);
    applyFontStyle(fontStyle);
    applyLanguage(language);
    applyMatureContent(showMature);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettingsForm();
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
});

// Функция применения темы
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('preferred-theme', theme);
}

// Функция применения размера шрифта
function applyFontSize(size) {
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
    localStorage.setItem('preferred-font-size', size);
}

// Функция применения стиля шрифта
function applyFontStyle(style) {
    document.body.style.fontFamily = style;
    localStorage.setItem('preferred-font-style', style);
}

// Функция применения настроек показа контента 18+
function applyMatureContent(show) {
    localStorage.setItem('show-mature-content', show);
}

// Загрузка сохраненных настроек
function loadSettings() {
    const savedTheme = localStorage.getItem('preferred-theme') || 'light';
    const savedFontSize = localStorage.getItem('preferred-font-size') || 'medium';
    const savedFontStyle = localStorage.getItem('preferred-font-style') || 'Monotype Corsiva';
    const savedLanguage = localStorage.getItem('preferred-language') || 'en';
    const savedMatureContent = localStorage.getItem('show-mature-content') === 'true';
    
    // Устанавливаем значения в селекты
    document.getElementById('themeSelect').value = savedTheme;
    document.getElementById('fontSizeSelect').value = savedFontSize;
    document.getElementById('fontStyleSelect').value = savedFontStyle;
    document.getElementById('languageSelect').value = savedLanguage;
    document.getElementById('matureContentCheckbox').checked = savedMatureContent;
    
    // Применяем настройки
    applyTheme(savedTheme);
    applyFontSize(savedFontSize);
    applyFontStyle(savedFontStyle);
    applyLanguage(savedLanguage);
    applyMatureContent(savedMatureContent);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);
    

    window.applyTheme = applyTheme;
    window.applyFontSize = applyFontSize;
    window.applyFontStyle = applyFontStyle;
    window.applyLanguage = applyLanguage;
    window.applyMatureContent = applyMatureContent;
});
