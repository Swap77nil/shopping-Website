// State management
const state = {
    products: [],
    categories: [],
    selectedCategory: 'All',
    searchQuery: '',
    sortBy: 'popular',
    minPrice: null,
    maxPrice: null,
    cart: JSON.parse(localStorage.getItem('novamart_cart') || '[]'),
    appliedPromo: null,
    orders: []
};

// DOM Elements
const productGrid = document.getElementById('productGrid');
const categoryPillsContainer = document.getElementById('categoryPillsContainer');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const sortSelect = document.getElementById('sortSelect');
const toggleFilterPanelBtn = document.getElementById('toggleFilterPanelBtn');
const filterPanel = document.getElementById('filterPanel');
const minPriceInput = document.getElementById('minPriceInput');
const maxPriceInput = document.getElementById('maxPriceInput');
const applyPriceFilterBtn = document.getElementById('applyPriceFilterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');
const activeFilterBadge = document.getElementById('activeFilterBadge');
const productsCountText = document.getElementById('productsCountText');
const catalogTitle = document.getElementById('catalogTitle');

// Cart Elements
const openCartBtn = document.getElementById('openCartBtn');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
const cartDrawerPanel = document.getElementById('cartDrawerPanel');
const cartItemsList = document.getElementById('cartItemsList');
const cartCountBadge = document.getElementById('cartCountBadge');
const drawerItemsCount = document.getElementById('drawerItemsCount');
const cartTotalNav = document.getElementById('cartTotalNav');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartDiscount = document.getElementById('cartDiscount');
const discountRow = document.getElementById('discountRow');
const discountLabel = document.getElementById('discountLabel');
const cartShipping = document.getElementById('cartShipping');
const cartTax = document.getElementById('cartTax');
const cartGrandTotal = document.getElementById('cartGrandTotal');
const promoCodeInput = document.getElementById('promoCodeInput');
const applyPromoBtn = document.getElementById('applyPromoBtn');
const promoMessage = document.getElementById('promoMessage');
const startCheckoutBtn = document.getElementById('startCheckoutBtn');
const shippingRemainingText = document.getElementById('shippingRemainingText');
const shippingProgressBar = document.getElementById('shippingProgressBar');

// Quick View Modal
const quickViewModal = document.getElementById('quickViewModal');
const quickViewCard = document.getElementById('quickViewCard');
const quickViewContent = document.getElementById('quickViewContent');
const closeQuickViewBtn = document.getElementById('closeQuickViewBtn');

// Checkout Modal
const checkoutModal = document.getElementById('checkoutModal');
const checkoutCard = document.getElementById('checkoutCard');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutGrandTotal = document.getElementById('checkoutGrandTotal');
const submitOrderBtn = document.getElementById('submitOrderBtn');
const submitOrderBtnText = document.getElementById('submitOrderBtnText');
const submitOrderSpinner = document.getElementById('submitOrderSpinner');

// Receipt Modal
const receiptModal = document.getElementById('receiptModal');
const receiptOrderId = document.getElementById('receiptOrderId');
const receiptDate = document.getElementById('receiptDate');
const receiptCustomer = document.getElementById('receiptCustomer');
const receiptPayment = document.getElementById('receiptPayment');
const receiptTotal = document.getElementById('receiptTotal');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');

// Orders History
const openOrdersBtn = document.getElementById('openOrdersBtn');
const closeOrdersModalBtn = document.getElementById('closeOrdersModalBtn');
const ordersHistoryModal = document.getElementById('ordersHistoryModal');
const ordersListContainer = document.getElementById('ordersListContainer');
const ordersCountBadge = document.getElementById('ordersCountBadge');

// Toast
const toastContainer = document.getElementById('toastContainer');

