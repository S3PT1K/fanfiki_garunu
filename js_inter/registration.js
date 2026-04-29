document.addEventListener('DOMContentLoaded', () => {
    // Переход на страницу логина
    const loginButton = document.querySelector('button[data-i18n="auth-login"]');
    if (loginButton) {
        loginButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'authorization.html';
        });
    }

    const regForm = document.querySelector('form');
    if (regForm) {
        regForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const inputs = regForm.querySelectorAll('input');
            const nickname = inputs[0].value;
            const password = inputs[1].value;
            const password2 = inputs[2].value;

            if (password !== password2) {
                alert('Пароли не совпадают!');
                return;
            }
            
            // 1. Регистрируем пользователя
            const regResult = await register(nickname, password, password2);
            
            if (regResult.status === 'success') {
                // 2. АВТОМАТИЧЕСКИЙ ВХОД после успешной регистрации
                const loginResult = await login(nickname, password);
                
                if (loginResult.status === 'success') {
                    alert('Регистрация завершена! Добро пожаловать.');
                    window.location.href = 'index.html';
                } else {
                    // Если вдруг вход не удался, отправляем на страницу авторизации
                    window.location.href = 'authorization.html';
                }
            } else {
                alert('Ошибка регистрации: ' + regResult.message);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const toLoginBtn = document.getElementById('to-login');
    if (toLoginBtn) {
        toLoginBtn.addEventListener('click', () => window.location.href = 'authorization.html');
    }

    const regForm = document.querySelector('form');
    if (regForm) {
        regForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const nickname = regForm.querySelector('input[name="nickname"]').value;
            const password = regForm.querySelector('input[name="password"]').value;
            const passwordRepeat = regForm.querySelector('input[name="password_repeat"]').value;

            if (password !== passwordRepeat) {
                alert('Пароли не совпадают!');
                return;
            }
            
            const result = await register(nickname, password, passwordRepeat);
            
            if (result.status === 'success') {
                // АВТОМАТИЧЕСКИЙ ВХОД
                const authResult = await login(nickname, password);
                if (authResult.status === 'success') {
                    alert('Успешная регистрация и вход!');
                    window.location.href = 'index.html';
                } else {
                    window.location.href = 'authorization.html';
                }
            } else {
                alert('Ошибка: ' + result.message);
            }
        });
    }
});
