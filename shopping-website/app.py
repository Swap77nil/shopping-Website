import json
import time
import random
from flask import Flask, render_template, request, jsonify

app = Flask(__name__, template_folder='templates', static_folder='static')

PRODUCTS = [
    {
        "id": 1,
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "category": "Electronics",
        "price": 299.99,
        "original_price": 399.99,
        "rating": 4.8,
        "reviews_count": 1420,
        "stock": 15,
        "badge": "Best Seller",
        "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
        "description": "Industry-leading noise canceling with two processors and eight microphones for unprecedented noise cancellation and exceptional call quality.",
        "specs": {
            "Battery Life": "Up to 30 hours",
            "Connectivity": "Bluetooth 5.2, 3.5mm AUX",
            "Weight": "250g",
            "Color": "Midnight Black"
        }
    },
    {
        "id": 2,
        "name": "Apple Watch Series 9 GPS",
        "category": "Electronics",
        "price": 389.00,
        "original_price": 429.00,
        "rating": 4.9,
        "reviews_count": 985,
        "stock": 10,
        "badge": "Hot Deal",
        "image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        "description": "Smarter, brighter, and mightier. Featuring the powerful S9 SiP chip, double tap gesture, and advanced health sensors.",
        "specs": {
            "Display": "Always-On Retina OLED",
            "Water Resistance": "50 meters",
            "Battery": "18 hours normal use",
            "Case Size": "45mm Aluminum"
        }
    },
    {
        "id": 3,
        "name": "Minimalist Leather Commuter Backpack",
        "category": "Fashion",
        "price": 89.50,
        "original_price": 120.00,
        "rating": 4.6,
        "reviews_count": 312,
        "stock": 25,
        "badge": "Trending",
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
        "description": "Handcrafted premium full-grain leather backpack tailored for daily commuters, students, and weekend travelers with padded 15-inch laptop sleeve.",
        "specs": {
            "Material": "Full-Grain Cowhide Leather",
            "Capacity": "22 Liters",
            "Laptop Compartment": "Fits up to 15.6 inch",
            "Closure": "YKK Metal Zippers"
        }
    },
    {
        "id": 4,
        "name": "Nike Air Zoom Pegasus 40",
        "category": "Footwear",
        "price": 129.95,
        "original_price": 140.00,
        "rating": 4.7,
        "reviews_count": 640,
        "stock": 18,
        "badge": "Popular",
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
        "description": "A springy ride for every run, the Peg's familiar, just-for-you feel returns to help you accomplish your goals with engineered mesh.",
        "specs": {
            "Surface": "Road Running",
            "Cushioning": "Responsive Zoom Air",
            "Heel Drop": "10 mm",
            "Weight": "285g (Men size 9)"
        }
    },
    {
        "id": 5,
        "name": "Smart Ceramic Coffee Mug Warmer",
        "category": "Home & Kitchen",
        "price": 34.99,
        "original_price": 49.99,
        "rating": 4.4,
        "reviews_count": 489,
        "stock": 30,
        "badge": "Sale",
        "image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
        "description": "Keep your coffee or tea at the ideal drinking temperature (130-150?F) all day with auto-shutoff and gravity sensor heating pad.",
        "specs": {
            "Temperature Range": "130?F - 150?F (55?C - 65?C)",
            "Power": "18W Low Energy",
            "Auto Shutoff": "After 8 Hours",
            "Mug Compatibility": "Glass, Ceramic, Stainless Steel"
        }
    },
    {
        "id": 6,
        "name": "Ultra-Slim Mechanical Keyboard (RGB)",
        "category": "Electronics",
        "price": 79.99,
        "original_price": 99.99,
        "rating": 4.7,
        "reviews_count": 520,
        "stock": 20,
        "badge": "Gamer Choice",
        "image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
        "description": "Compact 75% low-profile mechanical keyboard with hot-swappable switches, wireless Bluetooth 5.1/2.4G/Wired modes, and customizable RGB backlighting.",
        "specs": {
            "Switch Type": "Gateron Low Profile Brown",
            "Layout": "75% (84 Keys)",
            "Connectivity": "Tri-Mode (BT / 2.4G / Type-C)",
            "Battery": "4000 mAh rechargeable"
        }
    },
    {
        "id": 7,
        "name": "Insulated Stainless Steel Water Bottle (1L)",
        "category": "Fitness",
        "price": 24.99,
        "original_price": 32.00,
        "rating": 4.8,
        "reviews_count": 890,
        "stock": 45,
        "badge": "Eco Friendly",
        "image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
        "description": "Double-wall vacuum insulation keeps cold drinks icy for 24 hours and hot coffee steaming for 12 hours. Sweat-free and BPA-free.",
        "specs": {
            "Volume": "32 oz / 1000 ml",
            "Material": "18/8 Food Grade Stainless Steel",
            "Lid Type": "Leak-proof straw & chug lid",
            "Dishwasher Safe": "Yes"
        }
    },
    {
        "id": 8,
        "name": "Classic Aviator Sunglasses UV400",
        "category": "Fashion",
        "price": 45.00,
        "original_price": 65.00,
        "rating": 4.5,
        "reviews_count": 270,
        "stock": 14,
        "badge": "Classic",
        "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
        "description": "Timeless metallic frame aviator sunglasses featuring polarized scratch-resistant lenses with 100% UVA/UVB protection.",
        "specs": {
            "Frame": "Stainless steel alloy",
            "Lens": "TAC Polarized UV400",
            "Bridge Width": "14mm",
            "Includes": "Protective case & microfiber cloth"
        }
    },
    {
        "id": 9,
        "name": "Ergonomic Memory Foam Lumbar Cushion",
        "category": "Home & Kitchen",
        "price": 39.95,
        "original_price": 54.99,
        "rating": 4.6,
        "reviews_count": 710,
        "stock": 22,
        "badge": "Comfort",
        "image": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
        "description": "Orthopedic curved back support pillow designed for office chairs and car seats to relieve lower back pressure and maintain spine alignment.",
        "specs": {
            "Filling": "High-density molded memory foam",
            "Cover": "Breathable 3D mesh (Machine washable)",
            "Strap": "Dual adjustable elastic straps",
            "Dimensions": "17.5 x 15 x 4.5 inches"
        }
    },
    {
        "id": 10,
        "name": "Adjustable Dumbbell Set (5-25 lbs)",
        "category": "Fitness",
        "price": 179.00,
        "original_price": 229.00,
        "rating": 4.9,
        "reviews_count": 430,
        "stock": 8,
        "badge": "Home Gym",
        "image": "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80",
        "description": "Rapid dial adjustment mechanism lets you change resistance in 5-lb increments in seconds. Eliminates the need for 10 separate dumbbell pairs.",
        "specs": {
            "Weight Range": "5 to 25 lbs per dumbbell",
            "Increments": "5, 10, 15, 20, 25 lbs",
            "Plate Coating": "Durable thermoplastic rubber",
            "Tray": "Heavy-duty docking storage tray included"
        }
    },
    {
        "id": 11,
        "name": "Waterproof All-Terrain Trail Shoes",
        "category": "Footwear",
        "price": 115.00,
        "original_price": 145.00,
        "rating": 4.6,
        "reviews_count": 380,
        "stock": 19,
        "badge": "Outdoor",
        "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
        "description": "Aggressive lug outsole for muddy trails combined with a breathable waterproof membrane to keep your feet dry in any weather condition.",
        "specs": {
            "Membrane": "HydroShield Waterproof",
            "Outsole": "Deep-lug Vibram traction rubber",
            "Insole": "Removable anti-fatigue footbed",
            "Arch Support": "Neutral to stability"
        }
    },
    {
        "id": 12,
        "name": "Modern Matte Ceramic Table Lamp",
        "category": "Home & Kitchen",
        "price": 58.00,
        "original_price": 75.00,
        "rating": 4.7,
        "reviews_count": 215,
        "stock": 12,
        "badge": "Decor",
        "image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
        "description": "Scandinavian minimalist bedside desk lamp featuring textured matte ceramic base, linen drum shade, and warm ambient 3-way touch dimming.",
        "specs": {
            "Height": "18.5 inches",
            "Base Material": "Handcrafted matte ceramic",
            "Bulb Socket": "E26 (LED warm bulb included)",
            "Switch": "3-Level touch sensor on base"
        }
    }
]