// --- Helper Functions ---
function formatPrice(amount) {
    return '$' + Number(amount).toFixed(2);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-slate-900 border-emerald-500 text-white',
        info: 'bg-indigo-900 border-indigo-400 text-white',
        error: 'bg-rose-900 border-rose-500 text-white'
    };
    
    toast.className = `toast pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold ${colors[type] || colors.success}`;
    toast.innerHTML = `
        <span class="w-2 h-2 rounded-full ${type === 'error' ? 'bg-rose-400' : 'bg-emerald-400'}"></span>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function saveCart() {
    localStorage.setItem('novamart_cart', JSON.stringify(state.cart));
    updateCartUI();
}

// --- API Calls ---
async function fetchCategories() {
    try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        state.categories = data;
        renderCategories();
    } catch (err) {
        console.error('Failed to load categories', err);
    }
}

async function fetchProducts() {
    try {
        let url = `/api/products?category=${encodeURIComponent(state.selectedCategory)}&sort=${state.sortBy}`;
        if (state.searchQuery) url += `&search=${encodeURIComponent(state.searchQuery)}`;
        if (state.minPrice !== null) url += `&min_price=${state.minPrice}`;
        if (state.maxPrice !== null) url += `&max_price=${state.maxPrice}`;

        const res = await fetch(url);
        const data = await res.json();
        state.products = data.products || [];
        renderProducts();
        
        productsCountText.textContent = `Showing ${state.products.length} products`;
        catalogTitle.textContent = state.selectedCategory === 'All' ? 'Featured Products' : `${state.selectedCategory} Products`;
    } catch (err) {
        console.error('Failed to load products', err);
        productGrid.innerHTML = `
            <div class="col-span-full py-12 text-center text-rose-500 font-semibold">
                Unable to load products. Make sure your local server is running!
            </div>
        `;
    }
}

async function fetchOrders() {
    try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        state.orders = data.orders || [];
        if (state.orders.length > 0) {
            ordersCountBadge.textContent = state.orders.length;
            ordersCountBadge.classList.remove('hidden');
        } else {
            ordersCountBadge.classList.add('hidden');
        }
    } catch (err) {
        console.error('Failed to fetch orders', err);
    }
}

// --- Render Functions ---
function renderCategories() {
    categoryPillsContainer.innerHTML = '';
    state.categories.forEach(cat => {
        const btn = document.createElement('button');
        const isActive = cat.name === state.selectedCategory;
        btn.className = `category-btn whitespace-nowrap px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-sm ${
            isActive 
                ? 'bg-slate-900 text-white shadow-slate-900/20' 
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
        }`;
        btn.innerHTML = `${cat.name} <span class="ml-1 text-[11px] opacity-70">(${cat.count})</span>`;
        btn.addEventListener('click', () => {
            state.selectedCategory = cat.name;
            renderCategories();
            fetchProducts();
        });
        categoryPillsContainer.appendChild(btn);
    });
}

function renderProducts() {
    if (state.products.length === 0) {
        productGrid.innerHTML = `
            <div class="col-span-full py-16 text-center space-y-3">
                <div class="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">🔍</div>
                <h3 class="text-base font-bold text-slate-800">No matching products found</h3>
                <p class="text-xs text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                <button onclick="resetAllFilters()" class="text-xs bg-indigo-50 text-indigo-700 font-bold px-4 py-2 rounded-xl hover:bg-indigo-100">Reset Filters</button>
            </div>
        `;
        return;
    }

    productGrid.innerHTML = state.products.map(p => {
        const discountPct = Math.round(((p.original_price - p.price) / p.original_price) * 100);
        return `
            <div class="product-card bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col group relative">
                <!-- Badges -->
                <div class="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5 items-start">
                    <span class="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        ${p.badge || p.category}
                    </span>
                    ${discountPct > 0 ? `
                        <span class="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                            -${discountPct}%
                        </span>
                    ` : ''}
                </div>

                <!-- Product Image with Zoom -->
                <div class="relative aspect-square overflow-hidden bg-slate-100 cursor-pointer" onclick="openQuickView(${p.id})">
                    <img 
                        src="${p.image}" 
                        alt="${p.name}" 
                        class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                    >
                    <div class="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span class="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3.5 py-2 rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform">
                            Quick View
                        </span>
                    </div>
                </div>

                <!-- Details Content -->
                <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div class="space-y-1.5">
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span class="font-medium">${p.category}</span>
                            <span class="flex items-center text-amber-500 font-semibold gap-1">
                                ★ ${p.rating} <span class="text-slate-400 font-normal">(${p.reviews_count})</span>
                            </span>
                        </div>
                        <h3 class="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer" onclick="openQuickView(${p.id})">
                            ${p.name}
                        </h3>
                    </div>

                    <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                            <div class="text-lg font-extrabold text-slate-900">${formatPrice(p.price)}</div>
                            <div class="text-[11px] text-slate-400 line-through">${formatPrice(p.original_price)}</div>
                        </div>

                        <button 
                            onclick="addToCart(${p.id})"
                            class="bg-slate-900 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            title="Add to cart"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            <span>Add</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// --- Cart Operations ---
