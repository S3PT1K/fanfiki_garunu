
    let allFanfics = [];
    let currentMode = 'list';
    let currentFanficId = null;

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

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

    function renderFanficList() {
        if (!allFanfics || allFanfics.length === 0) {
            return `<div style="padding:20px;">😢 Пока нет фанфиков. Создай первый на странице "Create"!</div>`;
        }
        let html = `<div id="fanficsListContainer">`;
        for (let i = 0; i < allFanfics.length; i++) {
            const f = allFanfics[i];
            const fanficId = f.id ?? i;
            html += `
                <div class="fanfic-item">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap;">
                        <div style="flex:1; min-width: 0;">
                            <h3>📌 ${escapeHtml(f.title)}</h3>
                            <p>✍️ <strong>Автор:</strong> ${escapeHtml(f.author)} &nbsp;|&nbsp; 🕒 ${escapeHtml(f.created_at) || 'дата неизвестна'}</p>
                            <p style="margin-top:10px; line-height:1.4;">
                                ${escapeHtml(f.content ? f.content.substring(0, 300) : '')}${f.content && f.content.length > 300 ? '...' : ''}
                            </p>
                        </div>
                        <div style="margin-left:15px; flex-shrink: 0;">
                            <button onclick="openFanficReader(${fanficId})" 
                                    style="padding:8px 20px; background-color:#4a2a2a; color:white; border:none; border-radius:5px; cursor:pointer;">
                                📖 Читать фанфик
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
        html += `</div>`;
        return html;
    }

    function renderFullFanfic(fanficId) {
        const fanfic = allFanfics.find((f, idx) => (f.id ?? idx) == fanficId);
        if (!fanfic) {
            return `<div style="padding:40px; text-align:center;">❌ Фанфик не найден.<br><button class="back-button" onclick="openListMode()">Вернуться к списку</button></div>`;
        }
        return `
            <div class="reading-mode">
                <button class="back-button" onclick="openListMode()">← Назад к списку</button>
                <div class="fanfic-full-title">
                    <h2>${escapeHtml(fanfic.title)}</h2>
                </div>
                <div class="fanfic-meta">
                    ✍️ Автор: ${escapeHtml(fanfic.author)} &nbsp;|&nbsp;
                    🕒 ${escapeHtml(fanfic.created_at) || 'дата не указана'}
                </div>
                <div class="fanfic-content">
                    ${escapeHtml(fanfic.content) || '<em>Текст отсутствует</em>'}
                </div>
                <hr style="margin:30px 0 10px;">
                <button class="back-button" onclick="openListMode()">📚 Ко всем фанфикам</button>
            </div>
        `;
    }

    async function renderByMode() {
        const container = document.getElementById('dynamicContent');
        if (!container) return;
        
        if (allFanfics.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px;">⏳ Загрузка произведений...</div>';
            try {
                if (typeof getFanfics !== 'function') throw new Error('getFanfics не определена');
                allFanfics = await getFanfics();
                if (!Array.isArray(allFanfics)) allFanfics = [];
            } catch(e) {
                console.error(e);
                container.innerHTML = '<div style="color:red; padding:20px;">❌ Не удалось загрузить фанфики. Проверьте сервер (localhost:8080) и наличие outer.js</div>';
                return;
            }
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const fanficIdFromUrl = urlParams.get('id');
        
        if (fanficIdFromUrl !== null && allFanfics.length > 0) {
            currentMode = 'read';
            currentFanficId = fanficIdFromUrl;
            container.innerHTML = renderFullFanfic(fanficIdFromUrl);
        } else {
            currentMode = 'list';
            currentFanficId = null;
            container.innerHTML = renderFanficList();
        }
    }

    function initNavigation() {
        const mainBtn = document.getElementById('navMainBtn');
        const backBtn = document.getElementById('navBackBtn');
        if (mainBtn) {
            mainBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openListMode();
            });
        }
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openListMode();
            });
        }
        window.addEventListener('popstate', () => {
            renderByMode();
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        initNavigation();
        await renderByMode();
    });