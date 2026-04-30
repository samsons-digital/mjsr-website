/* ============================================
   PAYMENT GATEWAY INTEGRATION
   Malam Jabba Ski Resort - Ready to Plug & Play
   ============================================

   INSTRUCTIONS:
   1. Choose your payment provider (Stripe, PayPal, JazzCash, EasyPaisa, etc.)
   2. Replace the placeholder functions below with your provider's SDK
   3. Update the config object with your API keys
   4. The rest of the website will work automatically

   SUPPORTED PROVIDERS:
   - Stripe (International)
   - PayPal (International)
   - JazzCash (Pakistan)
   - EasyPaisa (Pakistan)
   - Payoneer
   - Custom API

   ============================================ */

const PaymentGateway = {
    // Configuration - UPDATE THESE VALUES
    config: {
        provider: 'stripe', // Change to: 'stripe', 'paypal', 'jazzcash', 'easypaisa', 'custom'
        apiKey: 'REPLACE_WITH_YOUR_GATEWAY_KEY',
        apiSecret: 'REPLACE_WITH_YOUR_GATEWAY_SECRET',
        environment: 'sandbox', // 'sandbox' or 'production'
        currency: 'PKR',
        merchantId: 'MALAM_JABBA_RESORT'
    },

    // Initialize the payment gateway
    init: function(config) {
        if (config) {
            this.config = { ...this.config, ...config };
        }

        console.log('Payment Gateway initialized:', this.config.provider);
        console.log('Environment:', this.config.environment);

        // Provider-specific initialization
        switch(this.config.provider) {
            case 'stripe':
                this.initStripe();
                break;
            case 'paypal':
                this.initPayPal();
                break;
            case 'jazzcash':
                this.initJazzCash();
                break;
            case 'easypaisa':
                this.initEasyPaisa();
                break;
            case 'custom':
                this.initCustom();
                break;
            default:
                console.warn('Unknown payment provider. Using demo mode.');
        }
    },

    /* ============================================
       STRIPE INTEGRATION
       ============================================ */
    initStripe: function() {
        // Load Stripe.js dynamically
        if (typeof Stripe === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = () => {
                this.stripe = Stripe(this.config.apiKey);
                this.elements = this.stripe.elements();
                console.log('Stripe loaded successfully');
            };
            document.head.appendChild(script);
        }
    },

    processStripe: function(orderData, callback) {
        // Create payment intent on your server
        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: orderData.total * 100, // Stripe uses smallest currency unit
                currency: this.config.currency.toLowerCase(),
                metadata: {
                    customer_email: orderData.customer.email,
                    customer_name: orderData.customer.firstName + ' ' + orderData.customer.lastName,
                    order_items: JSON.stringify(orderData.items.map(i => i.name))
                }
            })
        })
        .then(res => res.json())
        .then(data => {
            return this.stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: this.elements.getElement('card'),
                    billing_details: {
                        name: orderData.customer.firstName + ' ' + orderData.customer.lastName,
                        email: orderData.customer.email
                    }
                }
            });
        })
        .then(result => {
            if (result.error) {
                callback(false, { message: result.error.message });
            } else {
                callback(true, { orderId: result.paymentIntent.id });
            }
        })
        .catch(err => {
            callback(false, { message: err.message });
        });
    },

    /* ============================================
       PAYPAL INTEGRATION
       ============================================ */
    initPayPal: function() {
        // Load PayPal SDK dynamically
        if (typeof paypal === 'undefined') {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.config.apiKey}&currency=${this.config.currency}`;
            script.onload = () => {
                console.log('PayPal loaded successfully');
            };
            document.head.appendChild(script);
        }
    },

    processPayPal: function(orderData, callback) {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: orderData.total.toString(),
                            currency_code: this.config.currency
                        },
                        description: 'Malam Jabba Ski Resort - ' + orderData.items.map(i => i.name).join(', ')
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    callback(true, { orderId: details.id });
                });
            },
            onError: function(err) {
                callback(false, { message: err.message });
            }
        }).render('#paypal-button-container');
    },

    /* ============================================
       JAZZCASH INTEGRATION (Pakistan)
       ============================================ */
    initJazzCash: function() {
        console.log('JazzCash integration ready');
        // JazzCash typically uses a form POST to their payment page
        // You'll need to generate a secure hash on your server
    },

    processJazzCash: function(orderData, callback) {
        // JazzCash requires server-side hash generation
        fetch('/api/jazzcash/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: orderData.total,
                orderId: 'MJ-' + Date.now(),
                customerEmail: orderData.customer.email,
                customerPhone: orderData.customer.phone,
                description: 'Malam Jabba Tickets'
            })
        })
        .then(res => res.json())
        .then(data => {
            // Redirect to JazzCash payment page
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                callback(false, { message: 'Failed to initiate JazzCash payment' });
            }
        })
        .catch(err => {
            callback(false, { message: err.message });
        });
    },

    /* ============================================
       EASYPAISA INTEGRATION (Pakistan)
       ============================================ */
    initEasyPaisa: function() {
        console.log('EasyPaisa integration ready');
    },

    processEasyPaisa: function(orderData, callback) {
        fetch('/api/easypaisa/initiate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: orderData.total,
                orderId: 'MJ-' + Date.now(),
                customerEmail: orderData.customer.email,
                customerPhone: orderData.customer.phone
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else {
                callback(false, { message: 'Failed to initiate EasyPaisa payment' });
            }
        })
        .catch(err => {
            callback(false, { message: err.message });
        });
    },

    /* ============================================
       CUSTOM API INTEGRATION
       ============================================ */
    initCustom: function() {
        console.log('Custom payment gateway initialized');
    },

    processCustom: function(orderData, callback) {
        fetch('/api/payment/process', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.config.apiKey
            },
            body: JSON.stringify({
                amount: orderData.total,
                currency: this.config.currency,
                customer: orderData.customer,
                items: orderData.items,
                merchantId: this.config.merchantId
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                callback(true, { orderId: data.orderId });
            } else {
                callback(false, { message: data.message || 'Payment failed' });
            }
        })
        .catch(err => {
            callback(false, { message: err.message });
        });
    },

    /* ============================================
       MAIN PROCESS FUNCTION
       Called by the checkout form
       ============================================ */
    process: function(orderData, callback) {
        console.log('Processing payment...', orderData);

        switch(this.config.provider) {
            case 'stripe':
                this.processStripe(orderData, callback);
                break;
            case 'paypal':
                this.processPayPal(orderData, callback);
                break;
            case 'jazzcash':
                this.processJazzCash(orderData, callback);
                break;
            case 'easypaisa':
                this.processEasyPaisa(orderData, callback);
                break;
            case 'custom':
                this.processCustom(orderData, callback);
                break;
            default:
                // Demo mode - simulate success
                console.log('Demo mode: Simulating payment success');
                setTimeout(() => {
                    callback(true, { orderId: 'DEMO-' + Date.now() });
                }, 1500);
        }
    },

    /* ============================================
       VERIFY PAYMENT
       Call this on your return/success page
       ============================================ */
    verify: function(transactionId, callback) {
        fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: transactionId })
        })
        .then(res => res.json())
        .then(data => {
            callback(data.verified, data);
        })
        .catch(err => {
            callback(false, { message: err.message });
        });
    }
};

// Auto-initialize with default config
// Override this in your main script with your actual API keys
PaymentGateway.init();
