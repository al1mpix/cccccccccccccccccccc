// Пошаговая форма оформления заказа

document.addEventListener('DOMContentLoaded', function() {
    const steps = Array.from(document.querySelectorAll('.checkout-steps .step'));
    const formSteps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');
    const orderForm = document.getElementById('orderForm');

    let currentStep = 0;

    function showStep(index) {
        formSteps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === index);
        });
        currentStep = index;
        // Автофокус на первом поле шага
        const firstInput = formSteps[index].querySelector('input:not([type="checkbox"]):not([type="radio"])');
        if (firstInput) firstInput.focus();
        // Прокрутка к форме на мобильных
        if (window.innerWidth < 700) {
            formSteps[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Переключение шагов по кнопкам
    nextBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const next = parseInt(this.dataset.next) - 1;
            if (validateStep(currentStep)) {
                showStep(next);
            }
        });
    });
    prevBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const prev = parseInt(this.dataset.prev) - 1;
            showStep(prev);
        });
    });

    // Переключение шагов по клику на шаг
    steps.forEach((step, i) => {
        step.addEventListener('click', function() {
            if (i <= currentStep) showStep(i);
        });
    });

    // Валидация текущего шага
    function validateStep(stepIdx) {
        const step = formSteps[stepIdx];
        let valid = true;
        const requiredFields = step.querySelectorAll('input[required], select[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
                field.classList.add('invalid');
                valid = false;
            } else {
                field.classList.remove('invalid');
            }
        });
        if (!valid) {
            // Прокрутка к первому невалидному полю
            const firstInvalid = step.querySelector('.invalid');
            if (firstInvalid) firstInvalid.focus();
        }
        return valid;
    }

    // Убираем ошибку при вводе
    orderForm.addEventListener('input', function(e) {
        if (e.target.classList.contains('invalid')) {
            e.target.classList.remove('invalid');
        }
    });

    // Отправка формы
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateStep(currentStep)) return;
        // Здесь можно отправить данные на сервер или показать сообщение об успехе
        showOrderSuccess();
    });

    function showOrderSuccess() {
        // Сохраняем заказ в историю пользователя
        const user = JSON.parse(localStorage.getItem('currentUser')||'null');
        let cart = JSON.parse(localStorage.getItem('cart')||'[]');
        if (user && cart.length) {
            let orders = user.orders || [];
            let total = cart.reduce((sum, i) => sum + i.price * (i.qty||1), 0);
            let order = {
                id: Date.now(),
                date: new Date().toLocaleString('ru-RU', {day:'2-digit', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}),
                items: cart.map(i => ({name: i.name, price: i.price, qty: i.qty||1, image: i.image})),
                total,
                status: 'Оформлен'
            };
            orders.unshift(order);
            user.orders = orders;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
        // Очищаем корзину
        localStorage.setItem('cart', '[]');
        // Редиректим в профиль
        window.location.href = 'account.html';
    }

    // Выводим товары из корзины в сайдбар заказа
    function renderOrderSidebar() {
        const sidebarItems = document.querySelector('.order-summary-sidebar .order-items');
        if (!sidebarItems) return;
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            sidebarItems.innerHTML = '<div style="color:#b8eaff;opacity:0.7;padding:16px 0;">Корзина пуста</div>';
            return;
        }
        sidebarItems.innerHTML = cart.map(item => `
            <div class="order-item">
                <span class="order-item-title">${item.name}</span>
                <span class="order-item-qty">${item.qty || 1} шт.</span>
                <span class="order-item-price">${item.price} ₽</span>
            </div>
        `).join('');
    }
    renderOrderSidebar();

    // Инициализация
    showStep(0);
}); 