function addToCart(productId, quantity = 1) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existingIndex = state.cart.findIndex(item => item.id === productId);
    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += quantity;
    } else {
        state.cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }

    saveCart();
    showToast(`Added "${product.name.slice(0, 24)}..." to cart!`, 'success');
}

function updateCartQuantity(productId, delta) {
    const index = state.cart.findIndex(i => i.id === productId);
    if (index === -1) return;

    state.cart[index].quantity += delta;
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    }
    saveCart();
}

function removeFromCart(productId) {
    state.cart = state.cart.filter(i => i.id !== productId);
    saveCart();
    showToast('Item removed from cart', 'info');
}

function calculateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountRate = state.appliedPromo ? state.appliedPromo.discount_rate : 0.0;
    const discountAmount = subtotal * discountRate;
    const shipping = subtotal >= 50 || subtotal === 0 ? 0.0 : 9.99;
    const tax = (subtotal - discountAmount) * 0.08;
    const grandTotal = Math.max(0, subtotal - discountAmount + shipping + tax);

    return {
        subtotal,
        discountAmount,
        shipping,
        tax,
        grandTotal,
        itemsCount: state.cart.reduce((sum, item) => sum + item.quantity, 0)
    };
}

function updateCartUI() {
    const totals = calculateCartTotals();

    // Badges & Counters
    cartCountBadge.textContent = totals.itemsCount;
    drawerItemsCount.textContent = totals.itemsCount;
    cartTotalNav.textContent = formatPrice(totals.subtotal);

    // Free shipping bar ($50 goal)
    if (totals.subtotal >= 50 || totals.itemsCount === 0) {
        shippingProgressBar.style.width = totals.itemsCount === 0 ? '0%' : '100%';
        shippingRemainingText.textContent = totals.itemsCount === 0 ? 'Add $50.00 for FREE shipping!' : '🎉 You unlocked FREE Shipping!';
    } else {
        const remaining = 50 - totals.subtotal;
        const pct = Math.min(100, Math.round((totals.subtotal / 50) * 100));
        shippingProgressBar.style.width = `${pct}%`;
        shippingRemainingText.textContent = `Add ${formatPrice(remaining)} more for FREE shipping!`;
    }

    // List rendering
    if (state.cart.length === 0) {
        cartItemsList.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-3xl">🛒</div>
                <h4 class="font-bold text-slate-800 text-sm">Your cart is empty</h4>
                <p class="text-xs text-slate-400">Discover great products and add them to your shopping bag!</p>
            </div>
        `;
        startCheckoutBtn.disabled = true;
    } else {
        startCheckoutBtn.disabled = false;
        cartItemsList.innerHTML = state.cart.map(item => `
            <div class="flex gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-xl bg-white border border-slate-200 shrink-0">
                <div class="flex-1 flex flex-col justify-between min-w-0">
                    <div class="flex justify-between items-start gap-2">
                        <h4 class="text-xs font-bold text-slate-800 truncate">${item.name}</h4>
                        <button onclick="removeFromCart(${item.id})" class="text-slate-400 hover:text-rose-500 transition-colors p-0.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                    </div>
                    <div class="flex justify-between items-center pt-2">
                        <span class="text-xs font-extrabold text-slate-900">${formatPrice(item.price)}</span>
                        <div class="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
                            <button onclick="updateCartQuantity(${item.id}, -1)" class="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs">-</button>
                            <span class="text-xs font-bold px-1.5">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, 1)" class="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold text-xs">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Breakdown
    cartSubtotal.textContent = formatPrice(totals.subtotal);
    cartShipping.textContent = totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping);
    cartTax.textContent = formatPrice(totals.tax);
    cartGrandTotal.textContent = formatPrice(totals.grandTotal);
    checkoutGrandTotal.textContent = formatPrice(totals.grandTotal);

    if (state.appliedPromo && totals.discountAmount > 0) {
        discountRow.classList.remove('hidden');
        discountLabel.textContent = `Promo (${state.appliedPromo.code} -${state.appliedPromo.discount_percentage}%)`;
        cartDiscount.textContent = `-${formatPrice(totals.discountAmount)}`;
    } else {
        discountRow.classList.add('hidden');
    }
}

