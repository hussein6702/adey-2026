'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../supabase';
import Image from 'next/image';
import './shop.css';

const DEFAULT_CATEGORY_ORDER = ['White Chocolate', 'Milk Chocolate', 'Dark Chocolate', 'Liqueur', 'Truffle'];
const DEFAULT_CATEGORY_LABELS = {
    'White Chocolate': 'White Chocolate',
    'Milk Chocolate': 'Milk Chocolate',
    'Dark Chocolate': 'Dark Chocolate',
    'Liqueur': 'Liqueur Fillings',
    'Truffle': 'Truffles',
};

const BOX_SIZES = [
    { key: '4-piece', label: '4 Piece', pieces: 4 },
    { key: '9-piece', label: '9 Piece', pieces: 9 },
    { key: '16-piece', label: '16 Piece', pieces: 16 },
    { key: '40-piece', label: '40 Piece', pieces: 40 },
];

// --- Bonbon card --- DEFINED OUTSIDE to maintain stable component identity
function BonbonCard({ bonbon, inCart, outOfStock, lowStock, atStockLimit, totalPieces, maxPieces, onAdd, onRemove }) {
    return (
        <div className={`bonbon-card ${outOfStock ? 'out-of-stock' : ''}`} style={outOfStock ? { opacity: 0.5 } : {}}>
            <div className="bonbon-image-wrap">
                {bonbon.image_url ? (
                    <Image
                        src={bonbon.image_url}
                        alt={bonbon.name}
                        width={180}
                        height={180}
                        className="bonbon-image"
                        loading="lazy"
                        unoptimized
                    />
                ) : (
                    <div className="bonbon-image-placeholder">No Image</div>
                )}
                {bonbon.is_liquor && <span className="bonbon-liquor-badge">Liqueur</span>}
                {outOfStock && <span className="bonbon-stock-badge out">Sold Out</span>}
                {lowStock && !outOfStock && <span className="bonbon-stock-badge low">{bonbon.stock} left</span>}
            </div>
            <div className="bonbon-info">
                <h3 className="bonbon-name">{bonbon.name}</h3>
                <p className="bonbon-desc">{bonbon.description}</p>
                <div className="bonbon-meta">
                    <span className="bonbon-price">{bonbon.price} ETB</span>
                    {bonbon.allergens && bonbon.allergens.length > 0 && (
                        <div className="bonbon-allergens">
                            {bonbon.allergens.map(a => (
                                <span key={a} className="bonbon-allergen-chip">{a}</span>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bonbon-cart-controls">
                    {outOfStock ? (
                        <button className="shop-btn-add" disabled>Sold Out</button>
                    ) : inCart > 0 ? (
                        <div className="bonbon-qty-control">
                            <button onClick={() => onRemove(bonbon.id)} className="qty-btn">−</button>
                            <span className="qty-value">{inCart}</span>
                            <button
                                onClick={() => onAdd(bonbon.id)}
                                className="qty-btn"
                                disabled={totalPieces >= maxPieces || atStockLimit}
                            >+</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onAdd(bonbon.id)}
                            className="shop-btn-add"
                            disabled={totalPieces >= maxPieces}
                        >
                            Add to Cart
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const COUNTRY_CODES = [
    { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
    { code: '+1', flag: '🇺🇸', name: 'USA / Canada' },
    { code: '+44', flag: '🇬🇧', name: 'UK' },
    { code: '+49', flag: '🇩🇪', name: 'Germany' },
    { code: '+33', flag: '🇫🇷', name: 'France' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: '+256', flag: '🇺🇬', name: 'Uganda' },
    { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
    { code: '+20', flag: '🇪🇬', name: 'Egypt' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+971', flag: '🇦🇪', name: 'UAE' },
    { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
    { code: '+91', flag: '🇮🇳', name: 'India' },
    { code: '+86', flag: '🇨🇳', name: 'China' },
];

// --- Order Form fields --- DEFINED OUTSIDE to maintain stable component identity
function OrderFormFields({ onSubmit, submitLabel, disabled, orderForm, setOrderForm, submitting, orderError }) {
    return (
        <form onSubmit={onSubmit} className="shop-order-form">
            <input
                type="text"
                placeholder="Full Name"
                required
                value={orderForm.customerName}
                onChange={e => setOrderForm(prev => ({ ...prev, customerName: e.target.value }))}
                className="shop-input"
            />
            <input
                type="email"
                placeholder="Email"
                required
                value={orderForm.userEmail}
                onChange={e => setOrderForm(prev => ({ ...prev, userEmail: e.target.value }))}
                className="shop-input"
            />

            {/* Phone with country code */}
            <div className="shop-phone-row">
                <select
                    value={orderForm.countryCode}
                    onChange={e => setOrderForm(prev => ({ ...prev, countryCode: e.target.value }))}
                    className="shop-country-select"
                >
                    {COUNTRY_CODES.map(c => (
                        <option key={c.code} value={c.code}>
                            {c.flag} {c.code}
                        </option>
                    ))}
                </select>
                <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={orderForm.phoneNumber}
                    onChange={e => setOrderForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="shop-input"
                />
            </div>

            <div className="shop-contact-toggle">
                <p className="shop-toggle-label">Preferred Contact:</p>
                <div className="shop-toggle-options">
                    <button
                        type="button"
                        className={`shop-toggle-btn ${orderForm.preferredContact === 'whatsapp' ? 'active' : ''}`}
                        onClick={() => setOrderForm(prev => ({ ...prev, preferredContact: 'whatsapp' }))}
                    >
                        WhatsApp
                    </button>
                    <button
                        type="button"
                        className={`shop-toggle-btn ${orderForm.preferredContact === 'telegram' ? 'active' : ''}`}
                        onClick={() => setOrderForm(prev => ({ ...prev, preferredContact: 'telegram' }))}
                    >
                        Telegram
                    </button>
                </div>
            </div>

            <select
                value={orderForm.pickUpType}
                onChange={e => setOrderForm(prev => ({ ...prev, pickUpType: e.target.value }))}
                className="shop-input"
            >
                <option value="pickup">Pick Up</option>
                <option value="delivery">Delivery</option>
            </select>
            {orderError && <p className="shop-error">{orderError}</p>}
            <button type="submit" className="shop-btn-primary" disabled={disabled || submitting}>
                {submitting ? 'Placing Order...' : submitLabel}
            </button>
        </form>
    );
}

export default function ShopPage() {
    const [bonbons, setBonbons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryLabels, setCategoryLabels] = useState(DEFAULT_CATEGORY_LABELS);
    const [grouped, setGrouped] = useState({});
    const [boxPrices, setBoxPrices] = useState({});
    const [loading, setLoading] = useState(true);

    // Cart state
    const [cart, setCart] = useState({});
    const [cartOpen, setCartOpen] = useState(false);

    // Best Sellers state
    const [bestSellerSize, setBestSellerSize] = useState(null);
    const [bestSellerQty, setBestSellerQty] = useState(1);

    // Order form
    const [orderForm, setOrderForm] = useState({
        customerName: '',
        userEmail: '',
        phoneNumber: '',
        countryCode: '+251',
        pickUpType: 'pickup',
        preferredContact: 'whatsapp',
    });
    const [submitting, setSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const [successItems, setSuccessItems] = useState([]);
    const [orderError, setOrderError] = useState(null);

    // Active category tab
    const [activeCategory, setActiveCategory] = useState('all');

    const fetchData = useCallback(async () => {
        const [bonbonRes, priceRes, catRes] = await Promise.all([
            supabase.from('bonbons').select('*').eq('active', true).order('name'),
            supabase.from('box_prices').select('*'),
            supabase.from('categories').select('*').order('name'),
        ]);

        if (bonbonRes.data) {
            setBonbons(bonbonRes.data);
            const g = {};
            bonbonRes.data.forEach(b => {
                if (!g[b.category]) g[b.category] = [];
                g[b.category].push(b);
            });
            setGrouped(g);
        }

        const dbCats = catRes.data || [];
        const currentBonbonCats = bonbonRes.data?.map(b => b.category) || [];
        const uniqueActiveCats = Array.from(new Set(currentBonbonCats)).filter(Boolean);
        
        // Merge defaults with active categories, keeping order
        const mergedNames = Array.from(new Set([...DEFAULT_CATEGORY_ORDER, ...uniqueActiveCats])).filter(name => uniqueActiveCats.includes(name));
        
        const finalCategories = mergedNames.map(name => {
            const dbCat = dbCats.find(c => c.name === name);
            return {
                name,
                image_url: dbCat?.image_url || null
            };
        });

        setCategories(finalCategories);

        const newLabels = { ...DEFAULT_CATEGORY_LABELS };
        mergedNames.forEach(c => {
            if (!newLabels[c]) newLabels[c] = c;
        });
        setCategoryLabels(newLabels);

        if (priceRes.data) {
            const p = {};
            priceRes.data.forEach(r => { p[r.box_size] = r.price; });
            setBoxPrices(p);
        }

        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Cart Logic ---
    const totalPieces = Object.values(cart).reduce((s, v) => s + v, 0);
    const MAX_PIECES = 40;

    function addToCart(bonbonId) {
        if (totalPieces >= MAX_PIECES) return;
        const bonbon = bonbons.find(b => b.id === bonbonId);
        if (bonbon && bonbon.stock !== null && bonbon.stock !== undefined) {
            const inCart = cart[bonbonId] || 0;
            if (inCart >= bonbon.stock) return; // Can't exceed stock
        }
        setCart(prev => ({ ...prev, [bonbonId]: (prev[bonbonId] || 0) + 1 }));
    }

    function removeFromCart(bonbonId) {
        setCart(prev => {
            const n = { ...prev };
            if (n[bonbonId] > 1) n[bonbonId]--;
            else delete n[bonbonId];
            return n;
        });
    }

    function clearCart() { setCart({}); }

    // Calculate cart total using individual bonbon prices (free choice)
    function calculateCartTotal() {
        let total = 0;
        for (const [bonbonId, qty] of Object.entries(cart)) {
            const b = bonbons.find(x => x.id === bonbonId);
            if (b) total += b.price * qty;
        }
        return total;
    }

    // --- Order Submission ---
    async function submitCustomOrder(e) {
        e.preventDefault();
        if (totalPieces === 0) return;

        setSubmitting(true);
        setOrderError(null);

        const items = Object.entries(cart).map(([bonbonId, quantity]) => {
            const b = bonbons.find(x => x.id === bonbonId);
            return { bonbonId, bonbonName: b?.name || '', quantity, imageUrl: b?.image_url || '' };
        });

        const fullPhone = `${orderForm.countryCode}${orderForm.phoneNumber.replace(/^0/, '')}`;
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...orderForm,
                phoneNumber: fullPhone,
                orderType: 'custom',
                items,
            }),
        });

        const data = await res.json();
        setSubmitting(false);
        if (data.success) {
            setSuccessItems(items);
            setOrderSuccess(data.order);
            clearCart();
            setCartOpen(false);
            setOrderForm({ customerName: '', userEmail: '', phoneNumber: '', countryCode: '+251', pickUpType: 'pickup', preferredContact: 'whatsapp' });
            fetchData(); // Refresh stock
        } else {
            setOrderError(data.error);
        }
    }

    async function submitBestSellerOrder(e) {
        e.preventDefault();
        if (!bestSellerSize) return;

        setSubmitting(true);
        setOrderError(null);

        const fullPhone = `${orderForm.countryCode}${orderForm.phoneNumber.replace(/^0/, '')}`;
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...orderForm,
                phoneNumber: fullPhone,
                orderType: 'bestSeller',
                boxSize: bestSellerSize,
                quantity: bestSellerQty,
            }),
        });

        const data = await res.json();
        setSubmitting(false);
        if (data.success) {
            setSuccessItems([]);
            setOrderSuccess(data.order);
            setBestSellerSize(null);
            setBestSellerQty(1);
            setOrderForm({ customerName: '', userEmail: '', phoneNumber: '', countryCode: '+251', pickUpType: 'pickup', preferredContact: 'whatsapp' });
        } else {
            setOrderError(data.error);
        }
    }

    // Success overlay with bonbon images
    function renderSuccessOverlay() {
        if (!orderSuccess) return null;
        return (
            <div className="shop-success-overlay" onClick={() => setOrderSuccess(null)}>
                <div className="shop-success-card" onClick={e => e.stopPropagation()}>
                    <div className="shop-success-icon">✓</div>
                    <h3>Order Placed!</h3>
                    <p>Your order has been received. We&apos;ll get in touch shortly.</p>
                    {successItems.length > 0 ? (
                        <div className="shop-success-items">
                            {successItems.map((item, i) => (
                                <div key={i} className="success-item">
                                    {item.imageUrl && <img src={item.imageUrl} alt={item.bonbonName} />}
                                    <span className="success-item-qty">{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    ) : orderSuccess.orderType === 'bestSeller' && (
                        <div className="shop-success-best-seller mb-4 pb-2 border-b border-zinc-100 flex flex-col items-center">
                            <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] mb-1">Assortment</span>
                            <p className="text-zinc-800 font-black uppercase tracking-widest text-xs">
                                {orderSuccess.boxes[Object.keys(orderSuccess.boxes).find(k => orderSuccess.boxes[k] > 0)]}× {Object.keys(orderSuccess.boxes).find(k => orderSuccess.boxes[k] > 0).replace('-piece', ' Piece')} Box
                            </p>
                        </div>
                    )}
                    <p className="shop-success-amount">{orderSuccess.amount} ETB</p>
                    <button onClick={() => setOrderSuccess(null)} className="shop-btn-primary">Continue Shopping</button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="shop-loading">
                <div className="shop-loading-spinner" />
                <p>Loading Collection...</p>
            </div>
        );
    }

    const cartBonbons = Object.entries(cart).map(([id, qty]) => ({
        bonbon: bonbons.find(b => b.id === id),
        qty,
    })).filter(x => x.bonbon);

    const cartTotal = calculateCartTotal();

    return (
        <div className="shop-page">
            {/* Hero */}
            <header className="shop-hero">
                <div className="shop-hero-content">
                    <p className="shop-hero-tag">Chocolatier Adey</p>
                    <h1 className="shop-hero-title">The Bonbon Collection</h1>
                    <p className="shop-hero-sub">
                        Handcrafted. Rooted in Africa. One bonbon at a time.
                    </p>
                </div>
            </header>

            {/* Cart FAB */}
            <button className="shop-cart-fab" onClick={() => setCartOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {totalPieces > 0 && <span className="shop-cart-count">{totalPieces}</span>}
            </button>

            {/* Category Tabs */}
            <nav className="shop-category-nav">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`shop-cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
                >
                    All
                </button>
                {categories.map(catObj => (
                    grouped[catObj.name] && grouped[catObj.name].length > 0 && (
                        <button
                            key={catObj.name}
                            onClick={() => setActiveCategory(catObj.name)}
                            className={`shop-cat-tab ${activeCategory === catObj.name ? 'active' : ''}`}
                        >
                            {categoryLabels[catObj.name] || catObj.name}
                        </button>
                    )
                ))}
                <button
                    onClick={() => setActiveCategory('bestSellers')}
                    className={`shop-cat-tab best-sellers ${activeCategory === 'bestSellers' ? 'active' : ''}`}
                >
                    ★ Best Sellers Box
                </button>
            </nav>

            {/* Piece limit banner */}
            {totalPieces > 0 && (
                <div className="shop-limit-banner">
                    <span>{totalPieces}/{MAX_PIECES} pieces selected</span>
                    {totalPieces >= MAX_PIECES && <span className="shop-limit-full">Cart Full</span>}
                </div>
            )}

            {/* BEST SELLERS Section */}
            {activeCategory === 'bestSellers' && (
                <section className="shop-best-sellers">
                    <div className="shop-section-header">
                        <h2>Best Sellers Box</h2>
                        <p>Let us pick the perfect assortment for you. Just choose your box size.</p>
                    </div>
                    <div className="best-seller-boxes">
                        {BOX_SIZES.map(({ key, label, pieces }) => (
                            <button
                                key={key}
                                onClick={() => setBestSellerSize(key)}
                                className={`best-seller-box ${bestSellerSize === key ? 'selected' : ''}`}
                            >
                                <span className="bs-pieces">{pieces}</span>
                                <span className="bs-label">{label}</span>
                                <span className="bs-price">{boxPrices[key] || '—'} ETB</span>
                            </button>
                        ))}
                    </div>
                    {bestSellerSize && (
                        <div className="best-seller-order">
                            <div className="bs-qty-row">
                                <span>Quantity:</span>
                                <div className="bonbon-qty-control">
                                    <button className="qty-btn" onClick={() => setBestSellerQty(Math.max(1, bestSellerQty - 1))}>−</button>
                                    <span className="qty-value">{bestSellerQty}</span>
                                    <button className="qty-btn" onClick={() => setBestSellerQty(bestSellerQty + 1)}>+</button>
                                </div>
                            </div>
                            <p className="bs-total">
                                Total: <strong>{(boxPrices[bestSellerSize] || 0) * bestSellerQty} ETB</strong>
                            </p>
                            <OrderFormFields
                                onSubmit={submitBestSellerOrder}
                                submitLabel={`Order ${bestSellerQty}× ${bestSellerSize}`}
                                disabled={!bestSellerSize}
                                orderForm={orderForm}
                                setOrderForm={setOrderForm}
                                submitting={submitting}
                                orderError={orderError}
                            />
                        </div>
                    )}
                </section>
            )}

            {/* BONBON Grid by Category */}
            {activeCategory !== 'bestSellers' && (
                <main className="shop-main">
                    {categories.map(catObj => {
                        const cat = catObj.name;
                        if (activeCategory !== 'all' && activeCategory !== cat) return null;
                        const items = grouped[cat];
                        if (!items || items.length === 0) return null;
                        return (
                            <section key={cat} className="shop-category-section">
                                <div className="shop-section-header flex flex-col items-center text-center">
                                    {catObj.image_url && (
                                        <div className="mb-6 w-32 h-32 rounded-full overflow-hidden border-2 border-[#eae5dd] shadow-sm">
                                            <img src={catObj.image_url} alt={cat} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <h2>{categoryLabels[cat] || cat}</h2>
                                </div>
                                <div className="bonbon-grid">
                                    {items.map(b => {
                                        const inCart = cart[b.id] || 0;
                                        const outOfStock = b.stock !== null && b.stock !== undefined && b.stock <= 0;
                                        const lowStock = b.stock !== null && b.stock !== undefined && b.stock > 0 && b.stock <= 5;
                                        const atStockLimit = b.stock !== null && b.stock !== undefined && inCart >= b.stock;
                                        return (
                                            <BonbonCard
                                                key={b.id}
                                                bonbon={b}
                                                inCart={inCart}
                                                outOfStock={outOfStock}
                                                lowStock={lowStock}
                                                atStockLimit={atStockLimit}
                                                totalPieces={totalPieces}
                                                maxPieces={MAX_PIECES}
                                                onAdd={addToCart}
                                                onRemove={removeFromCart}
                                            />
                                        );
                                    })}
                                </div>
                            </section>
                        );
                    })}
                </main>
            )}

            {/* Cart Drawer */}
            <div className={`shop-cart-backdrop ${cartOpen ? 'open' : ''}`} onClick={() => setCartOpen(false)} />
            <aside className={`shop-cart-drawer ${cartOpen ? 'open' : ''}`}>
                <div className="shop-cart-header">
                    <h2>Your Cart</h2>
                    <button onClick={() => setCartOpen(false)} className="shop-cart-close">✕</button>
                </div>

                {cartBonbons.length === 0 ? (
                    <div className="shop-cart-empty">
                        <p>Your cart is empty</p>
                        <p className="shop-cart-empty-sub">Add some bonbons to get started</p>
                    </div>
                ) : (
                    <>
                        <div className="shop-cart-items">
                            {cartBonbons.map(({ bonbon, qty }) => (
                                <div key={bonbon.id} className="shop-cart-item">
                                    {bonbon.image_url && (
                                        <img src={bonbon.image_url} alt={bonbon.name} className="shop-cart-item-img" />
                                    )}
                                    <div className="shop-cart-item-info">
                                        <p className="shop-cart-item-name">{bonbon.name}</p>
                                        <p className="shop-cart-item-cat">{bonbon.price} ETB × {qty}</p>
                                    </div>
                                    <div className="bonbon-qty-control small">
                                        <button onClick={() => removeFromCart(bonbon.id)} className="qty-btn">−</button>
                                        <span className="qty-value">{qty}</span>
                                        <button onClick={() => addToCart(bonbon.id)} className="qty-btn" disabled={totalPieces >= MAX_PIECES}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="shop-cart-breakdown">
                            <h4>Order Summary</h4>
                            <div className="breakdown-list">
                                {cartBonbons.map(({ bonbon, qty }) => (
                                    <div key={bonbon.id} className="breakdown-row">
                                        <span>{qty}× {bonbon.name}</span>
                                        <span>{bonbon.price * qty} ETB</span>
                                    </div>
                                ))}
                            </div>
                            <div className="breakdown-total">
                                <span>Total</span>
                                <span>{cartTotal} ETB</span>
                            </div>
                        </div>

                        {/* Order Form */}
                        <div className="shop-cart-form-area">
                            <OrderFormFields
                                onSubmit={submitCustomOrder}
                                submitLabel={`Place Order — ${cartTotal} ETB`}
                                disabled={totalPieces === 0}
                                orderForm={orderForm}
                                setOrderForm={setOrderForm}
                                submitting={submitting}
                                orderError={orderError}
                            />
                        </div>

                        <button onClick={clearCart} className="shop-cart-clear">Clear Cart</button>
                    </>
                )}
            </aside>

            {renderSuccessOverlay()}
        </div>
    );
}
