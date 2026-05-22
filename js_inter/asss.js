
// ── Состояние ────────────────────────────────────────────────────────────────
let allFanfics      = [];   // все фанфики с сервера
let filteredFanfics = [];   // после применения фильтра
let activeTagFilter = null; // кликнутый тег-чип (или null)

// ── Утилиты ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#39;');
}

/** Переводит \n в <br> ПОСЛЕ экранирования */
function formatContent(str) {
    if (!str) return '<em style="color:#999;">Текст отсутствует</em>';
    return escapeHtml(str).replace(/\n/g, '<br>');
}

// ── Тема ─────────────────────────────────────────────────────────────────────

function applyThemeFromStorage() {
    const saved = localStorage.getItem('preferred-theme') || 'light';
    document.body.classList.toggle('dark-theme', saved === 'dark');
    updateThemeButtons(saved);
}

/** Вызывается кнопками ☀️ / 🌙 */
window.setTheme = function(theme) {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('preferred-theme', theme);
    updateThemeButtons(theme);
};

function updateThemeButtons(theme) {
    document.querySelector('.theme-btn--light')?.classList.toggle('active', theme === 'light');
    document.querySelector('.theme-btn--dark')?.classList.toggle('active',  theme === 'dark');
}

// ── Навигационная панель ──────────────────────────────────────────────────────

function initNavigationPanel() {
    const nav = document.querySelector('.nav-panel');
    if (!nav || nav.dataset.initialized) return;
    nav.dataset.initialized = 'true';

    const header   = document.querySelector('.header');
    const mainPanel = document.querySelector('.main-panel');
    const hHeight  = header ? header.offsetHeight : 0;

    // Стилизуем nav как fixed-панель
    Object.assign(nav.style, {
        position:   'fixed',
        top:        `${hHeight}px`,
        left:       '0',
        width:      '240px',
        height:     `calc(100vh - ${hHeight}px)`,
        transition: 'transform 0.3s ease',
        zIndex:     '999',
        transform:  'translateX(-100%)',
        overflowY:  'auto',
    });

    // Бургер
    const hamburger = document.createElement('div');
    hamburger.innerHTML  = '☰';
    hamburger.className  = 'hamburger-menu';
    document.body.appendChild(hamburger);

    if (mainPanel) mainPanel.style.transition = 'margin-left 0.3s ease';

    // Кнопка закрытия внутри панели
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '×';
    closeBtn.className = 'nav-close-btn';
    nav.insertBefore(closeBtn, nav.firstChild);

    // Открыть / закрыть
    const setNavState = (open) => {
        nav.style.transform        = open ? 'translateX(0)' : 'translateX(-100%)';
        hamburger.style.display    = open ? 'none' : 'block';
        document.body.style.overflow = open ? 'hidden' : '';
        if (mainPanel) mainPanel.style.marginLeft = open ? '240px' : '0';
    };

    hamburger.addEventListener('click', () => setNavState(true));
    closeBtn.addEventListener('click',  () => setNavState(false));

    // Клик вне панели — закрыть
    document.addEventListener('click', (e) => {
        if (
            nav.style.transform === 'translateX(0px)' &&
            !nav.contains(e.target) &&
            !hamburger.contains(e.target)
        ) {
            setNavState(false);
        }
    });

    // Маршрутизация кнопок
    const pageUrls = {
        main:     '/html/index.html',
        profile:  '/html/profile.html',
        create:   '/html/create.html',
        saves:    '/html/saves.html',
        settings: '/html/settings.html',
        rules:    '/html/rules.html',
        faq:      '/html/FAQ.html',
    };

    nav.querySelectorAll('.buttons button').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            setNavState(false);
            if (page === 'back') {
                window.history.back();
            } else if (pageUrls[page]) {
                window.location.href = pageUrls[page];
            }
        });
    });
}

// ── Фильтрация ───────────────────────────────────────────────────────────────

/** Собирает уникальные теги из всех фанфиков */
function extractTags(fanfics) {
    const set = new Set();
    fanfics.forEach(f => {
        if (!f.categories) return;
        // Поддерживаем запятую, точку с запятой и слэш как разделители
        f.categories.split(/[,;/]/).forEach(t => {
            const trimmed = t.trim();
            if (trimmed) set.add(trimmed);
        });
    });
    return [...set].sort();
}

/** Отрисовывает чипы популярных тегов под строкой поиска */
function renderTagChips(fanfics) {
    const row = document.getElementById('activeTagsRow');
    if (!row) return;

    const tags = extractTags(fanfics).slice(0, 20); // до 20 тегов
    if (!tags.length) { row.innerHTML = ''; return; }

    row.innerHTML = tags.map(tag => `
        <span class="tag-chip" data-tag="${escapeHtml(tag)}" onclick="filterByTag('${escapeHtml(tag).replace(/'/g, "\\'")}')">
            🏷️ ${escapeHtml(tag)} <span class="chip-x">×</span>
        </span>
    `).join('');
}