// Drawer visibility
function openCart() {
    cartDrawerBackdrop.classList.remove('hidden');
    setTimeout(() => {
        cartDrawerBackdrop.classList.remove('opacity-0');
        cartDrawerPanel.classList.remove('translate-x-full');
    }, 10);
    updateCartUI();
}

function closeCart() {
    cartDrawerBackdrop.classList.add('opacity-0');
    cartDrawerPanel.classList.add('translate-x-full');
    setTimeout(() => {
        cartDrawerBackdrop.classList.add('hidden');
    }, 300);
}

// Quick View Modal
function openQuickView(productId) {
    const p = state.products.find(item => item.id === productId);
    if (!p) return;

    const discountPct = Math.round(((p.original_price - p.price) / p.original_price) * 100);
    const specsHtml = Object.entries(p.specs || {}).map(([k, v]) => `
        <div class="flex justify-between text-xs py-1 border-b border-slate-100">
            <span class="text-slate-400 font-medium">${k}</span>
            <span class="text-slate-800 font-semibold">${v}</span>
        </div>
    `).join('');

    quickViewContent.innerHTML = `
        <div class="aspect-square bg-slate-100 relative">
            <img src="${p.image}" alt="${p.name}" class="w-full h-full object-cover">
            <span class="absolute top-4 left-4 bg-slate-900 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                ${p.badge || p.category}
            </span>
        </div>
        <div class="p-6 flex flex-col justify-between space-y-4 max-h-[80vh] overflow-y-auto">
            <div class="space-y-2">
                <div class="flex items-center justify-between text-xs text-slate-500">
                    <span>${p.category}</span>
                    <span class="text-amber-500 font-bold">★ ${p.rating} (${p.reviews_count} reviews)</span>
                </div>
                <h3 class="text-lg font-extrabold text-slate-900 leading-snug">${p.name}</h3>
                <div class="flex items-center gap-3">
                    <span class="text-2xl font-black text-slate-900">${formatPrice(p.price)}</span>
                    <span class="text-sm text-slate-400 line-through">${formatPrice(p.original_price)}</span>
                    <span class="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Save ${discountPct}%</span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed pt-2">${p.description}</p>
                
                <div class="pt-3 space-y-1">
                    <h5 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Specifications</h5>
                    <div class="space-y-0.5">${specsHtml}</div>
                </div>
            </div>

            <div class="pt-4 border-t border-slate-200 flex items-center gap-3">
                <div class="flex items-center border border-slate-300 rounded-xl p-1 shadow-sm">
                    <button id="qvDec" class="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg">-</button>
                    <span id="qvQty" class="px-3 text-xs font-bold">1</span>
                    <button id="qvInc" class="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-slate-100 rounded-lg">+</button>
                </div>
                <button 
                    id="qvAddBtn"
                    class="flex-1 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                >
                    <span>Add to Cart</span>
                </button>
            </div>
        </div>
    `;

    let qvQuantity = 1;
    document.getElementById('qvDec').addEventListener('click', () => {
        if (qvQuantity > 1) {
            qvQuantity--;
            document.getElementById('qvQty').textContent = qvQuantity;
        }
    });
    document.getElementById('qvInc').addEventListener('click', () => {
        qvQuantity++;
        document.getElementById('qvQty').textContent = qvQuantity;
    });
    document.getElementById('qvAddBtn').addEventListener('click', () => {
        addToCart(p.id, qvQuantity);
        closeQuickView();
        openCart();
    });

    quickViewModal.classList.remove('hidden');
    setTimeout(() => {
        quickViewModal.classList.remove('opacity-0');
        quickViewCard.classList.remove('scale-95');
    }, 10);
}

