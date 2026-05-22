// Базовый URL сервера
const API_URL = 'http://localhost:8080/api';

// Текущий пользователь — читаем из localStorage сразу при загрузке
// Поддерживает как строку, так и старый формат объекта { nickname: '...' }
let currentUser = (() => {
    const stored = localStorage.getItem('currentUser');
    if (!stored) return null;
    try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
            const nick = parsed.nickname || null;
            localStorage.setItem('currentUser', nick ?? '');
            return nick;
        }
    } catch (e) {}
    return stored || null;
})();

// ─── API ──────────────────────────────────────────────────────────────────────

// Универсальная функция для запросов к серверу
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);
    try {
        const response = await fetch(API_URL + endpoint, options);
        return await response.json();
    } catch (error) {
        console.error('Ошибка запроса:', error);
        return { status: 'error', message: 'Сервер не отвечает' };
    }
}

// Получить список фанфиков
async function getFanfics() {
    return await apiRequest('/fanfics');
}

// Создать фанфик
// author необязателен — если не передан, берётся текущий пользователь
async function createFanfic(title, content, size = '', categories = '', features = '', rating = '', status = '', author = null) {
    author = author || getCurrentUser() || 'Anonymous';
    return await apiRequest('/fanfics', 'POST', {
        title, author, content, size, categories, features, rating, status
    });
}

// ─── Авторизация ──────────────────────────────────────────────────────────────

// Вход
async function login(nickname, password) {
    const result = await apiRequest('/login', 'POST', { nickname, password });
    if (result.status === 'success') {
        currentUser = result.nickname || nickname;
        localStorage.setItem('currentUser', currentUser);
        updateAuthButton();
    }
    return result;
}

// Регистрация
async function register(nickname, password, password2) {
    const result = await apiRequest('/register', 'POST', { nickname, password, password2 });
    if (result.status === 'success') {
        currentUser = result.nickname || nickname;
        localStorage.setItem('currentUser', currentUser);
        updateAuthButton();
    }
    return result;
}

// Выход
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthButton();
}

// Проверка авторизации
function isLoggedIn() {
    return currentUser !== null && currentUser !== '';
}

// Получить текущего пользователя
function getCurrentUser() {
    return currentUser;
}

// ─── Смена никнейма ───────────────────────────────────────────────────────────

// Отправляет новый ник на сервер, обновляет localStorage и все отображения
async function updateNickname(newNick) {
    const result = await apiRequest('/update-nickname', 'POST', {
        oldNickname: currentUser,
        newNickname: newNick
    });

    if (result.status === 'success' || result.status === undefined) {
        currentUser = newNick;
        localStorage.setItem('currentUser', newNick);
        refreshAllNickDisplays();
        return { status: 'success' };
    }
    return result; // { status: 'error', message: '...' }
}


// Обновить все элементы на странице, показывающие ник
function refreshAllNickDisplays() {
    const nick = currentUser || '—';
    document.querySelectorAll('.nick, .profile-nickname').forEach(el => {
        el.textContent = nick;
    });
}

// Кнопка авторизации (Log In / Profile + Logout)
// Работает на любой странице, где есть элемент с классом .LoginButton
function updateAuthButton() {
    const wrapper = document.querySelector('.LoginButton');
    if (!wrapper) return;

    if (isLoggedIn()) {
        wrapper.innerHTML = `
            <button class="auth-btn profile-btn" onclick="window.location.href='pages/profile.html'">
                👤 ${currentUser}
            </button>
            <button class="auth-btn logout-btn" onclick="logout(); window.location.reload();" title="Log out">
                ⬡
            </button>
        `;
    } else {
        wrapper.innerHTML = `
            <button class="auth-btn login-btn" onclick="window.location.href='pages/login.html'">
                Log In
            </button>
        `;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    updateAuthButton();
    refreshAllNickDisplays();
});