/** Клик по тегу-чипу */
window.filterByTag = function(tag) {
    const input = document.getElementById('filterInput');
    const sel   = document.getElementById('filterField');
    if (!input || !sel) return;

    if (activeTagFilter === tag) {
        // Повторный клик — сброс тега
        activeTagFilter = null;
        input.value = '';
        sel.value = 'all';
    } else {
        activeTagFilter = tag;
        input.value = tag;
        sel.value   = 'categories';
    }
    highlightActiveChip();
    applyFilter();
};

function highlightActiveChip() {
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.style.opacity    = (!activeTagFilter || chip.dataset.tag === activeTagFilter) ? '1' : '0.45';
        chip.style.fontWeight = chip.dataset.tag === activeTagFilter ? 'bold' : 'normal';
    });
}

/** Основная функция фильтра — вызывается при вводе текста или смене поля */
window.applyFilter = function() {
    const query = (document.getElementById('filterInput')?.value || '').trim().toLowerCase();
    const field = document.getElementById('filterField')?.value || 'all';

    if (!query) {
        filteredFanfics = [...allFanfics];
        activeTagFilter = null;
        highlightActiveChip();
    } else {
        filteredFanfics = allFanfics.filter(f => {
            if (field === 'title')      return (f.title      || '').toLowerCase().includes(query);
            if (field === 'author')     return (f.author     || '').toLowerCase().includes(query);
            if (field === 'categories') return (f.categories || '').toLowerCase().includes(query);
            if (field === 'content')    return (f.content    || '').toLowerCase().includes(query);
            // 'all' — ищем везде
            return [f.title, f.author, f.categories, f.content]
                .some(v => (v || '').toLowerCase().includes(query));
        });
    }

    renderFanficList();
    updateFilterCount();
};

window.clearFilter = function() {
    const input = document.getElementById('filterInput');
    const sel   = document.getElementById('filterField');
    if (input) input.value = '';
    if (sel)   sel.value   = 'all';
    activeTagFilter = null;
    highlightActiveChip();
    filteredFanfics = [...allFanfics];
    renderFanficList();
    updateFilterCount();
};

function updateFilterCount() {
    // Показываем счётчик только если идёт фильтрация
    const input = document.getElementById('filterInput');
    const query = (input?.value || '').trim();
    const row   = document.getElementById('activeTagsRow');
    if (!row) return;

    // Ищем существующий счётчик
    let counter = document.getElementById('filterCounter');
    if (!counter) {
        counter = document.createElement('div');
        counter.id        = 'filterCounter';
        counter.className = 'filter-count';
        row.parentNode.insertBefore(counter, row.nextSibling);
    }

    if (query) {
        counter.textContent = `Найдено: ${filteredFanfics.length} из ${allFanfics.length}`;
    } else {
        counter.textContent = '';
    }
}

// ── Навигация через URL ───────────────────────────────────────────────────────

function openFanficReader(fanficId) {
    const url = new URL(window.location);
    url.searchParams.set('id', fanficId);
    window.history.pushState({}, '', url);
    renderByMode();
}

function openListMode() {
    const url = new URL(window.location);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url);
    renderByMode();
}

// ── Рендер списка ─────────────────────────────────────────────────────────────

function renderFanficList() {
    const container = document.getElementById('dynamicContent');
    if (!container) return;

    const list = filteredFanfics.length ? filteredFanfics : (
        document.getElementById('filterInput')?.value.trim()
            ? [] // поиск не дал результатов
            : allFanfics
    );

    if (!list.length) {
        const query = (document.getElementById('filterInput')?.value || '').trim();
        container.innerHTML = `<div class="empty-state">
            ${query
                ? `🔍 По запросу «${escapeHtml(query)}» ничего не найдено.`
                : '😢 Пока нет фанфиков. Создай первый на странице «Create»!'
            }
        </div>`;
        return;
    }

    let html = '<div id="fanficsListContainer">';

    list.forEach((f, i) => {
        const fanficId = f.id ?? i;
        const preview  = escapeHtml(f.content ? f.content.substring(0, 300) : '');
        const ellipsis = f.content && f.content.length > 300 ? '…' : '';

        html += `
            <div class="fanfic-item">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:10px;">
                    <div style="flex:1; min-width:0;">
                        <h3>📌 ${escapeHtml(f.title)}</h3>
                        <p>
                            ✍️ <strong>Автор:</strong> ${escapeHtml(f.author) || 'Anonymous'}
                            &nbsp;|&nbsp;
                            🕒 ${escapeHtml(f.created_at) || 'дата неизвестна'}
                            ${f.status ? `&nbsp;|&nbsp; 📋 <strong>Статус:</strong> ${escapeHtml(f.status)}` : ''}
                        </p>
                        ${f.categories ? `<p style="color:#7a5533; font-size:0.85rem;">🏷️ ${escapeHtml(f.categories)}</p>` : ''}
                        <p style="margin-top:8px; line-height:1.5; color:#555;">
                            ${preview}${ellipsis}
                        </p>
                    </div>
                    <div style="flex-shrink:0;">
                        <button
                            onclick="openFanficReader(${fanficId})"
                            style="padding:8px 20px; background:#4a2a2a; color:white; border:none; border-radius:5px; cursor:pointer; white-space:nowrap;">
                            📖 Читать фанфик
                        </button>
                    </div>
                </div>
            </div>`;
    });

    html += '</div>';
    container.innerHTML = html;
}

