// Конфигурация сервера
const API_URL = 'http://localhost:8080/api';

// Вспомогательная функция для входа
async function login(nickname, password) {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
    });
    const result = await response.json();
    if (result.status === 'success') {
        localStorage.setItem('currentUser', JSON.stringify(result));
    }
    return result;
}

document.addEventListener('DOMContentLoaded', () => {
    // Переход на регистрацию
    const toRegBtn = document.getElementById('to-reg');
    if (toRegBtn) {
        toRegBtn.addEventListener('click', () => {
            window.location.href = 'registration.html';
        });
    }

    const loginForm = document.querySelector('form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nicknameInput = loginForm.querySelector('input[name="nickname"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');
        const submitBtn     = loginForm.querySelector('input[type="submit"]');

        const nickname = nicknameInput.value.trim();
        const password = passwordInput.value;

        nicknameInput.classList.remove('error');
        passwordInput.classList.remove('error');

        if (!nickname || !password) {
            if (!nickname) nicknameInput.classList.add('error');
            if (!password) passwordInput.classList.add('error');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.value = 'Входим...';

        try {
            const result = await login(nickname, password);

            if (result.status === 'success') {
                submitBtn.value = '✓ Успешно!';
                submitBtn.style.backgroundColor = 'green';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 400);
            } else {
                alert('Ошибка: ' + (result.message || 'Неверный логин или пароль'));
                submitBtn.disabled = false;
                submitBtn.value = 'LOG IN';
            }
        } catch (e) {
            alert('Сервер не отвечает. Проверьте, что Pascal-сервер запущен!');
            submitBtn.disabled = false;
            submitBtn.value = 'LOG IN';
        }
    });
});