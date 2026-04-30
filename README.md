# Malam Jabba Ski Resort - Complete Website

A modern, fully-responsive, production-ready website for Malam Jabba Ski Resort featuring an integrated online ticket store with plug-and-play payment gateway support.

## Features

### Website Sections
- **Hero Section** - Full-screen immersive landing with animated particles
- **Live Conditions Dashboard** - Real-time weather, snow depth, lift status
- **Online Ticket Store** - Filterable by Winter/Summer/Combo categories
- **Activities Grid** - Seasonal toggle (Winter/Summer)
- **Accommodation** - PC Hotel & Samsons Inn listings
- **Experience Packages** - Curated all-inclusive packages
- **Photo Gallery** - Responsive masonry grid
- **Getting Here** - Route cards from major cities
- **Testimonials** - Guest reviews section
- **Contact/Footer** - Full contact info, newsletter, social links

### E-Commerce Features
- **Shopping Cart** - Slide-out sidebar with quantity controls
- **Checkout Flow** - Multi-step checkout with form validation
- **Payment Gateway** - Plug-and-play integration for:
  - Stripe (International)
  - PayPal (International)
  - JazzCash (Pakistan)
  - EasyPaisa (Pakistan)
  - Custom API
- **Order Confirmation** - Success modal with order ID
- **Persistent Cart** - LocalStorage saves cart across sessions

## File Structure
```
malam-jabba-resort/
├── index.html          # Main website (single page)
├── style.css           # Complete stylesheet (45KB)
├── script.js           # Main JavaScript (15KB)
├── payment-gateway.js  # Payment integration (11KB)
└── README.md           # This file
```

## Quick Start

1. **Download** all files to your web server
2. **Open** `index.html` in a browser to preview
3. **Configure** payment gateway in `payment-gateway.js`
4. **Deploy** to your hosting

## Payment Gateway Setup

### Option 1: Stripe
```javascript
PaymentGateway.init({
    provider: 'stripe',
    apiKey: 'pk_live_YOUR_STRIPE_KEY',
    environment: 'production'
});
```

### Option 2: JazzCash (Pakistan)
```javascript
PaymentGateway.init({
    provider: 'jazzcash',
    merchantId: 'YOUR_MERCHANT_ID',
    apiKey: 'YOUR_API_KEY',
    environment: 'production'
});
```

### Option 3: EasyPaisa (Pakistan)
```javascript
PaymentGateway.init({
    provider: 'easypaisa',
    merchantId: 'YOUR_MERCHANT_ID',
    apiKey: 'YOUR_API_KEY',
    environment: 'production'
});
```

### Option 4: Custom API
```javascript
PaymentGateway.init({
    provider: 'custom',
    apiKey: 'YOUR_API_KEY',
    apiEndpoint: 'https://your-api.com/payment'
});
```

## Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --primary: #1E3A5F;    /* Main brand color */
    --accent: #D4A843;     /* CTA/Gold color */
    --success: #22C55E;    /* Success green */
    --error: #EF4444;      /* Error red */
}
```

### Prices
Update ticket prices in `index.html`:
```html
<div class="ticket-price">
    <span class="amount">3,500</span>
</div>
```

### Content
Replace placeholder text in `index.html` with your actual content.

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance
- Lazy loading ready for images
- Optimized CSS with no external dependencies (except fonts)
- Minimal JavaScript footprint
- LocalStorage for cart persistence

## Security Notes
- Never commit API keys to version control
- Use environment variables for sensitive data
- Implement server-side validation for payments
- Use HTTPS in production

## License
This website is built for Malam Jabba Ski Resort. All rights reserved.

## Support
For technical support or customization requests, contact your web developer.