function closeQuickView() {
    quickViewModal.classList.add('opacity-0');
    quickViewCard.classList.add('scale-95');
    setTimeout(() => {
        quickViewModal.classList.add('hidden');
    }, 300);
}

// Checkout Modal
function openCheckout() {
    closeCart();
    checkoutModal.classList.remove('hidden');
    setTimeout(() => {
        checkoutModal.classList.remove('opacity-0');
        checkoutCard.classList.remove('scale-95');
    }, 10);
    updateCartUI();
}

function closeCheckout() {
    checkoutModal.classList.add('opacity-0');
    checkoutCard.classList.add('scale-95');
    setTimeout(() => {
        checkoutModal.classList.add('hidden');
    }, 300);
}

// Order receipt
function showReceipt(order) {
    receiptOrderId.textContent = order.order_id;
    receiptDate.textContent = order.created_at;
    receiptCustomer.textContent = `${order.customer.name} (${order.customer.city})`;
    receiptPayment.textContent = order.payment_method;
    receiptTotal.textContent = formatPrice(order.total);

    receiptModal.classList.remove('hidden');
    setTimeout(() => {
        receiptModal.classList.remove('opacity-0');
        receiptModal.children[0].classList.remove('scale-95');
    }, 10);
}

function closeReceipt() {
    receiptModal.classList.add('opacity-0');
    receiptModal.children[0].classList.add('scale-95');
    setTimeout(() => {
        receiptModal.classList.add('hidden');
    }, 300);
}

