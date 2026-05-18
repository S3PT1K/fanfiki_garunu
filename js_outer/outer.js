// Этот файл должен подключаться ПЕРВЫМ в каждом HTML!
<script src="../js_outer/outer.js"></script>

const API_URL = 'http://localhost:8080/api';
let currentUser = localStorage.getItem('currentUser') || null;

async function apiRequest(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (data) options.body = JSON.stringify(data);

    const response = await fetch(API_URL + endpoint, options);
    return await response.json();
}

async function getFanfics() { return await apiRequest('/fanfics'); }

async function createFanfic(title, author, content, size='', categories='', features='', rating='', status='') {
    return await apiRequest('/fanfics', 'POST', { title, author, content, size, categories, features, rating, status });
}

async function login(nickname, password) {
    const result = await apiRequest('/login', 'POST', { nickname, password });
    if (result.status === 'success') {
        currentUser = nickname;
        localStorage.setItem('currentUser', nickname);
    }
    return result;
}

async function register(nickname, password, password2) {
    const result = await apiRequest('/register', 'POST', { nickname, password, password2 });
    if (result.status === 'success') {
        currentUser = nickname;
        localStorage.setItem('currentUser', nickname);
    }
    return result;
}

function logout() { currentUser = null; localStorage.removeItem('currentUser'); }
function isLoggedIn() { return currentUser !== null; }
function getCurrentUser() { return currentUser; }