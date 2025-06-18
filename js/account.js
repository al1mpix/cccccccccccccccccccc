document.addEventListener('DOMContentLoaded', function() {
    // Получаем текущего пользователя
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user) {
        window.location.href = 'index.html';
        return;
    }
    // Подставляем имя и email
    const nameEl = document.querySelector('.user-info .name');
    const emailEl = document.querySelector('.user-info .email');
    if (nameEl) nameEl.textContent = user.name;
    if (emailEl) emailEl.textContent = user.email;
    // Аватар по инициалам
    const avatarEl = document.querySelector('.user-info .avatar');
    if (avatarEl && user.name) {
        const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase();
        avatarEl.textContent = initials;
    }
    // Функции для работы с пользователями
    function getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }
    function setUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }
    function setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Обновляем пользователя в общем списке
        let users = getUsers();
        const index = users.findIndex(u => u.email === user.email);
        if (index > -1) {
            users[index] = user;
            setUsers(users);
        }
    }
    // Модальное окно
    const authModal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    // Переключение форм
    if (showRegister && showLogin && loginForm && registerForm) {
        showRegister.addEventListener('click', e => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
        showLogin.addEventListener('click', e => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }
    // Обработка форм входа и регистрации
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPass').value;
            
            let users = getUsers();
            let user = users.find(u => u.email === email && u.pass === pass);
            
            if (user) {
                setCurrentUser(user);
            authModal.style.display = 'none';
            location.reload();
        } else {
            alert('Неверный email или пароль');
        }
    });
    }
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const pass = document.getElementById('regPass').value;
            
            if (!name || !email || !pass) {
                return alert('Заполните все поля');
            }
            let users = getUsers();
            if (users.some(u => u.email === email)) {
                return alert('Пользователь с таким email уже существует');
            }
            let user = {name, email, pass, orders: [], wishlist: []};
            setCurrentUser(user);
        authModal.style.display = 'none';
        location.reload();
    });
    }
    // Выход
    document.querySelector('a[href="/logout"]')?.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    // --- Профиль ---
    function updateProfileUI() {
        const user = getCurrentUser();
        if (!user) return;
        
        const nameInput = document.getElementById('profileName');
        const emailInput = document.getElementById('profileEmail');
        const phoneInput = document.getElementById('profilePhone');
        
        if (nameInput) nameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        // Аватарка по инициалам
        const avatarEl = document.getElementById('profileAvatar');
        if (avatarEl) {
            const initials = (user.name || '').split(' ').map(w => w[0]).join('').toUpperCase() || 'U';
            avatarEl.textContent = initials;
        }
    }
    updateProfileUI();
    // Маска телефона
    const phoneInput = document.getElementById('profilePhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            let v = this.value.replace(/\D/g, '').slice(0, 11);
            if (v.length > 1) {
                v = '+7 (' + v.slice(1, 4) + ') ' + v.slice(4, 7) + 
                    (v.length > 7 ? '-' + v.slice(7, 9) : '') + 
                    (v.length > 9 ? '-' + v.slice(9, 11) : '');
            }
        this.value = v;
    });
    }
    // Сохранение профиля
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let user = getCurrentUser();
        if (!user) return;
            user.name = document.getElementById('profileName').value.trim();
            user.email = document.getElementById('profileEmail').value.trim();
            user.phone = document.getElementById('profilePhone').value.trim();
            
            const newPass = document.getElementById('profilePass').value;
            if (newPass) user.pass = newPass;
            setCurrentUser(user);
            updateProfileUI();
            alert('Профиль обновлён!');
        });
    }
    // --- Wishlist ---
    function renderWishlist() {
        const user = getCurrentUser();
        const grid = document.querySelector('.wishlist-grid');
        if (!grid || !user) return;
        grid.innerHTML = '';
        (user.wishlist || []).forEach((p, i) => {
            grid.innerHTML += `
                <div class='wishlist-item' style='background:#181c2a;padding:18px 12px 16px 12px;border-radius:14px;display:flex;align-items:center;gap:12px;margin-bottom:12px;'>
                    <img src='${p.image || ''}' alt='' style='width:54px;height:54px;object-fit:contain;border-radius:8px;'>
                    <div style='flex:1;'>
                        <div style='color:#00eaff;font-weight:600;'>${p.name}</div>
                        <div style='color:#b8eaff;'>${p.price} ₽</div>
                    </div>
                    <button class='remove-wish' data-i='${i}' style='background:none;border:none;color:#e74c3c;font-size:1.3rem;cursor:pointer;' title='Удалить'>&times;</button>
                </div>`;
        });
        if ((user.wishlist || []).length === 0) grid.innerHTML = '<div style="color:#b8eaff;padding:24px;">Нет избранных товаров</div>';
    }
    renderWishlist();
    // Удаление из wishlist
    document.querySelector('.wishlist-grid')?.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-wish')) {
            let i = +e.target.dataset.i;
            let user = getCurrentUser();
            if (user && user.wishlist) {
                user.wishlist.splice(i, 1);
                setCurrentUser(user);
                renderWishlist();
            }
        }
    });
    // --- Синхронизация wishlist между страницами ---
    window.addEventListener('storage', function(e) {
        if (e.key === 'currentUser') {
            renderWishlist();
            renderOrders();
        }
    });
    // --- История заказов ---
    function renderOrders() {
        const user = getCurrentUser();
        const ordersList = document.querySelector('.orders-list');
        if (!ordersList || !user) return;
        ordersList.innerHTML = '';
        (user.orders || []).forEach(order => {
            let items = order.items.map(i => 
                `<div class='item'>
                    <span class='name'>${i.name}</span> 
                    <span class='quantity'>${i.qty} шт.</span> 
                    <span class='price'>${i.price * i.qty} ₽</span>
                </div>`
            ).join('');
            ordersList.innerHTML += `
                <div class='order-card'>
                    <div class='order-header'>
                        <div class='order-number'>Заказ #${order.id || '—'}</div>
                        <div class='order-date'>${order.date || ''}</div>
                        <div class='order-status delivered'>${order.status || 'Доставлен'}</div>
                        <div class='order-total'>${order.total} ₽</div>
                    </div>
                    <div class='order-items-preview'>${items}</div>
                </div>`;
        });
        if ((user.orders || []).length === 0) ordersList.innerHTML = '<div style="color:#b8eaff;padding:24px;">Нет заказов</div>';
    }
    renderOrders();
    // --- Адреса ---
    const addressForm = document.getElementById('addressForm');
    const addressesList = document.querySelector('.addresses-list');
    if (addressForm && addressesList) {
        function renderAddresses() {
            const user = getCurrentUser();
            addressesList.innerHTML = '';
            (user.addresses || []).forEach((addr, i) => {
                addressesList.innerHTML += `<div class='address-item'>${addr}<div class='address-actions'><button data-i='${i}' class='remove-address'>Удалить</button></div></div>`;
            });
            if (!(user.addresses && user.addresses.length)) {
                addressesList.innerHTML = '<div style="color:#b8eaff;padding:18px;">Нет сохранённых адресов</div>';
            }
        }
        renderAddresses();
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const input = document.getElementById('addressInput');
            let user = getCurrentUser();
            if (!user.addresses) user.addresses = [];
            if (input.value.trim()) {
                user.addresses.push(input.value.trim());
                setCurrentUser(user);
                renderAddresses();
                input.value = '';
            }
        });
        addressesList.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-address')) {
                let i = +e.target.dataset.i;
                let user = getCurrentUser();
                user.addresses.splice(i, 1);
                setCurrentUser(user);
                renderAddresses();
            }
        });
    }
    // --- Настройки ---
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        const notifyEmail = document.getElementById('notifyEmail');
        const notifySms = document.getElementById('notifySms');
        const themeSelect = document.getElementById('themeSelect');
        // Загрузка настроек
        const user = getCurrentUser();
        if (user.settings) {
            if (notifyEmail) notifyEmail.checked = !!user.settings.notifyEmail;
            if (notifySms) notifySms.checked = !!user.settings.notifySms;
            if (themeSelect) themeSelect.value = user.settings.theme || 'dark';
        }
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            let user = getCurrentUser();
            user.settings = {
                notifyEmail: notifyEmail ? notifyEmail.checked : false,
                notifySms: notifySms ? notifySms.checked : false,
                theme: themeSelect ? themeSelect.value : 'dark'
            };
            setCurrentUser(user);
            alert('Настройки сохранены!');
        });
    }
}); 