ORDERS = []

PROMO_CODES = {
    "SAVE10": 0.10,
    "WELCOME20": 0.20,
    "SUPER50": 0.50
}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/categories', methods=['GET'])
def get_categories():
    counts = {}
    for p in PRODUCTS:
        c = p["category"]
        counts[c] = counts.get(c, 0) + 1
    
    cats = [{"name": "All", "count": len(PRODUCTS)}]
    for c, cnt in sorted(counts.items()):
        cats.append({"name": c, "count": cnt})
    return jsonify(cats)

@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category', 'All')
    search = request.args.get('search', '').strip().lower()
    sort_by = request.args.get('sort', 'popular')
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)

    filtered = PRODUCTS

    if category and category != 'All':
        filtered = [p for p in filtered if p['category'].lower() == category.lower()]

    if search:
        filtered = [
            p for p in filtered
            if search in p['name'].lower() or search in p['description'].lower() or search in p['category'].lower()
        ]

    if min_price is not None:
        filtered = [p for p in filtered if p['price'] >= min_price]
    if max_price is not None:
        filtered = [p for p in filtered if p['price'] <= max_price]

    if sort_by == 'price_asc':
        filtered = sorted(filtered, key=lambda x: x['price'])
    elif sort_by == 'price_desc':
        filtered = sorted(filtered, key=lambda x: x['price'], reverse=True)
    elif sort_by == 'rating':
        filtered = sorted(filtered, key=lambda x: (x['rating'], x['reviews_count']), reverse=True)
    elif sort_by == 'discount':
        filtered = sorted(filtered, key=lambda x: ((x['original_price'] - x['price']) / x['original_price']), reverse=True)
    else:  # popular
        filtered = sorted(filtered, key=lambda x: x['reviews_count'], reverse=True)

    return jsonify({
        "total": len(filtered),
        "products": filtered
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = next((p for p in PRODUCTS if p['id'] == product_id), None)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product)

@app.route('/api/validate-promo', methods=['POST'])
def validate_promo():
    data = request.get_json() or {}
    code = data.get('code', '').strip().upper()
    if code in PROMO_CODES:
        discount_rate = PROMO_CODES[code]
        return jsonify({
            "valid": True,
            "code": code,
            "discount_percentage": int(discount_rate * 100),
            "discount_rate": discount_rate,
            "message": f"Promo code applied! {int(discount_rate * 100)}% discount."
        })
    return jsonify({
        "valid": False,
        "message": "Invalid promo code. Try 'SAVE10' or 'WELCOME20'."
    }), 400

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.get_json() or {}
    items = data.get('items', [])
    customer = data.get('customer', {})
    promo_code = (data.get('promo_code') or '').strip().upper()

    if not items:
        return jsonify({"error": "Cart is empty"}), 400

    if not customer.get('name') or not customer.get('email') or not customer.get('address'):
        return jsonify({"error": "Missing required customer details (name, email, address)"}), 400

    order_items = []
    subtotal = 0.0

    for item in items:
        pid = item.get('id')
        qty = int(item.get('quantity', 1))
        product = next((p for p in PRODUCTS if p['id'] == pid), None)
        if product:
            item_total = round(product['price'] * qty, 2)
            subtotal += item_total
            order_items.append({
                "id": product['id'],
                "name": product['name'],
                "price": product['price'],
                "quantity": qty,
                "total": item_total,
                "image": product['image']
            })

    discount_rate = PROMO_CODES.get(promo_code, 0.0)
    discount_amount = round(subtotal * discount_rate, 2)
    tax_amount = round((subtotal - discount_amount) * 0.08, 2)
    shipping_fee = 0.0 if subtotal >= 50.0 else 9.99
    grand_total = round(subtotal - discount_amount + tax_amount + shipping_fee, 2)

    order_id = f"ORD-{int(time.time())}-{random.randint(1000, 9999)}"
    order_record = {
        "order_id": order_id,
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "customer": customer,
        "items": order_items,
        "subtotal": round(subtotal, 2),
        "discount": discount_amount,
        "promo_code": promo_code if discount_amount > 0 else None,
        "tax": tax_amount,
        "shipping": shipping_fee,
        "total": grand_total,
        "payment_method": customer.get('payment_method', 'Credit Card'),
        "status": "Confirmed"
    }

    ORDERS.insert(0, order_record)

    return jsonify({
        "success": True,
        "order": order_record,
        "message": f"Order {order_id} placed successfully!"
    }), 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    return jsonify({
        "total": len(ORDERS),
        "orders": ORDERS
    })

if __name__ == '__main__':
    print("=" * 60)
    print(" ?? NovaMart Shopping Website is running!")
    print(" ?? Localhost URL: http://localhost:5000")
    print(" ?? Press CTRL+C to stop the server")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)
