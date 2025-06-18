// Генерация массива планшетов
const brands = ["Apple", "Samsung", "Xiaomi", "Lenovo", "Huawei", "Honor", "Acer", "Asus"];
const tablets = Array.from({length: 35}, (_, i) => {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    return {
        id: i+1,
        name: `${brand} Tablet ${2025 - (i % 5)} (${i+1})`,
        brand,
        price: Math.floor(15990 + Math.random() * 90000),
        image: `images/iPad Pro 12.9.png`,
        desc: `Современный планшет ${brand} для работы, учёбы и развлечений.`
    };
});

// --- Универсальный рендер товаров, фильтрация, поиск, пагинация ---
window.addEventListener('DOMContentLoaded', function() {
    const products = tablets;
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    const brandList = document.getElementById('brandList');
    const applyFiltersBtn = document.querySelector('.apply-filters');
    const resetFiltersBtn = document.querySelector('.reset-filters');
    const pagination = document.getElementById('pagination');

    let filtered = [...products];
    let currentPage = 1;
    const perPage = 16;

    function renderBrands() {
        const uniqueBrands = [...new Set(products.map(p => p.brand))];
        brandList.innerHTML = uniqueBrands.map(brand => `
            <li><label><input type="checkbox" value="${brand}"> ${brand}</label></li>
        `).join('');
    }

    function renderProducts() {
        const start = (currentPage-1)*perPage;
        const end = start+perPage;
        const pageProducts = filtered.slice(start, end);
        productsGrid.innerHTML = pageProducts.map(p => `
            <div class="product-card">
                <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="product-description">${p.desc}</p>
                    <div class="product-price">${p.price.toLocaleString()} ₽</div>
                    <button class="btn btn-primary add-to-cart" data-id="${p.id}">В корзину</button>
                    <button class="btn btn-wishlist" data-id="${p.id}">♡ В избранное</button>
                </div>
            </div>
        `).join('');
        renderPagination();
        // Добавляю обработчик для избранного
        document.querySelectorAll('.btn-wishlist').forEach(btn => {
            const id = btn.getAttribute('data-id');
            if (isInWishlist(id)) btn.classList.add('active');
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const product = filtered.find(p => p.id == id);
                if (!product) return;
                if (isInWishlist(id)) {
                    removeFromWishlist(id);
                    btn.classList.remove('active');
                    btn.textContent = '♡ В избранное';
                } else {
                    addToWishlist(product);
                    btn.classList.add('active');
                    btn.textContent = '★ В избранном';
                }
            });
        });
    }

    function renderPagination() {
        const pages = Math.ceil(filtered.length/perPage);
        let html = '';
        for(let i=1;i<=pages;i++) {
            html += `<a href="#" class="page${i===currentPage?' active':''}" data-page="${i}">${i}</a>`;
        }
        pagination.innerHTML = html;
    }

    function applyFilters() {
        let brandsChecked = Array.from(brandList.querySelectorAll('input:checked')).map(i=>i.value);
        let min = parseInt(minPriceInput.value)||0;
        let max = parseInt(maxPriceInput.value)||Infinity;
        let search = (searchInput.value||'').toLowerCase();
        filtered = products.filter(p =>
            (brandsChecked.length===0 || brandsChecked.includes(p.brand)) &&
            p.price >= min && p.price <= max &&
            (p.name.toLowerCase().includes(search) || p.desc.toLowerCase().includes(search))
        );
        currentPage = 1;
        renderProducts();
    }

    searchInput.addEventListener('input', applyFilters);
    applyFiltersBtn.addEventListener('click', applyFilters);
    resetFiltersBtn.addEventListener('click', ()=>{
        minPriceInput.value = '';
        maxPriceInput.value = '';
        brandList.querySelectorAll('input').forEach(i=>i.checked=false);
        searchInput.value = '';
        applyFilters();
    });
    brandList.addEventListener('change', applyFilters);
    pagination.addEventListener('click', e=>{
        if(e.target.classList.contains('page')) {
            e.preventDefault();
            currentPage = +e.target.dataset.page;
            renderProducts();
        }
    });

    // --- Модальное окно для подробной информации о товаре ---
    function createModal() {
        let modal = document.getElementById('productModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'productModal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class=\"modal-content\">
                    <span class=\"close-modal\">&times;</span>
                    <div class=\"modal-body\"></div>
                </div>
            `;
            document.body.appendChild(modal);
            modal.querySelector('.close-modal').onclick = () => modal.style.display = 'none';
            modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
        }
        return modal;
    }

    function getTabletSpecs(product) {
        // Примерные характеристики для планшета
        return [
            ['Экран', '12.9\" IPS, 120 Гц'],
            ['Процессор', '8-ядерный, 2.8 ГГц'],
            ['Память', '8 ГБ ОЗУ, 256 ГБ ПЗУ'],
            ['Камера', '48 Мп + 12 Мп'],
            ['Батарея', '10000 мАч'],
            ['SIM', 'nanoSIM + eSIM'],
            ['ОС', 'Android 14 / iPadOS 18'],
            ['Вес', '600 г'],
            ['Бренд', product.brand],
        ];
    }

    function showProductModal(product) {
        const modal = createModal();
        const specs = getTabletSpecs(product);
        modal.querySelector('.modal-body').innerHTML = `
            <div class=\"modal-product\">
                <div class=\"modal-product-image\"><img src=\"${product.image}\" alt=\"${product.name}\"></div>
                <div class=\"modal-product-info\">
                    <h2>${product.name}</h2>
                    <div class=\"modal-product-price\">${product.price.toLocaleString()} ₽</div>
                    <p class=\"modal-product-desc\">${product.desc} <br> <b>Новинка 2025 года!</b></p>
                    <h4>Характеристики</h4>
                    <table class=\"modal-specs-table\">
                        ${specs.map(row => `<tr><td>${row[0]}</td><td>${row[1]}</td></tr>`).join('')}
                    </table>
                    <button class=\"btn btn-primary add-to-cart-modal\">В корзину</button>
                </div>
            </div>
        `;
        modal.style.display = 'block';
        modal.querySelector('.add-to-cart-modal').onclick = () => {
            alert('Товар добавлен в корзину (демо)');
            modal.style.display = 'none';
        };
    }

    // --- Клик по карточке товара ---
    productsGrid.addEventListener('click', e => {
        const card = e.target.closest('.product-card');
        if (card && !e.target.classList.contains('add-to-cart')) {
            const name = card.querySelector('h3').textContent;
            const product = filtered.find(p => p.name === name);
            if (product) showProductModal(product);
        }
    });

    // --- Функции для работы с избранным ---
    function getWishlist() {
        const user = JSON.parse(localStorage.getItem('currentUser')||'null');
        return (user && user.wishlist) ? user.wishlist : [];
    }
    function setWishlist(wishlist) {
        const user = JSON.parse(localStorage.getItem('currentUser')||'null');
        if (user) {
            user.wishlist = wishlist;
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }
    function isInWishlist(id) {
        return getWishlist().some(p => p.id == id);
    }
    function addToWishlist(product) {
        const wishlist = getWishlist();
        if (!wishlist.some(p => p.id == product.id)) {
            wishlist.push(product);
            setWishlist(wishlist);
        }
    }
    function removeFromWishlist(id) {
        let wishlist = getWishlist();
        wishlist = wishlist.filter(p => p.id != id);
        setWishlist(wishlist);
    }

    // --- Добавление товара в корзину ---
    function getCart() {
        return JSON.parse(localStorage.getItem('cart') || '[]');
    }
    function setCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    function addToCart(product) {
        let cart = getCart();
        let found = cart.find(i => i.id == product.id);
        if (found) {
            found.qty = (found.qty || 1) + 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }
        setCart(cart);
        showNotification && showNotification('Товар добавлен в корзину!');
        if (typeof updateCartCount === 'function') updateCartCount();
    }

    productsGrid.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const card = e.target.closest('.product-card');
            const id = e.target.getAttribute('data-id');
            const product = filtered.find(p => p.id == id);
            if (product) addToCart(product);
        }
    });

    renderBrands();
    applyFilters();
});

// Фильтрация, поиск, пагинация, рендер
// ... (JS код для фильтрации, поиска, пагинации, добавления в корзину) 