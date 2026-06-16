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

// --- Bonbon card ---
function BonbonCard({ bonbon, inCart, outOfStock, lowStock, atStockLimit, totalPieces, maxPieces, onAdd, onRemove, hidePrice }) {
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
                        quality={75}
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
                    {!hidePrice && <span className="bonbon-price">{bonbon.price} ETB</span>}
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

// --- Order Form fields ---
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
            <input
                type="date"
                placeholder="Pickup/Delivery Date"
                required
                value={orderForm.pickupDate}
                onChange={e => setOrderForm(prev => ({ ...prev, pickupDate: e.target.value }))}
                className="shop-input"
            />
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
            {orderError && <p className="shop-error">{orderError}</p>}
            <button type="submit" className="shop-btn-primary" disabled={disabled || submitting}>
                {submitting ? 'Placing Order...' : submitLabel}
            </button>
        </form>
    );
}

// BoxChoiceModal removed — packaging selection is now inline via the selector bar

export default function ShopPage() {
    const [bonbons, setBonbons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoryLabels, setCategoryLabels] = useState(DEFAULT_CATEGORY_LABELS);
    const [grouped, setGrouped] = useState({});
    const [boxPrices, setBoxPrices] = useState({});
    const [loading, setLoading] = useState(true);

    // Box choice state — customBoxes is an array of { size, id } to support mixed sizes
    const [wantsBox, setWantsBox] = useState(false);
    const [customBoxes, setCustomBoxes] = useState([]); // e.g. [{size:'4-piece',id:1},{size:'16-piece',id:2}]
    const [nextBoxId, setNextBoxId] = useState(2);
    const [allowLooseBonbons, setAllowLooseBonbons] = useState(false);
    const [showCartFullPrompt, setShowCartFullPrompt] = useState(false);


    // Custom bonbon cart
    const [cart, setCart] = useState({});
    const [cartOpen, setCartOpen] = useState(false);

    // Best Seller cart: array of { boxSize, qty }
    const [bestSellerCart, setBestSellerCart] = useState([]);

    // Best Seller UI state
    const [bestSellerSize, setBestSellerSize] = useState(null);
    const [bestSellerQty, setBestSellerQty] = useState(1);

    // Order form
    const [orderForm, setOrderForm] = useState({
        customerName: '',
        userEmail: '',
        phoneNumber: '',
        countryCode: '+251',
        pickUpType: 'pickup',
        pickupDate: '',
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
        const mergedNames = Array.from(new Set([...DEFAULT_CATEGORY_ORDER, ...uniqueActiveCats])).filter(name => uniqueActiveCats.includes(name));

        const finalCategories = mergedNames.map(name => {
            const dbCat = dbCats.find(c => c.name === name);
            return { name, image_url: dbCat?.image_url || null };
        });
        setCategories(finalCategories);

        const newLabels = { ...DEFAULT_CATEGORY_LABELS };
        mergedNames.forEach(c => { if (!newLabels[c]) newLabels[c] = c; });
        setCategoryLabels(newLabels);

        if (priceRes.data) {
            const p = {};
            priceRes.data.forEach(r => { p[r.box_size] = r.price; });
            setBoxPrices(p);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // --- Derive max pieces from box choice ---
    // Total capacity is the sum of all box capacities
    const totalBoxCapacity = customBoxes.reduce((sum, box) => {
        const bObj = BOX_SIZES.find(b => b.key === box.size);
        return sum + (bObj ? bObj.pieces : 0);
    }, 0);
    const currentLimit = wantsBox ? (allowLooseBonbons ? Infinity : totalBoxCapacity) : 40;
    // For backward compat: selectedBoxSize is the first box's size, customBoxQuantity is count
    const selectedBoxSize = customBoxes.length > 0 ? customBoxes[0].size : null;
    const boxSizeObj = BOX_SIZES.find(b => b.key === selectedBoxSize);

    // --- Custom Cart Logic ---
    const totalPieces = Object.values(cart).reduce((s, v) => s + v, 0);

    function addToCart(bonbonId) {
        if (wantsBox && !allowLooseBonbons && totalPieces >= totalBoxCapacity) {
            setShowCartFullPrompt(true);
            return;
        }
        if (!wantsBox && totalPieces >= 40) return; // arbitrary limit without box
        
        const bonbon = bonbons.find(b => b.id === bonbonId);
        if (bonbon && bonbon.stock !== null && bonbon.stock !== undefined) {
            const inCart = cart[bonbonId] || 0;
            if (inCart >= bonbon.stock) return;
        }
        
        const newTotal = totalPieces + 1;
        setCart(prev => ({ ...prev, [bonbonId]: (prev[bonbonId] || 0) + 1 }));

        if (wantsBox && !allowLooseBonbons && newTotal === totalBoxCapacity) {
            setShowCartFullPrompt(true);
        }
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

    // --- Best Seller Cart Logic ---
    function addBestSellerToCart() {
        if (!bestSellerSize || bestSellerQty < 1) return;
        setBestSellerCart(prev => {
            const existing = prev.find(i => i.boxSize === bestSellerSize);
            if (existing) {
                return prev.map(i => i.boxSize === bestSellerSize ? { ...i, qty: i.qty + bestSellerQty } : i);
            }
            return [...prev, { boxSize: bestSellerSize, qty: bestSellerQty }];
        });
        setBestSellerSize(null);
        setBestSellerQty(1);
        setCartOpen(true);
    }

    function removeBestSellerItem(boxSize) {
        setBestSellerCart(prev => prev.filter(i => i.boxSize !== boxSize));
    }

    function updateBestSellerQty(boxSize, delta) {
        setBestSellerCart(prev => prev.map(i => {
            if (i.boxSize !== boxSize) return i;
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : i;
        }).filter(i => i.qty > 0));
    }

    // --- Totals ---
    function calculateCustomTotal() {
        let total = 0;
        
        if (wantsBox && customBoxes.length > 0) {
            // Sum up price for each box
            for (const box of customBoxes) {
                total += boxPrices[box.size] || 0;
            }
            
            if (allowLooseBonbons && totalPieces > totalBoxCapacity) {
                let piecesCounted = 0;
                for (const [bonbonId, qty] of Object.entries(cart)) {
                    const b = bonbons.find(x => x.id === bonbonId);
                    if (!b) continue;
                    for(let i=0; i<qty; i++) {
                        piecesCounted++;
                        if (piecesCounted > totalBoxCapacity) {
                            total += b.price;
                        }
                    }
                }
            }
            
            return totalPieces > 0 ? total : 0;
        }
        
        for (const [bonbonId, qty] of Object.entries(cart)) {
            const b = bonbons.find(x => x.id === bonbonId);
            if (b) total += b.price * qty;
        }
        return total;
    }

    function calculateBestSellerTotal() {
        return bestSellerCart.reduce((sum, item) => sum + (boxPrices[item.boxSize] || 0) * item.qty, 0);
    }

    const customTotal = calculateCustomTotal();
    const bestSellerTotal = calculateBestSellerTotal();
    const grandTotal = customTotal + bestSellerTotal;

    const hasCustomItems = totalPieces > 0;
    const hasBestSellerItems = bestSellerCart.length > 0;
    const hasAnyItems = hasCustomItems || hasBestSellerItems;

    const totalCartCount = totalPieces + bestSellerCart.reduce((s, i) => {
        const bs = BOX_SIZES.find(b => b.key === i.boxSize);
        return s + (bs ? bs.pieces * i.qty : 0);
    }, 0);

    function handleBoxChoice(wants, size) {
        setWantsBox(wants);
        if (wants && size) {
            setCustomBoxes([{ size, id: 1 }]);
            setNextBoxId(2);
        } else {
            setCustomBoxes([]);
        }
        setAllowLooseBonbons(false);
        setCart({});
    }

    function addAnotherBox(size) {
        setCustomBoxes(prev => [...prev, { size, id: nextBoxId }]);
        setNextBoxId(prev => prev + 1);
    }

    function removeLastBox() {
        setCustomBoxes(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    }

    function clearAll() {
        clearCart();
        setBestSellerCart([]);
    }

    // --- Unified Order Submission ---
    async function submitOrder(e) {
        e.preventDefault();
        if (!hasAnyItems) return;

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
                orderType: hasBestSellerItems && !hasCustomItems ? 'bestSeller' : hasCustomItems && !hasBestSellerItems ? 'custom' : 'mixed',
                items: items.length > 0 ? items : undefined,
                bestSellerItems: bestSellerCart.length > 0 ? bestSellerCart : undefined,
                wantsBox: wantsBox || false,
                selectedBoxSize: selectedBoxSize || null,
                customBoxQuantity: wantsBox ? customBoxes.length : 1,
                customBoxes: wantsBox ? customBoxes.map(b => b.size) : [],
                orderSource: 'online',
            }),
        });

        const data = await res.json();
        setSubmitting(false);
        if (data.success) {
            setSuccessItems(items);
            setOrderSuccess(data.order);
            clearAll();
            setCartOpen(false);
            setOrderForm({ customerName: '', userEmail: '', phoneNumber: '', countryCode: '+251', pickUpType: 'pickup', pickupDate: '', preferredContact: 'whatsapp' });
            fetchData();
        } else {
            setOrderError(data.error);
        }
    }

    // Cart Full Prompt Overlay — now lets user pick a different box size
    const [addBoxPickerOpen, setAddBoxPickerOpen] = useState(false);
    function renderCartFullPrompt() {
        if (!showCartFullPrompt) return null;
        const lastBox = customBoxes[customBoxes.length - 1];
        const lastBoxObj = BOX_SIZES.find(b => b.key === lastBox?.size);
        return (
            <div className="shop-success-overlay" onClick={() => { setShowCartFullPrompt(false); setAddBoxPickerOpen(false); }}>
                <div className="shop-success-card" onClick={e => e.stopPropagation()}>
                    <div className="shop-success-icon">🎁</div>
                    <h3>Box Filled!</h3>
                    <p>Your {lastBoxObj?.label} box is now full. What would you like to do next?</p>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem'}}>
                        {!addBoxPickerOpen ? (
                            <button 
                                className="shop-btn-primary" 
                                onClick={() => setAddBoxPickerOpen(true)}
                            >
                                Add Another Box
                            </button>
                        ) : (
                            <div>
                                <p style={{fontSize: '0.8rem', color: '#9a8b78', marginBottom: '0.6rem', fontWeight: 600}}>Choose box size:</p>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem'}}>
                                    {BOX_SIZES.map(b => (
                                        <button
                                            key={b.key}
                                            className="shop-btn-primary"
                                            style={{fontSize: '0.7rem', padding: '0.6rem 0.5rem'}}
                                            onClick={() => {
                                                addAnotherBox(b.key);
                                                setShowCartFullPrompt(false);
                                                setAddBoxPickerOpen(false);
                                            }}
                                        >
                                            {b.label} — {boxPrices[b.key] || '—'} ETB
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <button 
                            className="box-choice-btn box-choice-no"
                            onClick={() => {
                                setAllowLooseBonbons(true);
                                setShowCartFullPrompt(false);
                                setAddBoxPickerOpen(false);
                            }}
                        >
                            Add Loose Bonbons
                        </button>
                        <button 
                            className="box-choice-btn box-choice-back"
                            onClick={() => {
                                setCartOpen(true);
                                setShowCartFullPrompt(false);
                                setAddBoxPickerOpen(false);
                            }}
                        >
                            View Cart
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Success overlay
    function renderSuccessOverlay() {
        if (!orderSuccess) return null;
        return (
            <div className="shop-success-overlay" onClick={() => { setOrderSuccess(null); setWantsBox(false); setCustomBoxes([]); }}>
                <div className="shop-success-card" onClick={e => e.stopPropagation()}>
                    <div className="shop-success-icon">✓</div>
                    <h3>Order Placed!</h3>
                    <p>Your order has been received. We&apos;ll get in touch shortly.</p>
                    {successItems.length > 0 && (
                        <div className="shop-success-items">
                            {successItems.map((item, i) => (
                                <div key={i} className="success-item">
                                    {item.imageUrl && <img src={item.imageUrl} alt={item.bonbonName} loading="lazy" />}
                                    <span className="success-item-qty">{item.quantity}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="shop-success-amount">{orderSuccess.amount} ETB</p>
                    {orderSuccess.order_code && (
                        <div style={{marginTop: '1rem', padding: '1rem', background: '#f8f5f0', borderRadius: '12px', border: '1px dashed #d1c7ba'}}>
                            <p style={{fontSize: '0.7rem', color: '#9a8b78', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem'}}>Order Code</p>
                            <p style={{fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', color: '#2c241a'}}>{orderSuccess.order_code}</p>
                            <p style={{fontSize: '0.65rem', color: '#9a8b78', marginTop: '0.5rem'}}>Save this code to track your order status.</p>
                        </div>
                    )}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', width: '100%'}}>
                        <button onClick={() => { setOrderSuccess(null); setWantsBox(false); setCustomBoxes([]); }} className="shop-btn-primary">Continue Shopping</button>
                        <a href="/status" style={{fontSize: '0.75rem', color: '#9a8b78', textDecoration: 'underline', fontWeight: 600}}>Track Order Status</a>
                    </div>
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

    return (
        <div className="shop-page">
            {/* Hero */}
            <header className="shop-hero">
                <div className="shop-hero-content">
                    <p className="shop-hero-tag">Chocolatier Adey</p>
                    <h1 className="shop-hero-title">The Bonbon Collection</h1>
                    <p className="shop-hero-sub">Handcrafted, one bonbon at a time.</p>
                </div>
            </header>

            {/* Box choice selector */}
            <div className="shop-box-selector">
                <div className="shop-box-selector-label">Packaging:</div>
                <div className="shop-box-selector-options">
                    <button 
                        className={`box-opt-btn ${wantsBox === false ? 'active' : ''}`}
                        onClick={() => {
                            if (wantsBox === false) return;
                            handleBoxChoice(false, null);
                        }}
                    >
                        No Box
                    </button>
                    {BOX_SIZES.map(b => (
                        <button 
                            key={b.key}
                            className={`box-opt-btn ${wantsBox && customBoxes.length > 0 && customBoxes[0].size === b.key ? 'active' : ''}`}
                            onClick={() => {
                                if (wantsBox && customBoxes.length > 0 && customBoxes[0].size === b.key) return;
                                handleBoxChoice(true, b.key);
                            }}
                        >
                            {b.pieces} Piece
                        </button>
                    ))}
                </div>
            </div>

            {/* Cart FAB */}
            <button className="shop-cart-fab" onClick={() => setCartOpen(true)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {totalCartCount > 0 && <span className="shop-cart-count">{totalCartCount}</span>}
            </button>

            {/* Category Tabs */}
            <nav className="shop-category-nav">
                <button
                    onClick={() => setActiveCategory('all')}
                    className={`shop-cat-tab ${activeCategory === 'all' ? 'active' : ''}`}
                >All</button>
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
                >★ Best Sellers Box</button>
            </nav>

            {/* Piece limit banner */}
            {totalPieces > 0 && activeCategory !== 'bestSellers' && (
                <div className="shop-limit-banner">
                    <span>{totalPieces}/{wantsBox && !allowLooseBonbons ? totalBoxCapacity : '∞'} pieces selected</span>
                    {wantsBox && !allowLooseBonbons && totalPieces >= totalBoxCapacity && <span className="shop-limit-full">Box Full</span>}
                </div>
            )}

            {/* BEST SELLERS Section — now adds to cart */}
            {activeCategory === 'bestSellers' && (
                <section className="shop-best-sellers">
                    <div className="shop-section-header">
                        <h2>Best Sellers Box</h2>
                        <p>Let us pick the perfect assortment for you. Choose a box size and add it to your cart.</p>
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
                            <button
                                onClick={addBestSellerToCart}
                                className="shop-btn-primary"
                                style={{ marginTop: '0.5rem' }}
                            >
                                Add to Cart — {bestSellerQty}× {bestSellerSize.replace('-piece', ' Piece')}
                            </button>
                        </div>
                    )}

                    {/* Show current best seller items in cart */}
                    {bestSellerCart.length > 0 && (
                        <div className="bs-cart-preview">
                            <p className="bs-cart-preview-title">Best Sellers in Cart:</p>
                            {bestSellerCart.map(item => (
                                <div key={item.boxSize} className="bs-cart-preview-item">
                                    <span>{item.qty}× {item.boxSize.replace('-piece', ' Piece')} Box</span>
                                    <span>{(boxPrices[item.boxSize] || 0) * item.qty} ETB</span>
                                </div>
                            ))}
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
                                            <img src={catObj.image_url} alt={cat} className="w-full h-full object-cover" loading="lazy" />
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
                                                maxPieces={currentLimit}
                                                onAdd={addToCart}
                                                onRemove={removeFromCart}
                                                hidePrice={wantsBox}
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

                {!hasAnyItems ? (
                    <div className="shop-cart-empty">
                        <p>Your cart is empty</p>
                        <p className="shop-cart-empty-sub">Add some bonbons to get started</p>
                    </div>
                ) : (
                    <>
                        <div className="shop-cart-items">
                            {/* Custom bonbon items */}
                            {hasCustomItems && (
                                <>
                                    {wantsBox && customBoxes.length > 0 ? (
                                        /* Multi-box layout: show Box 1, Box 2, etc. based on customBoxes array */
                                        (() => {
                                            const allItems = cartBonbons.flatMap(({ bonbon, qty }) =>
                                                Array.from({ length: qty }, () => bonbon)
                                            );
                                            
                                            let currentItemIndex = 0;
                                            const boxesData = customBoxes.map((box, boxIdx) => {
                                                const boxCapacity = BOX_SIZES.find(b => b.key === box.size)?.pieces || 0;
                                                const boxItems = allItems.slice(currentItemIndex, currentItemIndex + boxCapacity);
                                                currentItemIndex += boxCapacity;
                                                return { box, boxCapacity, boxItems, boxIdx };
                                            });
                                            
                                            const looseItems = allItems.slice(currentItemIndex);

                                            return (
                                                <>
                                                    {boxesData.map(({ box, boxCapacity, boxItems, boxIdx }) => {
                                                        const bObj = BOX_SIZES.find(b => b.key === box.size);
                                                        // Count unique bonbons in this box
                                                        const counts = {};
                                                        boxItems.forEach(b => { counts[b.id] = (counts[b.id] || 0) + 1; });
                                                        const uniqueItems = Object.entries(counts).map(([id, qty]) => ({
                                                            bonbon: bonbons.find(b => b.id === id),
                                                            qty,
                                                        })).filter(x => x.bonbon);

                                                        return (
                                                            <div key={box.id}>
                                                                <div className="shop-cart-section-label" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: boxIdx > 0 ? '0.75rem' : 0}}>
                                                                    <span>📦 Box {boxIdx + 1}</span>
                                                                    <span style={{fontSize: '0.6rem', padding: '0.15rem 0.5rem', background: '#eae5dd', borderRadius: '4px', fontFamily: 'inherit'}}>
                                                                        {bObj?.label} · {boxItems.length}/{boxCapacity}
                                                                    </span>
                                                                </div>
                                                                {uniqueItems.map(({ bonbon, qty }) => (
                                                                    <div key={bonbon.id} className="shop-cart-item">
                                                                        {bonbon.image_url && (
                                                                            <img src={bonbon.image_url} alt={bonbon.name} className="shop-cart-item-img" />
                                                                        )}
                                                                        <div className="shop-cart-item-info">
                                                                            <p className="shop-cart-item-name">{bonbon.name}</p>
                                                                            <p className="shop-cart-item-cat">×{qty}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {boxItems.length === 0 && (
                                                                    <div style={{padding: '0.75rem 0', fontSize: '0.75rem', color: '#c5bdb0', fontStyle: 'italic'}}>
                                                                        Empty — add more bonbons
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                    {allowLooseBonbons && looseItems.length > 0 && (() => {
                                                        const counts = {};
                                                        looseItems.forEach(b => { counts[b.id] = (counts[b.id] || 0) + 1; });
                                                        const uniqueLoose = Object.entries(counts).map(([id, qty]) => ({
                                                            bonbon: bonbons.find(b => b.id === id),
                                                            qty,
                                                        })).filter(x => x.bonbon);
                                                        return (
                                                            <div>
                                                                <div className="shop-cart-section-label" style={{marginTop: '0.75rem'}}>
                                                                    🍫 Loose Bonbons
                                                                </div>
                                                                {uniqueLoose.map(({ bonbon, qty }) => (
                                                                    <div key={bonbon.id} className="shop-cart-item">
                                                                        {bonbon.image_url && (
                                                                            <img src={bonbon.image_url} alt={bonbon.name} className="shop-cart-item-img" />
                                                                        )}
                                                                        <div className="shop-cart-item-info">
                                                                            <p className="shop-cart-item-name">{bonbon.name}</p>
                                                                            <p className="shop-cart-item-cat">{bonbon.price} ETB × {qty}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </>
                                            );
                                        })()
                                    ) : (
                                        /* Single box or no box */
                                        <>
                                            <div className="shop-cart-section-label" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <span>{wantsBox ? `📦 ${boxSizeObj?.label} Box` : '🍫 Individual Bonbons'}</span>
                                                {wantsBox && (
                                                    <span style={{fontSize: '0.6rem', padding: '0.15rem 0.5rem', background: '#eae5dd', borderRadius: '4px', fontFamily: 'inherit'}}>
                                                        {totalPieces}/{MAX_PIECES}
                                                    </span>
                                                )}
                                            </div>
                                            {cartBonbons.map(({ bonbon, qty }) => (
                                                <div key={bonbon.id} className="shop-cart-item">
                                                    {bonbon.image_url && (
                                                        <img src={bonbon.image_url} alt={bonbon.name} className="shop-cart-item-img" />
                                                    )}
                                                    <div className="shop-cart-item-info">
                                                        <p className="shop-cart-item-name">{bonbon.name}</p>
                                                        {(!wantsBox || allowLooseBonbons) && (
                                                            <p className="shop-cart-item-cat">{bonbon.price} ETB × {qty}</p>
                                                        )}
                                                        {wantsBox && !allowLooseBonbons && (
                                                            <p className="shop-cart-item-cat">×{qty}</p>
                                                        )}
                                                    </div>
                                                    <div className="bonbon-qty-control small">
                                                        <button onClick={() => removeFromCart(bonbon.id)} className="qty-btn">−</button>
                                                        <span className="qty-value">{qty}</span>
                                                        <button onClick={() => addToCart(bonbon.id)} className="qty-btn" disabled={wantsBox && !allowLooseBonbons && totalPieces >= MAX_PIECES * customBoxQuantity}>+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                    {/* Quantity controls for all items (always shown) */}
                                    {wantsBox && customBoxes.length > 1 && (
                                        <div style={{padding: '0.5rem 0', borderTop: '1px solid #eae5dd', marginTop: '0.5rem'}}>
                                            <p style={{fontSize: '0.65rem', color: '#9a8b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem'}}>Adjust quantities</p>
                                            {cartBonbons.map(({ bonbon, qty }) => (
                                                <div key={bonbon.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.3rem 0'}}>
                                                    <span style={{fontSize: '0.75rem', color: '#2c2418', fontWeight: 500}}>{bonbon.name}</span>
                                                    <div className="bonbon-qty-control small">
                                                        <button onClick={() => removeFromCart(bonbon.id)} className="qty-btn">−</button>
                                                        <span className="qty-value">{qty}</span>
                                                        <button onClick={() => addToCart(bonbon.id)} className="qty-btn" disabled={wantsBox && !allowLooseBonbons && totalPieces >= totalBoxCapacity}>+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Box action buttons */}
                                    {wantsBox && (
                                        <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap'}}>
                                            <div style={{width: '100%'}}>
                                                <p style={{fontSize: '0.65rem', color: '#9a8b78', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem'}}>Add another box:</p>
                                                <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem'}}>
                                                    {BOX_SIZES.map(b => (
                                                        <button
                                                            key={b.key}
                                                            type="button"
                                                            onClick={() => addAnotherBox(b.key)}
                                                            style={{
                                                                flex: 1, padding: '0.4rem 0.5rem', fontSize: '0.6rem', fontWeight: 700,
                                                                textTransform: 'uppercase', letterSpacing: '-0.01em',
                                                                border: '1.5px solid #1a1a1a', borderRadius: '0.5rem',
                                                                background: 'transparent', color: '#1a1a1a', cursor: 'pointer',
                                                                transition: 'all 0.2s', whiteSpace: 'nowrap',
                                                                minWidth: 'fit-content'
                                                            }}
                                                        >
                                                            + {b.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {customBoxes.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeLastBox()}
                                                    style={{
                                                        padding: '0.5rem 0.75rem', fontSize: '0.65rem', fontWeight: 700,
                                                        textTransform: 'uppercase', letterSpacing: '-0.01em',
                                                        border: '1.5px solid #e5e0d8', borderRadius: '0.75rem',
                                                        background: 'transparent', color: '#999', cursor: 'pointer',
                                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    − Remove Last Box
                                                </button>
                                            )}
                                            {!allowLooseBonbons && (
                                                <button
                                                    type="button"
                                                    onClick={() => setAllowLooseBonbons(true)}
                                                    style={{
                                                        flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.65rem', fontWeight: 700,
                                                        textTransform: 'uppercase', letterSpacing: '-0.01em',
                                                        border: '1.5px solid #e5e0d8', borderRadius: '0.75rem',
                                                        background: 'transparent', color: '#666', cursor: 'pointer',
                                                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                                                    }}
                                                >
                                                    + Loose Bonbons
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Best Seller items */}
                            {hasBestSellerItems && (
                                <>
                                    <div className="shop-cart-section-label" style={hasCustomItems ? { marginTop: '1rem' } : {}}>
                                        ★ Best Sellers
                                    </div>
                                    {bestSellerCart.map(item => {
                                        const bsObj = BOX_SIZES.find(b => b.key === item.boxSize);
                                        return (
                                            <div key={item.boxSize} className="shop-cart-item">
                                                <div className="shop-cart-bs-icon">★</div>
                                                <div className="shop-cart-item-info">
                                                    <p className="shop-cart-item-name">{bsObj?.label || item.boxSize} Box</p>
                                                    <p className="shop-cart-item-cat">{boxPrices[item.boxSize] || '—'} ETB × {item.qty}</p>
                                                </div>
                                                <div className="bonbon-qty-control small">
                                                    <button onClick={() => updateBestSellerQty(item.boxSize, -1)} className="qty-btn">−</button>
                                                    <span className="qty-value">{item.qty}</span>
                                                    <button onClick={() => updateBestSellerQty(item.boxSize, 1)} className="qty-btn">+</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </div>

                        {/* Cart Summary */}
                        <div className="shop-cart-breakdown">
                            <h4>Order Summary</h4>
                            <div className="breakdown-list">
                                {/* Custom section */}
                                {hasCustomItems && wantsBox && customBoxes.map((box, idx) => {
                                    const bObj = BOX_SIZES.find(b => b.key === box.size);
                                    return (
                                        <div key={box.id} className="breakdown-row">
                                            <span>📦 Box {idx + 1} ({bObj?.label})</span>
                                            <span>{boxPrices[box.size]} ETB</span>
                                        </div>
                                    );
                                })}
                                {hasCustomItems && wantsBox && allowLooseBonbons && totalPieces > totalBoxCapacity && (
                                    <div className="breakdown-row">
                                        <span>🍫 Loose Bonbons ({totalPieces - totalBoxCapacity} pcs)</span>
                                        <span>{customTotal - customBoxes.reduce((sum, box) => sum + (boxPrices[box.size] || 0), 0)} ETB</span>
                                    </div>
                                )}
                                {hasCustomItems && !wantsBox && cartBonbons.map(({ bonbon, qty }) => (
                                    <div key={bonbon.id} className="breakdown-row">
                                        <span>{qty}× {bonbon.name}</span>
                                        <span>{bonbon.price * qty} ETB</span>
                                    </div>
                                ))}
                                {/* Best seller section */}
                                {bestSellerCart.map(item => {
                                    const bsObj = BOX_SIZES.find(b => b.key === item.boxSize);
                                    return (
                                        <div key={item.boxSize} className="breakdown-row">
                                            <span>★ {item.qty}× {bsObj?.label} Box</span>
                                            <span>{(boxPrices[item.boxSize] || 0) * item.qty} ETB</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="breakdown-total">
                                <span>Total</span>
                                <span>{grandTotal} ETB</span>
                            </div>
                        </div>

                        {/* Order Form */}
                        <div className="shop-cart-form-area">
                            <OrderFormFields
                                onSubmit={submitOrder}
                                submitLabel={`Place Order — ${grandTotal} ETB`}
                                disabled={!hasAnyItems}
                                orderForm={orderForm}
                                setOrderForm={setOrderForm}
                                submitting={submitting}
                                orderError={orderError}
                            />
                        </div>

                        <button onClick={clearAll} className="shop-cart-clear">Clear Cart</button>
                    </>
                )}
            </aside>

            {renderCartFullPrompt()}
            {renderSuccessOverlay()}
            <div></div>
        </div>
    );
}