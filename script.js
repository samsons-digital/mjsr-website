/* ============================================
   MALAM JABBA SKI RESORT - MAIN JAVASCRIPT
   ============================================ */

// Shopping Cart State
let cart = JSON.parse(localStorage.getItem('mj_cart')) || [];

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    updateCartUI();
    initScrollEffects();
    initNavbarScroll();
    initDateInputs();
    initFadeInAnimations();
});

/* ============================================
   NAVIGATION
   ============================================ */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const overlay = document.getElementById('mobileOverlay');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

/* ============================================
   SHOPPING CART
   ============================================ */
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : '';
}

function addToCart(name, price, category) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            category: category,
            quantity: 1,
            id: Date.now()
        });
    }

    saveCart();
    updateCartUI();
    showToast(name + ' added to cart!', 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
            return;
        }
        saveCart();
        updateCartUI();
    }
}

function saveCart() {
    localStorage.setItem('mj_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartCount = document.getElementById('cartCount');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTax = document.getElementById('cartTax');
    const cartTotal = document.getElementById('cartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = 0; // Configure tax rate here
    const total = subtotal + tax;

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-basket"></i>
                <h4>Your cart is empty</h4>
                <p>Add tickets to get started</p>
            </div>
        `;
        cartFooter.style.display = 'none';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-img">
                    <i class="fas fa-ticket-alt"></i>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">PKR ${item.price.toLocaleString()}</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `).join('');
        cartFooter.style.display = 'block';
    }

    cartSubtotal.textContent = 'PKR ' + subtotal.toLocaleString();
    cartTax.textContent = 'PKR ' + tax.toLocaleString();
    cartTotal.textContent = 'PKR ' + total.toLocaleString();
}

/* ============================================
   CHECKOUT
   ============================================ */
function openCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    toggleCart();
    const overlay = document.getElementById('checkoutOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateOrderSummary();
}

function closeCheckout() {
    const overlay = document.getElementById('checkoutOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function updateOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    orderItems.innerHTML = cart.map(item => `
        <div class="order-item">
            <span class="order-item-name">${item.name} x${item.quantity}</span>
            <span class="order-item-price">PKR ${(item.price * item.quantity).toLocaleString()}</span>
        </div>
    `).join('');

    orderTotal.textContent = 'PKR ' + subtotal.toLocaleString();
}

function selectPayment(element, method) {
    document.querySelectorAll('.payment-method').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

function processPayment() {
    // Validate form
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const visitDate = document.getElementById('visitDate').value;

    if (!firstName || !lastName || !email || !phone || !visitDate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Phone validation (Pakistani format)
    const phoneRegex = /^\+92[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        showToast('Please enter a valid phone number (+92XXXXXXXXXX)', 'error');
        return;
    }

    // Get selected payment method
    const selectedMethod = document.querySelector('.payment-method.selected');
    const paymentMethod = selectedMethod ? selectedMethod.querySelector('span').textContent : 'Credit Card';

    // Prepare order data
    const orderData = {
        customer: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            visitDate: visitDate
        },
        items: cart,
        paymentMethod: paymentMethod,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        orderDate: new Date().toISOString()
    };

    // Call Payment Gateway (see payment-gateway.js)
    if (typeof PaymentGateway !== 'undefined') {
        PaymentGateway.process(orderData, function(success, response) {
            if (success) {
                showSuccess(response.orderId);
            } else {
                showToast('Payment failed: ' + response.message, 'error');
            }
        });
    } else {
        // Demo mode - simulate successful payment
        console.log('Payment Gateway not integrated. Demo mode active.');
        console.log('Order Data:', orderData);

        // Simulate processing delay
        const btnPay = document.querySelector('.btn-pay');
        btnPay.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        btnPay.disabled = true;

        setTimeout(() => {
            showSuccess('MJ-' + Date.now().toString().slice(-6));
            btnPay.innerHTML = '<i class="fas fa-lock"></i> Pay Now';
            btnPay.disabled = false;
        }, 2000);
    }
}

function showSuccess(orderId) {
    closeCheckout();
    const overlay = document.getElementById('successOverlay');
    document.getElementById('orderId').textContent = '#' + orderId;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
}

function closeSuccess() {
    const overlay = document.getElementById('successOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

/* ============================================
   TICKET FILTERING
   ============================================ */
function filterTickets(category, btn) {
    // Update active tab
    document.querySelectorAll('.store-tab').forEach(tab => tab.classList.remove('active'));
    btn.classList.add('active');

    // Filter cards
    const cards = document.querySelectorAll('.ticket-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'flex';
            card.style.animation = 'fadeInUp 0.4s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ============================================
   SEASON TOGGLE (ACTIVITIES)
   ============================================ */
function setSeason(season, btn) {
    // Update active button
    document.querySelectorAll('.season-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show/hide activities
    const cards = document.querySelectorAll('.activity-card');
    cards.forEach(card => {
        if (card.dataset.season === season) {
            card.style.display = 'block';
            card.style.animation = 'fadeInUp 0.4s ease';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ============================================
   DATE INPUTS
   ============================================ */
function initDateInputs() {
    const today = new Date().toISOString().split('T')[0];
    const checkIn = document.getElementById('checkIn');
    const checkOut = document.getElementById('checkOut');
    const visitDate = document.getElementById('visitDate');

    if (checkIn) checkIn.min = today;
    if (checkOut) checkOut.min = today;
    if (visitDate) visitDate.min = today;
}

/* ============================================
   TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

/* ============================================
   SCROLL EFFECTS
   ============================================ */
function initScrollEffects() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

function initFadeInAnimations() {
    // Add fade-in class to elements that should animate
    const selectors = [
        '.ticket-card',
        '.activity-card',
        '.package-card',
        '.route-card',
        '.gallery-item',
        '.condition-card'
    ];

    selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('fade-in');
        });
    });
}

/* ============================================
   NEWSLETTER
   ============================================ */
document.querySelector('.newsletter-form button')?.addEventListener('click', function(e) {
    e.preventDefault();
    const input = document.querySelector('.newsletter-form input');
    if (input && input.value) {
        showToast('Thank you for subscribing!', 'success');
        input.value = '';
    } else {
        showToast('Please enter your email address', 'error');
    }
});

/* ============================================
   KEYBOARD SHORTCUTS
   ============================================ */
document.addEventListener('keydown', function(e) {
    // ESC to close modals
    if (e.key === 'Escape') {
        document.getElementById('cartSidebar')?.classList.remove('active');
        document.getElementById('cartOverlay')?.classList.remove('active');
        document.getElementById('checkoutOverlay')?.classList.remove('active');
        document.getElementById('successOverlay')?.classList.remove('active');
        document.getElementById('mobileMenu')?.classList.remove('active');
        document.getElementById('mobileOverlay')?.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/* ============================================
   PERFORMANCE: Lazy Load Images
   ============================================ */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}
