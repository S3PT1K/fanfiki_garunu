document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.querySelector('button[data-i18n="auth-register"]');
    if (registerButton) {
        registerButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'registration.html';
        });
    }

    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const inputs = loginForm.querySelectorAll('input');
            const nickname = inputs[0].value;
            const password = inputs[1].value;
            
            const result = await login(nickname, password);
            
            if (result.status === 'success') {
                window.location.href = 'index.html';
            } else {
                alert('Ошибка: ' + result.message);
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const toRegBtn = document.getElementById('to-reg');
    if (toRegBtn) {
        toRegBtn.addEventListener('click', () => window.location.href = 'registration.html');
    }

    const loginForm = document.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const nickname = loginForm.querySelector('input[name="nickname"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;
            
            const result = await login(nickname, password);
            
            if (result.status === 'success') {
                window.location.href = 'index.html';
            } else {
                alert('Ошибка: ' + result.message);
            }
        });
    }
});