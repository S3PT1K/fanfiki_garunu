// Базовый URL сервера
const API_URL = 'http://localhost:8080/api';

// Текущий пользователь
let currentUser = localStorage.getItem('currentUser') || null;

// Функция для запросов к серверу
async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(API_URL + endpoint, options);
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Ошибка:', error);
        return { status: 'error', message: 'Сервер не отвечает' };
    }
}

// Получить список фанфиков
async function getFanfics() {
    return await apiRequest('/fanfics');
}

// Создать фанфик
async function createFanfic(title, author, content) {
    return await apiRequest('/fanfics', 'POST', { title, author, content });
}

// Вход
async function login(nickname, password) {
    const result = await apiRequest('/login', 'POST', { nickname, password });
    if (result.status === 'success') {
        currentUser = result.nickname;
        localStorage.setItem('currentUser', nickname);
    }
    return result;
}

// Регистрация
async function register(nickname, password, password2) {
    const result = await apiRequest('/register', 'POST', { nickname, password, password2 });
    if (result.status === 'success') {
        currentUser = result.nickname;
        localStorage.setItem('currentUser', nickname);
    }
    return result;
}

// Выход
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
}

// Проверка авторизации
function isLoggedIn() {
    return currentUser !== null;
}

// Получить текущего пользователя
function getCurrentUser() {
    return currentUser;
}