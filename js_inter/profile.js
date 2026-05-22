document.addEventListener('DOMContentLoaded', () => {
    // ─── Отображаем ник текущего пользователя везде ───────────────────────
    function refreshNickDisplays() {
        const nick = (typeof getCurrentUser === 'function' && getCurrentUser()) || '—';
        document.querySelectorAll('.nick, .profile-nickname').forEach(el => {
            el.textContent = nick;
        });
    }
    refreshNickDisplays();

    // ─── Helpers для text-nodes внутри <p> ────────────────────────────────
    function getSafeTextNode(parent) {
        const span = parent.querySelector('span');
        if (!span) return null;
        let node = span.nextSibling;
        while (node && node.nodeType !== Node.TEXT_NODE) node = node.nextSibling;
        if (!node) {
            node = document.createTextNode(' —');
            parent.appendChild(node);
        }
        return node;
    }

    const agePara  = document.querySelector('.profile-age');
    const genPara  = document.querySelector('.profile-gender');
    const bioPara  = document.querySelector('.profile-bio');
    if (!agePara || !genPara || !bioPara) return;

    const ageNode = getSafeTextNode(agePara);
    const genNode = getSafeTextNode(genPara);
    const bioNode = getSafeTextNode(bioPara);

    // Подгружаем ранее сохранённые значения
    ageNode.nodeValue = ' ' + (localStorage.getItem('profile-age')    || '—');
    genNode.nodeValue = ' ' + (localStorage.getItem('profile-gender')  || '—');
    bioNode.nodeValue = ' ' + (localStorage.getItem('profile-bio')     || '—');

    // ─── Модальное окно ───────────────────────────────────────────────────
    let modal = document.getElementById('editProfileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editProfileModal';
        modal.className = 'modal-container';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h3 style="margin:0 0 12px 0; color:#2c1810; font-size:1.3rem;">✏️ Edit Profile</h3>

                <label class="modal-label">Nickname:</label>
                <input type="text" id="inpNick" maxlength="32" placeholder="Your nickname">

                <label class="modal-label">Age:</label>
                <input type="number" id="inpAge" min="1" max="120">

                <label class="modal-label">Gender:</label>
                <select id="inpGen">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>

                <label class="modal-label">Theme:</label>
                <select id="inpTheme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>

                <label class="modal-label">Bio:</label>
                <textarea id="inpBio" rows="3" placeholder="Tell something about yourself..."></textarea>

                <div class="modal-buttons">
                    <button id="cancelBtn">Cancel</button>
                    <button id="saveBtn" class="save-btn">Save</button>
                </div>
                <div id="modalError" class="modal-error" style="display:none;"></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Инлайн-стили для модалки (совместимо с темой сайта)
        const style = document.createElement('style');
        style.textContent = `
            .modal-container {
                position: fixed; inset: 0;
                display: flex; align-items: center; justify-content: center;
                z-index: 9999;
            }
            .modal-overlay {
                position: absolute; inset: 0;
                background: rgba(0,0,0,.45);
            }
            .modal-content {
                position: relative; z-index: 1;
                background: blanchedalmond;
                border: 3px solid rgb(92,35,35);
                border-radius: 12px;
                padding: 28px 32px;
                width: 360px;
                max-width: 95vw;
                box-shadow: 0 8px 32px rgba(0,0,0,.3);
                font-family: 'Monotype Corsiva', cursive;
            }
            body.dark-theme .modal-content {
                background: #2d2d2d;
                border-color: #555;
                color: #e0e0e0;
            }
            body.dark-theme .modal-content h3 { color: #e0e0e0; }
            .modal-label {
                display: block;
                margin: 10px 0 4px;
                font-weight: bold;
                color: #4a2a2a;
                font-size: 1rem;
            }
            body.dark-theme .modal-label { color: #ccc; }
            .modal-content input[type="text"],
            .modal-content input[type="number"],
            .modal-content select,
            .modal-content textarea {
                width: 100%;
                padding: 7px 10px;
                border: 2px solid rgb(92,35,35);
                border-radius: 6px;
                font-size: 1rem;
                background: white;
                color: #2c1810;
                box-sizing: border-box;
            }
            body.dark-theme .modal-content input,
            body.dark-theme .modal-content select,
            body.dark-theme .modal-content textarea {
                background: #3a3a3a;
                color: #e0e0e0;
                border-color: #555;
            }
            .modal-buttons {
                display: flex;
                gap: 10px;
                margin-top: 18px;
                justify-content: flex-end;
            }
            .modal-buttons button {
                padding: 8px 20px;
                border-radius: 6px;
                border: none;
                font-size: 1rem;
                cursor: pointer;
                font-family: 'Monotype Corsiva', cursive;
            }
            .modal-buttons #cancelBtn {
                background: #ccc; color: #333;
            }
            .modal-buttons #cancelBtn:hover { background: #bbb; }
            .modal-buttons .save-btn {
                background: rgb(92,35,35); color: white;
            }
            .modal-buttons .save-btn:hover { background: brown; }
            .modal-error {
                margin-top: 10px;
                color: #c0392b;
                font-size: .9rem;
                text-align: center;
            }
        `;
        document.head.appendChild(style);
    }

    const inpNick  = document.getElementById('inpNick');
    const inpAge   = document.getElementById('inpAge');
    const inpGen   = document.getElementById('inpGen');
    const inpBio   = document.getElementById('inpBio');
    const inpTheme = document.getElementById('inpTheme');
    const modalErr = document.getElementById('modalError');

    // ─── Открытие модалки ─────────────────────────────────────────────────
    const changeBtn = document.querySelector('.edit-profile-btn');
    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            const curNick = (typeof getCurrentUser === 'function' && getCurrentUser()) || '';
            inpNick.value  = curNick;
            inpAge.value   = ageNode.nodeValue.replace('—','').trim();
            inpGen.value   = genNode.nodeValue.replace('—','').trim() || 'Male';
            inpBio.value   = bioNode.nodeValue.replace('—','').trim();
            inpTheme.value = localStorage.getItem('preferred-theme') || 'light';
            modalErr.style.display = 'none';
            modal.style.display = 'flex';
        });
    }

    // ─── Живое переключение темы ──────────────────────────────────────────
    inpTheme.addEventListener('change', (e) => {
        if (window.applyTheme) window.applyTheme(e.target.value);
        else {
            document.body.classList.toggle('dark-theme', e.target.value === 'dark');
            localStorage.setItem('preferred-theme', e.target.value);
        }
    });

    // ─── Сохранение ───────────────────────────────────────────────────────
    document.getElementById('saveBtn').addEventListener('click', async () => {
        const newNick = inpNick.value.trim();

        if (!newNick) {
            modalErr.textContent = '⚠️ Nickname cannot be empty.';
            modalErr.style.display = 'block';
            return;
        }
        if (newNick.length < 2) {
            modalErr.textContent = '⚠️ Nickname must be at least 2 characters.';
            modalErr.style.display = 'block';
            return;
        }

        // Если ник изменился — обновляем на сервере (если есть такая функция)
        const oldNick = (typeof getCurrentUser === 'function' && getCurrentUser()) || '';
        if (newNick !== oldNick) {
            if (typeof updateNickname === 'function') {
                const res = await updateNickname(newNick);
                if (res && res.status === 'error') {
                    modalErr.textContent = '❌ ' + (res.message || 'Failed to update nickname.');
                    modalErr.style.display = 'block';
                    return;
                }
            } else {
                // Фолбэк: просто пишем в localStorage
                localStorage.setItem('currentUser', newNick);
                if (typeof currentUser !== 'undefined') window.currentUser = newNick;
            }
        }

        // Сохраняем остальные поля
        ageNode.nodeValue = ' ' + (inpAge.value || '—');
        genNode.nodeValue = ' ' + (inpGen.value || '—');
        bioNode.nodeValue = ' ' + (inpBio.value || '—');
        localStorage.setItem('profile-age',    inpAge.value || '');
        localStorage.setItem('profile-gender', inpGen.value || '');
        localStorage.setItem('profile-bio',    inpBio.value || '');

        // Обновляем ник везде на странице
        refreshNickDisplays();

        modal.style.display = 'none';
        modalErr.style.display = 'none';
    });

    // ─── Закрытие ─────────────────────────────────────────────────────────
    document.getElementById('cancelBtn').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        modal.style.display = 'none';
    });
});

