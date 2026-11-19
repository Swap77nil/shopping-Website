# NovaMart — Modern Shopping Website (Localhost)

A clean, responsive, full-featured e-commerce shopping website built with Flask, Tailwind CSS, and Vanilla JavaScript.

## 🚀 Quick Start

### Option 1: Double-click `run.bat`
Just double-click `run.bat` in this folder to launch the server!

### Option 2: Run via Terminal
```bash
python app.py
```

Then open your browser at:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## ✨ Features

- **Product Catalog**: 12+ pre-loaded high quality products spanning Electronics, Fashion, Footwear, Home & Fitness.
- **Instant Search**: Real-time debounced product search.
- **Category Filter Pills**: Quick one-click category filtering with active item counts.
- **Price Range Filter**: Min/Max price custom filter panel.
- **Sorting**: Most Popular, Highest Rated, Price Low to High, Price High to Low, and Biggest Discount.
- **Product Quick View Modal**: Full product specifications, high-res photos, description, and quantity selector.
- **Interactive Cart Drawer**:
  - Add to cart with animated badge counters.
  - Increment/decrement/remove controls.
  - Dynamic Free Shipping Progress Bar ($50 threshold).
  - Promo code discounts (`SAVE10` for 10% off, `WELCOME20` for 20% off).
  - Auto-calculated subtotal, tax (8%), shipping, and total.
  - Cart persists in `localStorage`.
- **Checkout & Simulated Payments**:
  - Customer shipping form.
  - Payment options (Card, UPI / QR Code, Cash on Delivery).
  - Real-time order placement via REST API.
  - Confirmation receipt modal with Order ID.
- **Order History**: Session order ledger modal with order receipts.