// Order history modal
function openOrdersModal() {
    fetchOrders().then(() => {
        if (state.orders.length === 0) {
            ordersListContainer.innerHTML = `
                <div class="text-center py-12 text-slate-400 space-y-2">
                    <p class="text-base font-bold text-slate-700">No orders yet</p>
                    <p class="text-xs">Your completed checkout orders will show up here.</p>
                </div>
            `;
        } else {
            ordersListContainer.innerHTML = state.orders.map(o => `
                <div class="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div class="flex justify-between items-start text-xs">
                        <div>
                            <span class="font-mono font-bold text-indigo-700 text-sm">${o.order_id}</span>
                            <div class="text-slate-400 text-[11px]">${o.created_at} • ${o.payment_method}</div>
                        </div>
                        <span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
                            ${o.status}
                        </span>
                    </div>
                    <div class="space-y-1 pt-1">
                        ${o.items.map(it => `
                            <div class="flex justify-between text-xs text-slate-600">
                                <span>${it.quantity}x ${it.name}</span>
                                <span class="font-semibold text-slate-900">${formatPrice(it.total)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div class="border-t border-slate-200 pt-2 flex justify-between font-bold text-xs text-slate-900">
                        <span>Grand Total</span>
                        <span class="text-sm font-extrabold text-indigo-700">${formatPrice(o.total)}</span>
                    </div>
                </div>
            `).join('');
        }

        ordersHistoryModal.classList.remove('hidden');
        setTimeout(() => {
            ordersHistoryModal.classList.remove('opacity-0');
            ordersHistoryModal.children[0].classList.remove('scale-95');
        }, 10);
    });
}

function closeOrdersModal() {
    ordersHistoryModal.classList.add('opacity-0');
    ordersHistoryModal.children[0].classList.add('scale-95');
    setTimeout(() => {
        ordersHistoryModal.classList.add('hidden');
    }, 300);
}

// Reset filters
window.resetAllFilters = function() {
    state.selectedCategory = 'All';
    state.searchQuery = '';
    state.minPrice = null;
    state.maxPrice = null;
    state.sortBy = 'popular';
    
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    minPriceInput.value = '';
    maxPriceInput.value = '';
    sortSelect.value = 'popular';
    activeFilterBadge.classList.add('hidden');

    renderCategories();
    fetchProducts();
};

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Search with debounce
    let searchTimeout = null;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();
        clearSearchBtn.classList.toggle('hidden', query === '');
        searchTimeout = setTimeout(() => {
            state.searchQuery = query;
            fetchProducts();
        }, 250);
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        state.searchQuery = '';
        fetchProducts();
    });

    // Sorting
    sortSelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        fetchProducts();
    });

    // Filter Panel Toggle
    toggleFilterPanelBtn.addEventListener('click', () => {
        filterPanel.classList.toggle('hidden');
    });

    applyPriceFilterBtn.addEventListener('click', () => {
        const minVal = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
        const maxVal = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
        state.minPrice = minVal;
        state.maxPrice = maxVal;
        if (minVal !== null || maxVal !== null) {
            activeFilterBadge.classList.remove('hidden');
        } else {
            activeFilterBadge.classList.add('hidden');
        }
        fetchProducts();
    });

    resetFilterBtn.addEventListener('click', () => {
        minPriceInput.value = '';
        maxPriceInput.value = '';
        state.minPrice = null;
        state.maxPrice = null;
        activeFilterBadge.classList.add('hidden');
        fetchProducts();
    });

    // Cart Drawer triggers
    openCartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartDrawerBackdrop.addEventListener('click', (e) => {
        if (e.target === cartDrawerBackdrop) closeCart();
    });

    // Quick View triggers
    closeQuickViewBtn.addEventListener('click', closeQuickView);
    quickViewModal.addEventListener('click', (e) => {
        if (e.target === quickViewModal) closeQuickView();
    });

    // Promo code
    applyPromoBtn.addEventListener('click', async () => {
        const code = promoCodeInput.value.trim().toUpperCase();
        if (!code) return;
        try {
            const res = await fetch('/api/validate-promo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();
            if (data.valid) {
                state.appliedPromo = data;
                promoMessage.textContent = data.message;
                promoMessage.className = 'text-xs text-emerald-600 font-semibold';
                promoMessage.classList.remove('hidden');
                updateCartUI();
                showToast(data.message, 'success');
            } else {
                state.appliedPromo = null;
                promoMessage.textContent = data.message;
                promoMessage.className = 'text-xs text-rose-500 font-semibold';
                promoMessage.classList.remove('hidden');
                updateCartUI();
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Checkout modal triggers
    startCheckoutBtn.addEventListener('click', openCheckout);
    closeCheckoutBtn.addEventListener('click', closeCheckout);
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckout();
    });

    // Checkout form submit
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        submitOrderBtn.disabled = true;
        submitOrderBtnText.textContent = 'Processing Payment...';
        submitOrderSpinner.classList.remove('hidden');

        const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
        const customer = {
            name: document.getElementById('custName').value.trim(),
            email: document.getElementById('custEmail').value.trim(),
            address: document.getElementById('custAddress').value.trim(),
            city: document.getElementById('custCity').value.trim(),
            zip: document.getElementById('custZip').value.trim(),
            payment_method: selectedPayment
        };

        const payload = {
            items: state.cart,
            customer: customer,
            promo_code: state.appliedPromo ? state.appliedPromo.code : null
        };

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok && data.success) {
                state.cart = [];
                state.appliedPromo = null;
                saveCart();
                closeCheckout();
                showReceipt(data.order);
                fetchOrders();
                showToast(`Order placed successfully! ID: ${data.order.order_id}`, 'success');
            } else {
                showToast(data.error || 'Failed to place order', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error during checkout', 'error');
        } finally {
            submitOrderBtn.disabled = false;
            submitOrderBtnText.textContent = 'Confirm & Place Order';
            submitOrderSpinner.classList.add('hidden');
        }
    });

    // Receipt modal continue
    continueShoppingBtn.addEventListener('click', closeReceipt);

    // Orders history triggers
    openOrdersBtn.addEventListener('click', openOrdersModal);
    closeOrdersModalBtn.addEventListener('click', closeOrdersModal);
    ordersHistoryModal.addEventListener('click', (e) => {
        if (e.target === ordersHistoryModal) closeOrdersModal();
    });

    // Payment radio styler
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.payment-option').forEach(el => {
                el.classList.remove('border-indigo-500', 'bg-indigo-50/50');
                el.classList.add('border-slate-200');
            });
            const parent = radio.closest('.payment-option');
            parent.classList.add('border-indigo-500', 'bg-indigo-50/50');
            parent.classList.remove('border-slate-200');
        });
    });
}

// Expose globals for inline HTML event handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.openQuickView = openQuickView;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchProducts();
    fetchOrders();
    updateCartUI();
    setupEventListeners();
});
