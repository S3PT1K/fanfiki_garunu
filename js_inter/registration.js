document.addEventListener('DOMContentLoaded', () => {

    // Кнопка «Войти» — переход на страницу авторизации
    const toLoginBtn = document.getElementById('to-login');
    if (toLoginBtn) {
        toLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'authorization.html';
        });
    }

    // Кнопка-ссылка со старым data-i18n (на случай если используется)
    const loginButtonI18n = document.querySelector('button[data-i18n="auth-login"]');
    if (loginButtonI18n) {
        loginButtonI18n.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'authorization.html';
        });
    }

    const regForm = document.querySelector('form');
    if (!regForm) return;

    regForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Пробуем сначала по name-атрибутам (надёжнее)
        let nickname, password, passwordRepeat;

        const nicknameInput    = regForm.querySelector('input[name="nickname"]');
        const passwordInput    = regForm.querySelector('input[name="password"]');
        const passwordRepInput = regForm.querySelector('input[name="password_repeat"]');

        if (nicknameInput && passwordInput && passwordRepInput) {
            nickname       = nicknameInput.value.trim();
            password       = passwordInput.value;
            passwordRepeat = passwordRepInput.value;
        } else {
            // Запасной вариант — по индексу
            const inputs = regForm.querySelectorAll('input');
            nickname       = inputs[0]?.value.trim() || '';
            password       = inputs[1]?.value || '';
            passwordRepeat = inputs[2]?.value || '';
        }

        if (!nickname) { alert('Введите никнейм!'); return; }
        if (password.length < 4) { alert('Пароль должен быть не менее 4 символов!'); return; }
        if (password !== passwordRepeat) { alert('Пароли не совпадают!'); return; }

        let regResult;
        try {
            regResult = await register(nickname, password, passwordRepeat);
        } catch (err) {
            alert('Сервер не отвечает. Убедитесь, что Pascal-сервер запущен (F9).');
            return;
        }

        if (regResult.status === 'success') {
            let loginResult;
            try { loginResult = await login(nickname, password); }
            catch (err) { window.location.href = 'authorization.html'; return; }

            if (loginResult.status === 'success') {
                alert('Регистрация завершена! Добро пожаловать, ' + nickname + '!');
                window.location.href = 'index.html';
            } else {
                alert('Регистрация прошла, но вход не удался: ' + (loginResult.message || ''));
                window.location.href = 'authorization.html';
            }
        } else {
            alert('Ошибка регистрации: ' + (regResult.message || 'Неизвестная ошибка'));
        }
    });
});