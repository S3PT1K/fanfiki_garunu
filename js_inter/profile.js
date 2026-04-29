document.addEventListener('DOMContentLoaded', () => {
    const changeBtn = document.querySelector('.edit-profile-btn');
    if (!changeBtn) return;

    function getSafeTextNode(parent) {
        const span = parent.querySelector('span');
        let node = span.nextSibling;
        while (node && node.nodeType !== Node.TEXT_NODE) node = node.nextSibling;
        if (!node) {
            node = document.createTextNode(' —');
            parent.appendChild(node);
        }
        return node;
    }

    const agePara = document.querySelector('.profile-age');
    const genPara = document.querySelector('.profile-gender');
    const bioPara = document.querySelector('.profile-bio');

    const ageNode = getSafeTextNode(agePara);
    const genNode = getSafeTextNode(genPara);
    const bioNode = getSafeTextNode(bioPara);

    let modal = document.getElementById('editProfileModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editProfileModal';
        modal.className = 'modal-container';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <h3 style="margin:0">Edit Profile</h3>
                <label style="display:block; margin-top:10px;">Age:</label><input type="number" id="inpAge">
                <label style="display:block; margin-top:10px;">Gender:</label>
                <select id="inpGen">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
                <label style="display:block; margin-top:10px;">Theme:</label>
                <select id="inpTheme">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
                <label style="display:block; margin-top:10px;">Bio:</label><textarea id="inpBio" rows="3"></textarea>
                <div class="modal-buttons">
                    <button id="cancelBtn" style="cursor:pointer; padding:5px 10px;">Cancel</button>
                    <button id="saveBtn" style="background:rgb(156,111,44); color:white; border:none; padding:5px 15px; border-radius:5px; cursor:pointer;">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    const inpAge = document.getElementById('inpAge');
    const inpGen = document.getElementById('inpGen');
    const inpBio = document.getElementById('inpBio');
    const inpTheme = document.getElementById('inpTheme');

    changeBtn.onclick = () => {
        inpAge.value = ageNode.nodeValue.replace('—', '').trim();
        inpGen.value = genNode.nodeValue.replace('—', '').trim() || 'Male';
        inpBio.value = bioNode.nodeValue.replace('—', '').trim();
        inpTheme.value = localStorage.getItem('preferred-theme') || 'light';
        modal.style.display = 'flex';
    };

    inpTheme.onchange = (e) => {
        const theme = e.target.value;
        if (window.applyTheme) {
            window.applyTheme(theme);
        } else {
            document.body.classList.toggle('dark-theme', theme === 'dark');
            localStorage.setItem('preferred-theme', theme);
        }
    };

    document.getElementById('saveBtn').onclick = () => {
        ageNode.nodeValue = ' ' + (inpAge.value || '—');
        genNode.nodeValue = ' ' + (inpGen.value || '—');
        bioNode.nodeValue = ' ' + (inpBio.value || '—');
        modal.style.display = 'none';
    };

    document.getElementById('cancelBtn').onclick = () => modal.style.display = 'none';
    modal.querySelector('.modal-overlay').onclick = () => modal.style.display = 'none';
});
window.translations = {
    ...window.translations,
    en: {
        ...(window.translations?.en || {}),
        "profile-nick": "Nick",
        "nav-main": "Main",
        "nav-profile": "Profile",
        "nav-create": "Create",
        "nav-saves": "Saves",
        "nav-settings": "Settings",
        "nav-rules": "Rules",
        "nav-faq": "FAQ",
        "nav-back": "← Back"
    },
    ru: {
        ...(window.translations?.ru || {}),
        "profile-nick": "Ник",
        "nav-main": "Главная",
        "nav-profile": "Профиль",
        "nav-create": "Создать",
        "nav-saves": "Сохраненное",
        "nav-settings": "Настройки",
        "nav-rules": "Правила",
        "nav-faq": "ЧаВо",
        "nav-back": "← Назад"
    },
    es: {
        ...(window.translations?.es || {}),
        "profile-nick": "Apodo",
        "nav-main": "Principal",
        "nav-profile": "Perfil",
        "nav-create": "Crear",
        "nav-saves": "Guardados",
        "nav-settings": "Ajustes",
        "nav-rules": "Reglas",
        "nav-faq": "FAQ",
        "nav-back": "← Atrás"
    },
    fr: {
        ...(window.translations?.fr || {}),
        "profile-nick": "Pseudo",
        "nav-main": "Accueil",
        "nav-profile": "Profil",
        "nav-create": "Créer",
        "nav-saves": "Sauvegardes",
        "nav-settings": "Paramètres",
        "nav-rules": "Règles",
        "nav-faq": "FAQ",
        "nav-back": "← Retour"
    },
    ja: {
        ...(window.translations?.ja || {}),
        "profile-nick": "ニックネーム",
        "nav-main": "メイン",
        "nav-profile": "プロフィール",
        "nav-create": "作成",
        "nav-saves": "保存済み",
        "nav-settings": "設定",
        "nav-rules": "ルール",
        "nav-faq": "FAQ",
        "nav-back": "← 戻る"
    }
};
