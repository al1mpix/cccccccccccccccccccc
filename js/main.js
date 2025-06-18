// Управление корзиной
document.addEventListener('DOMContentLoaded', function() {
    // Восстановить корзину из localStorage или создать новую
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.querySelector('.cart-count');
    const cartButton = document.querySelector('.btn-cart');

    // Создать модальное окно корзины
    const cartModal = document.createElement('div');
    cartModal.className = 'modal';
    cartModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Корзина</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="cart-items"></div>
            <div class="cart-footer">
                <div class="cart-total">
                    <span>Итого:</span>
                    <span class="total-amount">0 ₽</span>
                </div>
                <button class="btn btn-primary cart-checkout">Оформить заказ</button>
            </div>
        </div>
    `;
    document.body.appendChild(cartModal);

    let promo = { code: '', discount: 0 };
    const PROMO_CODES = { 'SALE5000': 5000, 'NEON2025': 2025 };

    // Обработчик кнопок "В корзину"
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            cart.push({ name, price });
            saveCart();
            updateCart();
            showNotification('Товар добавлен в корзину!');
        });
    });

    // Открыть корзину
    if (cartButton) {
        cartButton.addEventListener('click', function(e) {
            e.preventDefault();
            cartModal.style.display = 'block';
            updateCart();
        });
    }

    // Закрыть корзину
    const closeCartBtn = cartModal.querySelector('.close-modal');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', function() {
        cartModal.style.display = 'none';
    });
    }
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) cartModal.style.display = 'none';
    });

    // Удаление товара из корзины
    cartModal.addEventListener('click', function(e) {
        if (e.target.closest && e.target.closest('.cart-item-remove')) {
            const index = e.target.closest('.cart-item-remove').dataset.index;
            cart.splice(index, 1);
            saveCart();
            updateCart();
            showNotification('Товар удален из корзины!');
        }
    });

    // Оформить заказ
    const checkoutBtn = cartModal.querySelector('.cart-checkout');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Корзина пуста!');
            return;
        }
        window.location.href = 'checkout.html';
    });
    }

    // Обновление корзины и счетчика
    function updateCart() {
        const cartItems = cartModal.querySelector('.cart-items');
        const totalAmount = cartModal.querySelector('.total-amount');
        let total = 0;
        cartItems.innerHTML = '';
        cart.forEach((item, index) => {
            total += item.price * (item.qty || 1);
            cartItems.innerHTML += `
                <div class="cart-item">
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${item.name}</h3>
                        <div class="cart-item-qty">
                            <button class="qty-minus" data-index="${index}">-</button>
                            <input type="number" min="1" value="${item.qty || 1}" data-index="${index}" class="qty-input">
                            <button class="qty-plus" data-index="${index}">+</button>
                        </div>
                        <p class="cart-item-price">${item.price} ₽</p>
                    </div>
                    <button class="cart-item-remove" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });
        let discount = promo.discount && total > 0 ? Math.min(promo.discount, total) : 0;
        totalAmount.textContent = `${(total - discount)} ₽`;
        if (cartCount) cartCount.textContent = cart.reduce((sum, i) => sum + (i.qty || 1), 0);
    }

    // Сохранить корзину в localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // При загрузке страницы сразу обновить корзину и счетчик
    updateCart();

    // Инициализация корзины
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    
    // Обновление счетчика корзины
    updateCartCount();
    
    // Обработчик клика на кнопку корзины
    var cartBtnEl = document.getElementById('cartButton');
    if (cartBtnEl) {
        cartBtnEl.addEventListener('click', function() {
            // Проверка отмененных заказов
            if (localStorage.getItem('cancelledOrders') >= 2) {
                if (confirm('Вы уверены, что хотите открыть корзину?')) {
                    window.location.href = '/cart';
                }
            } else {
                window.location.href = '/cart';
            }
        });
    }
    
    // Lazy load для изображений
    if ('loading' in HTMLImageElement.prototype) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Полифилл для браузеров без поддержки lazy loading
        const lazyLoad = function() {
            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            
            const observer = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        observer.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(function(img) {
                observer.observe(img);
            });
        };
        
        lazyLoad();
    }
    
    // --- Модальное окно поиска ---
    const searchModal = document.createElement('div');
    searchModal.className = 'modal';
    searchModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Поиск</h2>
                <button class="close-modal">&times;</button>
            </div>
            <div class="search-form-modal">
                <input type="text" placeholder="Введите название товара..." class="modal-search-input">
                <button class="btn btn-primary modal-search-btn">Найти</button>
            </div>
            <div class="search-results"></div>
        </div>
    `;
    document.body.appendChild(searchModal);

    const searchButton = document.querySelector('.btn-search');
    const modalInput = searchModal.querySelector('.modal-search-input');
    const modalBtn = searchModal.querySelector('.modal-search-btn');
    const searchResults = searchModal.querySelector('.search-results');

    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        searchModal.style.display = 'block';
        modalInput.value = '';
        searchResults.innerHTML = '';
        modalInput.focus();
    });
    searchModal.querySelector('.close-modal').addEventListener('click', () => {
        searchModal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === searchModal) searchModal.style.display = 'none';
    });

    function doModalSearch() {
        const query = modalInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';
        if (!query) return;
        const products = Array.from(document.querySelectorAll('.product-card'));
        let found = 0;
        // Если в запросе есть 'дешев', показываем только premium
        const isCheap = query.includes('дешев');
        products.forEach(product => {
            const nameElem = product.querySelector('h3');
            const name = nameElem ? nameElem.textContent.toLowerCase() : '';
            const descElem = product.querySelector('.product-description');
            const description = descElem ? descElem.textContent.toLowerCase() : '';
            const isPremium = product.dataset.premium === 'true';
            // Поиск с опечатками: ищем по вхождению хотя бы 3 букв подряд
            let match = false;
            if (query.length >= 3) {
                for (let i = 0; i < query.length - 2; i++) {
                    const part = query.slice(i, i+3);
                    if (name.includes(part) || description.includes(part)) match = true;
                }
            } else {
                match = name.includes(query) || description.includes(query);
            }
            if (match && (!isCheap || isPremium)) {
                const clone = product.cloneNode(true);
                searchResults.appendChild(clone);
                found++;
            }
        });
        if (found === 0) {
            searchResults.innerHTML = '<div style="padding:20px; color:#888;">Ничего не найдено</div>';
        }
    }
    modalInput.addEventListener('input', doModalSearch);
    modalBtn.addEventListener('click', doModalSearch);

    // Поиск по submit формы, фильтрация карточек товаров
    const searchInput = document.querySelector('.search-input');
    const searchForm = document.querySelector('.search-form');
    if (searchInput && searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const query = searchInput.value.trim().toLowerCase();
            const products = Array.from(document.querySelectorAll('.product-card'));
            let found = 0;
            products.forEach(product => {
                const nameElem = product.querySelector('h3');
                const name = nameElem ? nameElem.textContent.toLowerCase() : '';
                const descElem = product.querySelector('.product-description');
                const description = descElem ? descElem.textContent.toLowerCase() : '';
                if (name.includes(query) || description.includes(query)) {
                    product.style.display = '';
                    found++;
                } else {
                    product.style.display = 'none';
                }
            });
            // Можно добавить сообщение, если ничего не найдено
            // if (found === 0) alert('Ничего не найдено');
        });
    }

    // Изменение количества
    cartModal.addEventListener('click', function(e) {
        if (e.target.classList.contains('qty-plus')) {
            const idx = +e.target.dataset.index;
            cart[idx].qty = (cart[idx].qty || 1) + 1;
            saveCart();
            updateCart();
        }
        if (e.target.classList.contains('qty-minus')) {
            const idx = +e.target.dataset.index;
            cart[idx].qty = Math.max(1, (cart[idx].qty || 1) - 1);
            saveCart();
            updateCart();
        }
    });
    cartModal.addEventListener('input', function(e) {
        if (e.target.classList.contains('qty-input')) {
            const idx = +e.target.dataset.index;
            let val = Math.max(1, parseInt(e.target.value) || 1);
            cart[idx].qty = val;
            saveCart();
            updateCart();
        }
    });
    // Применение промокода
    const applyPromoBtn = cartModal.querySelector('.apply-promo');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', function() {
            const promoInput = cartModal.querySelector('.promo-input');
            const val = promoInput ? promoInput.value.trim().toUpperCase() : '';
        if (PROMO_CODES[val]) {
            promo = { code: val, discount: PROMO_CODES[val] };
        } else {
            promo = { code: val, discount: 0 };
        }
        updateCart();
    });
    }

    function isInWishlist(id) {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser')||'null');
            return user && user.wishlist && user.wishlist.find(p=>p.id===id);
        } catch { return false; }
    }
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        const id = btn.getAttribute('data-name');
        if (isInWishlist(id)) btn.classList.add('active');
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const name = this.getAttribute('data-name');
            const price = parseInt(this.getAttribute('data-price'));
            const image = this.getAttribute('data-image');
            if (typeof addToWishlist === 'function' && typeof removeFromWishlist === 'function') {
                if (isInWishlist(name)) {
                    removeFromWishlist(name);
                    showNotification('Удалено из избранного');
                    btn.classList.remove('active');
                } else {
                    addToWishlist({name, price, image, id: name});
                    showNotification('Добавлено в избранное!');
                    btn.classList.add('active');
                }
            } else {
                alert('Функция избранного недоступна');
            }
        });
    });

    // --- Кнопка аккаунта и модальное окно авторизации ---
    const accountBtn = document.querySelector('.btn-account');
    const authModal = document.getElementById('authModal');
    if (accountBtn && authModal) {
        accountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            authModal.style.display = 'flex';
        });
        // Закрытие по крестику
        let closeBtn = authModal.querySelector('.close-modal');
        if (!closeBtn) {
            closeBtn = document.createElement('button');
            closeBtn.className = 'close-modal';
            closeBtn.innerHTML = '&times;';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '18px';
            closeBtn.style.right = '18px';
            closeBtn.style.fontSize = '2rem';
            closeBtn.style.background = 'none';
            closeBtn.style.border = 'none';
            closeBtn.style.color = '#00eaff';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.zIndex = '1001';
            if (authModal.firstElementChild) {
            authModal.firstElementChild.appendChild(closeBtn);
            }
        }
        if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            authModal.style.display = 'none';
        });
        }
        // Закрытие по клику вне окна
        authModal.addEventListener('mousedown', function(e) {
            if (e.target === authModal) authModal.style.display = 'none';
        });
    }
    // Переключение между формами входа и регистрации
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (showRegister && showLogin && loginForm && registerForm) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // --- Логика входа и регистрации ---
    function setCurrentUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        // Также сохраняем в общий список пользователей
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        const existingUserIndex = users.findIndex(u => u.email === user.email);
        if (existingUserIndex > -1) {
            users[existingUserIndex] = user;
        } else {
            users.push(user);
        }
        localStorage.setItem('users', JSON.stringify(users));
    }

    function getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser') || 'null');
    }

    function logoutUser() {
        localStorage.removeItem('currentUser');
        location.reload();
    }

    // Обработка форм входа и регистрации
    if (loginForm && registerForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const pass = document.getElementById('loginPass').value;
            
            // Ищем пользователя в общем списке
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            let user = users.find(u => u.email === email && u.pass === pass);
            
            if (user) {
                setCurrentUser(user);
                authModal.style.display = 'none';
                updateAccountBtn();
            } else {
                alert('Неверный email или пароль');
            }
        });

        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const pass = document.getElementById('regPass').value;
            
            if (!name || !email || !pass) {
                return alert('Заполните все поля');
            }

            // Проверяем, не существует ли уже пользователь с таким email
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.some(u => u.email === email)) {
                return alert('Пользователь с таким email уже существует');
            }

            let user = {name, email, pass, orders: [], wishlist: []};
            setCurrentUser(user);
            authModal.style.display = 'none';
            updateAccountBtn();
        });
    }
    // --- Обновление кнопки аккаунта ---
    function updateAccountBtn() {
        const user = getCurrentUser();
        if (user && accountBtn) {
            accountBtn.innerHTML = `<span style='color:#00eaff;font-weight:600;'>${user.name}</span>`;
            accountBtn.title = 'Личный кабинет';
            accountBtn.onclick = function(e) {
                e.preventDefault();
                window.location.href = 'account.html';
            };
        } else if (accountBtn) {
            accountBtn.innerHTML = '<i class="fas fa-user"></i>';
            accountBtn.title = 'Войти';
            accountBtn.onclick = null;
        }
    }
    updateAccountBtn();
});

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart'));
    document.getElementById('cartCount').textContent = cart.length;
}

function searchWithTypos(query) {
    // Здесь должна быть реализация поиска с учетом опечаток
    // Например, с использованием библиотеки Fuse.js
}

function filterPremiumProducts() {
    // Фильтрация и показ только премиум товаров
}

// Управление кешем для товаров в акции "Черная пятница"
function checkBlackFridayProducts() {
    const products = document.querySelectorAll('.product-card');
    
    products.forEach(product => {
        if (product.dataset.isBlackFriday === 'true') {
            // Устанавливаем короткий TTL для товаров в акции
            product.style.setProperty('--cache-ttl', '5m');
        }
    });
}

// A/B тестирование с автоматическим откатом
function runABTest(variation) {
    const originalConversion = getCurrentConversionRate();
    implementVariation(variation);
    
    const checkInterval = setInterval(() => {
        const newConversion = getCurrentConversionRate();
        if (newConversion < 0.005) {
            // Автоматический откат
            revertVariation(variation);
            clearInterval(checkInterval);
        }
    }, 60000); // Проверка каждую минуту
}

// Триггеры для писем о брошенной корзине
function trackCartAbandonment() {
    localStorage.setItem('cartAbandonTime', Date.now());
    
    document.querySelector('.similar-products').addEventListener('click', function() {
        localStorage.setItem('viewedSimilarProducts', Date.now());
    });
    
    setInterval(checkAbandonedCart, 60000); // Проверка каждую минуту
}

function checkAbandonedCart() {
    const cartAbandonTime = localStorage.getItem('cartAbandonTime');
    const viewedSimilar = localStorage.getItem('viewedSimilarProducts');
    
    let delay = 3600000; // 1 час по умолчанию
    
    if (viewedSimilar) {
        delay = 86400000; // 24 часа если смотрел похожие товары
    }
    
    if (cartAbandonTime && (Date.now() - cartAbandonTime > delay)) {
        sendReminderEmail();
        localStorage.removeItem('cartAbandonTime');
    }
}

// Newsletter form
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Show success message
        showNotification('Спасибо за подписку!');
        
        // Reset form
        e.target.reset();
    });
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add hover effect to product cards
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Add loading animation to buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        button.classList.add('btn-loading');
        setTimeout(() => {
            button.classList.remove('btn-loading');
        }, 1000);
    });
});

function translit(str) {
    const ru = ['а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ъ','ы','ь','э','ю','я'];
    const en = ['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','ts','ch','sh','sch','','y','','e','yu','ya'];
    return str.split('').map(s => {
        const i = ru.indexOf(s);
        if (i >= 0) return en[i];
        return s;
    }).join('');
}

// Исправление ошибки с querySelector('#')
// Проверяем, что селектор не пустой перед вызовом querySelector
const allLinks = document.querySelectorAll('a');
allLinks.forEach(link => {
    if (link.getAttribute('href') === '#') {
        link.addEventListener('click', function(e) {
            e.preventDefault();
        });
    }
});