document.addEventListener('DOMContentLoaded', () => {

    // Кнопка «Зарегистрироваться» — переход на регистрацию
    const toRegBtn = document.getElementById('to-reg');
    if (toRegBtn) {
        toRegBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'registration.html';
        });
    }

    const registerButtonI18n = document.querySelector('button[data-i18n="auth-register"]');
    if (registerButtonI18n) {
        registerButtonI18n.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'registration.html';
        });
    }

    const loginForm = document.querySelector('form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        let nickname, password;

        const nicknameInput = loginForm.querySelector('input[name="nickname"]');
        const passwordInput = loginForm.querySelector('input[name="password"]');

        if (nicknameInput && passwordInput) {
            nickname = nicknameInput.value.trim();
            password = passwordInput.value;
        } else {
            const inputs = loginForm.querySelectorAll('input');
            nickname = inputs[0]?.value.trim() || '';
            password = inputs[1]?.value || '';
        }

        if (!nickname) { alert('Введите никнейм!'); return; }
        if (!password) { alert('Введите пароль!'); return; }

        let result;
        try {
            result = await login(nickname, password);
        } catch (err) {
            alert('Сервер не отвечает. Убедитесь, что Pascal-сервер запущен (F9).');
            return;
        }

        if (result.status === 'success') {
            window.location.href = 'index.html';
        } else {
            alert('Ошибка: ' + (result.message || 'Неверный логин или пароль'));
        }
    });
});