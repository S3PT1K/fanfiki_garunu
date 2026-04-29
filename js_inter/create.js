document.addEventListener('DOMContentLoaded', () => {
    const createForm = document.querySelector('.create-form');

    if (!createForm) {
        return;
    }

    createForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const title = document.getElementById('fanfic-title').value;
        const content = document.getElementById('fanfic-content').value;
        const author = getCurrentUser() || 'Anonymous'; 
        const result = await createFanfic(title, author, content);
        if (result && result.status === 'success') {
            alert('Фанфик успешно создан!');
            window.location.href = 'index.html';
        } else {
            alert('Ошибка при создании фанфика: ' + (result.message || 'Неизвестная ошибка'));
        }
    });
});