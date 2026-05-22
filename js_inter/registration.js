const API_URL = 'http://localhost:8080/api';

// Функции для связи с сервером
async function register(nickname, password) {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, password })
    });
    return await response.json();
}

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
    // Переход на логин
    const toLoginBtn = document.getElementById('to-login');
    if (toLoginBtn) {
        toLoginBtn.addEventListener('click', () => {
            window.location.href = 'authorization.html';
        });
    }

    const regForm = document.querySelector('form');
    if (!regForm) return;

    regForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const nicknameInput       = regForm.querySelector('input[name="nickname"]');
        const passwordInput       = regForm.querySelector('input[name="password"]');
        const passwordRepeatInput = regForm.querySelector('input[name="password_repeat"]');
        const submitBtn           = regForm.querySelector('input[type="submit"]');

        const nickname       = nicknameInput.value.trim();
        const password       = passwordInput.value;
        const passwordRepeat = passwordRepeatInput.value;

        [nicknameInput, passwordInput, passwordRepeatInput].forEach(el => el.classList.remove('error'));

        if (!nickname || !password || password !== passwordRepeat) {
            if (!nickname) nicknameInput.classList.add('error');
            if (!password) passwordInput.classList.add('error');
            if (password !== passwordRepeat) {
                passwordRepeatInput.classList.add('error');
                alert('Пароли не совпадают!');
            }
            return;
        }

        submitBtn.disabled = true;
        submitBtn.value = 'Регистрируем...';

        try {
            const regResult = await register(nickname, password);

            if (regResult.status === 'success') {
                submitBtn.value = 'Входим...';
                const loginResult = await login(nickname, password);
                
                if (loginResult.status === 'success') {
                    submitBtn.value = '✓ Готово!';
                    submitBtn.style.backgroundColor = 'green';
                    setTimeout(() => { window.location.href = 'index.html'; }, 400);
                } else {
                    window.location.href = 'authorization.html';
                }
            } else {
                alert('Ошибка: ' + (regResult.message || 'Этот ник уже занят'));
                submitBtn.disabled = false;
                submitBtn.value = 'Register';
            }
        } catch (e) {
            alert('Сервер не отвечает. Проверьте, что Pascal-сервер запущен!');
            submitBtn.disabled = false;
            submitBtn.value = 'Register';
        }
    });
});