// ─── Расширяем переводы ───────────────────────────────────────────────────
window.translations = {
    ...window.translations,
    en: { ...(window.translations?.en || {}), "profile-nick":"Nick","nav-main":"Main","nav-profile":"Profile","nav-create":"Create","nav-saves":"Saves","nav-settings":"Settings","nav-rules":"Rules","nav-faq":"FAQ","nav-back":"← Back","profile-change":"Change","profile-age":"Age:","profile-gender":"Gender:","profile-bio":"Bio:","profile-myfanfics":"My fanfics","profile-regdate":"Registration date:","profile-totalfanfics":"Total fanfics:","profile-totalcomments":"Total comments:" },
    ru: { ...(window.translations?.ru || {}), "profile-nick":"Ник","nav-main":"Главная","nav-profile":"Профиль","nav-create":"Создать","nav-saves":"Сохраненное","nav-settings":"Настройки","nav-rules":"Правила","nav-faq":"ЧаВо","nav-back":"← Назад","profile-change":"Изменить","profile-age":"Возраст:","profile-gender":"Пол:","profile-bio":"Обо мне:","profile-myfanfics":"Мои фанфики","profile-regdate":"Дата регистрации:","profile-totalfanfics":"Всего фанфиков:","profile-totalcomments":"Всего комментариев:" },
    es: { ...(window.translations?.es || {}), "profile-nick":"Apodo","nav-main":"Principal","nav-profile":"Perfil","nav-create":"Crear","nav-saves":"Guardados","nav-settings":"Ajustes","nav-rules":"Reglas","nav-faq":"FAQ","nav-back":"← Atrás","profile-change":"Cambiar" },
    fr: { ...(window.translations?.fr || {}), "profile-nick":"Pseudo","nav-main":"Accueil","nav-profile":"Profil","nav-create":"Créer","nav-saves":"Sauvegardes","nav-settings":"Paramètres","nav-rules":"Règles","nav-faq":"FAQ","nav-back":"← Retour","profile-change":"Modifier" },
    ja: { ...(window.translations?.ja || {}), "profile-nick":"ニックネーム","nav-main":"メイン","nav-profile":"プロフィール","nav-create":"作成","nav-saves":"保存済み","nav-settings":"設定","nav-rules":"ルール","nav-faq":"FAQ","nav-back":"← 戻る","profile-change":"変更" }
};