// ── Рендер полного фанфика ────────────────────────────────────────────────────

function renderFullFanfic(fanficId) {
    const fanfic = allFanfics.find((f, idx) => String(f.id ?? idx) === String(fanficId));

    if (!fanfic) {
        return `<div style="padding:40px; text-align:center;">
                    ❌ Фанфик не найден.<br><br>
                    <button class="back-button" onclick="openListMode()">← Вернуться к списку</button>
                </div>`;
    }

    const metaParts = [
        fanfic.author     ? `✍️ Автор: <strong>${escapeHtml(fanfic.author)}</strong>`  : '',
        fanfic.created_at ? `🕒 ${escapeHtml(fanfic.created_at)}`                      : '',
        fanfic.size       ? `📏 ${escapeHtml(fanfic.size)}`                            : '',
        fanfic.status     ? `📋 ${escapeHtml(fanfic.status)}`                          : '',
        fanfic.rating     ? `🔞 ${escapeHtml(fanfic.rating)}`                          : '',
    ].filter(Boolean).join(' &nbsp;|&nbsp; ');

    return `
        <div class="reading-mode">
            <button class="back-button" onclick="openListMode()">← Назад к списку</button>

            <div class="fanfic-full-title">
                <h2>${escapeHtml(fanfic.title)}</h2>
            </div>

            ${metaParts ? `<div class="fanfic-meta">${metaParts}</div>` : ''}

            ${fanfic.categories ? `
                <div class="fanfic-tags">
                    ${fanfic.categories.split(/[,;/]/).map(t => t.trim()).filter(Boolean).map(t =>
                        `<span class="tag-chip" style="cursor:default;">🏷️ ${escapeHtml(t)}</span>`
                    ).join(' ')}
                </div>` : ''}

            <div class="fanfic-content">
                ${formatContent(fanfic.content)}
            </div>

            <hr style="margin:30px 0 16px; border-color:#c3a078;">
            <button class="back-button" onclick="openListMode()">📚 Ко всем фанфикам</button>
        </div>`;
}

// ── Главная функция рендера ────────────────────────────────────────────────────

async function renderByMode() {
    const container  = document.getElementById('dynamicContent');
    const filterPanel = document.getElementById('filterPanel');
    if (!container) return;

    // Загружаем фанфики один раз
    if (!allFanfics.length) {
        container.innerHTML = '<div style="text-align:center; padding:40px;">⏳ Загрузка произведений…</div>';
        try {
            if (typeof getFanfics !== 'function') {
                throw new Error('getFanfics не определена. Убедитесь, что outer.js подключён первым.');
            }
            const result = await getFanfics();
            allFanfics      = Array.isArray(result) ? result : [];
            filteredFanfics = [...allFanfics];

            if (!allFanfics.length) {
                container.innerHTML = '<div class="empty-state">😢 Пока нет фанфиков.</div>';
                return;
            }

            // Рендерим теги после загрузки
            renderTagChips(allFanfics);

        } catch (e) {
            console.error('Ошибка загрузки фанфиков:', e);
            container.innerHTML = `<div style="color:red; padding:20px;">
                ❌ Не удалось загрузить фанфики.<br>
                Проверьте, запущен ли сервер на <strong>localhost:8080</strong>.<br>
                <small>${e.message}</small>
            </div>`;
            return;
        }
    }

    const fanficIdFromUrl = new URLSearchParams(window.location.search).get('id');

    if (fanficIdFromUrl !== null) {
        // Режим чтения: скрываем фильтр
        if (filterPanel) filterPanel.classList.add('hidden');
        container.innerHTML = renderFullFanfic(fanficIdFromUrl);
    } else {
        // Режим списка: показываем фильтр
        if (filterPanel) filterPanel.classList.remove('hidden');
        renderFanficList();
        updateFilterCount();
    }
}

// ── Инициализация ──────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Применяем тему из localStorage до рендера — без мигания
    applyThemeFromStorage();

    // 2. Реагируем на смену темы в других вкладках/окнах
    window.addEventListener('storage', (e) => {
        if (e.key === 'preferred-theme') {
            applyThemeFromStorage(); // уже вызывает updateThemeButtons
        }
    });

    // 3. Навигационная панель
    initNavigationPanel();

    // 4. Поддержка кнопок «назад/вперёд» браузера
    window.addEventListener('popstate', () => renderByMode());

    // 5. Загружаем контент
    await renderByMode();
});
