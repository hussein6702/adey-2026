'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../supabase';
import { Check } from 'lucide-react';

const BOX_SIZES = [
    { key: '4-piece', label: '4 Piece', pieces: 4 },
    { key: '9-piece', label: '9 Piece', pieces: 9 },
    { key: '16-piece', label: '16 Piece', pieces: 16 },
    { key: '40-piece', label: '40 Piece', pieces: 40 },
];

export default function WalkInsPage() {
    const [bonbons, setBonbons] = useState([]);
    const [boxPrices, setBoxPrices] = useState({});
    const [loading, setLoading] = useState(true);

    // Box choice
    const [wantsBox, setWantsBox] = useState(true);
    const [selectedBoxSize, setSelectedBoxSize] = useState('4-piece');

    // Cart
    const [cart, setCart] = useState({});

    // Order form
    const [customerName, setCustomerName] = useState('');
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);

    // Active category
    const [activeCategory, setActiveCategory] = useState('all');

    const fetchData = useCallback(async () => {
        const [bonbonRes, priceRes] = await Promise.all([
            supabase.from('bonbons').select('*').eq('active', true).order('category').order('name'),
            supabase.from('box_prices').select('*'),
        ]);
        if (bonbonRes.data) setBonbons(bonbonRes.data);
        if (priceRes.data) {
            const p = {};
            priceRes.data.forEach(r => { p[r.box_size] = r.price; });
            setBoxPrices(p);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Derive max pieces
    const boxSizeObj = BOX_SIZES.find(b => b.key === selectedBoxSize);
    const MAX_PIECES = wantsBox && boxSizeObj ? boxSizeObj.pieces : 40;

    const totalPieces = Object.values(cart).reduce((s, v) => s + v, 0);

    // Group bonbons by category
    const grouped = {};
    bonbons.forEach(b => {
        if (!grouped[b.category]) grouped[b.category] = [];
        grouped[b.category].push(b);
    });
    const categoryNames = Object.keys(grouped).sort();

    function addToCart(bonbonId) {
        if (totalPieces >= MAX_PIECES) return;
        const bonbon = bonbons.find(b => b.id === bonbonId);
        if (bonbon && bonbon.stock !== null && bonbon.stock !== undefined) {
            const inCart = cart[bonbonId] || 0;
            if (inCart >= bonbon.stock) return;
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

    function calculateTotal() {
        if (wantsBox && selectedBoxSize && boxPrices[selectedBoxSize]) {
            return boxPrices[selectedBoxSize];
        }
        let total = 0;
        for (const [bonbonId, qty] of Object.entries(cart)) {
            const b = bonbons.find(x => x.id === bonbonId);
            if (b) total += b.price * qty;
        }
        return total;
    }

    async function submitWalkInOrder(e) {
        e.preventDefault();
        if (totalPieces === 0) return;

        setSubmitting(true);
        setError(null);

        const items = Object.entries(cart).map(([bonbonId, quantity]) => {
            const b = bonbons.find(x => x.id === bonbonId);
            return { bonbonId, bonbonName: b?.name || '', quantity, imageUrl: b?.image_url || '' };
        });

        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                customerName: customerName || 'Walk-in Customer',
                userEmail: 'walk-in@store.local',
                phoneNumber: '0000000000',
                countryCode: '+251',
                pickUpType: 'pickup',
                preferredContact: 'whatsapp',
                orderType: 'custom',
                items,
                wantsBox,
                orderSource: 'walk-in',
            }),
        });

        const data = await res.json();
        setSubmitting(false);

        if (data.success) {
            setSuccess({ amount: data.order.amount, items, name: customerName || 'Walk-in Customer' });
            clearCart();
            setCustomerName('');
            setNotes('');
            fetchData(); // Refresh stock
        } else {
            setError(data.error);
        }
    }

    const cartTotal = calculateTotal();
    const cartBonbons = Object.entries(cart).map(([id, qty]) => ({
        bonbon: bonbons.find(b => b.id === id),
        qty,
    })).filter(x => x.bonbon);

    if (loading) return <div className="text-gray-400 text-lg tracking-tight uppercase p-20 font-bold">Loading...</div>;

    return (
        <div className="w-full">
            <header className="mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight uppercase">Walk-in Orders</h1>
                <p className="text-gray-400 text-sm md:text-base mt-2 font-medium">Log orders for walk-in customers</p>
            </header>

            {/* Success banner */}
            {success && (
                <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <Check size={20} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-green-800 font-bold text-base">Order logged for {success.name}</p>
                        <p className="text-green-600 text-sm mt-1">{success.items.reduce((s, i) => s + i.quantity, 0)} bonbons — {success.amount} ETB</p>
                    </div>
                    <button onClick={() => setSuccess(null)} className="text-green-300 hover:text-green-600 transition-colors font-bold text-sm">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Bonbon Selection */}
                <div className="lg:col-span-2">
                    {/* Box config */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-900 text-sm font-bold uppercase tracking-tight">Box Configuration</h3>
                            <button
                                type="button"
                                onClick={() => { setWantsBox(!wantsBox); clearCart(); }}
                                className={`text-[10px] uppercase tracking-tight px-4 py-2 border rounded-xl font-bold transition-all ${
                                    wantsBox 
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-900'
                                }`}
                            >
                                {wantsBox ? '📦 Box: Yes' : '🍫 No Box'}
                            </button>
                        </div>
                        {wantsBox && (
                            <div className="flex gap-3 flex-wrap">
                                {BOX_SIZES.map(({ key, label, pieces }) => (
                                    <button
                                        key={key}
                                        onClick={() => { setSelectedBoxSize(key); clearCart(); }}
                                        className={`text-xs uppercase tracking-tight px-5 py-2.5 border-2 rounded-xl font-bold transition-all ${
                                            selectedBoxSize === key 
                                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                                : 'bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-900'
                                        }`}
                                    >
                                        {label} ({boxPrices[key] || '—'} ETB)
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Progress bar */}
                    {totalPieces > 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4 mb-6">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tight mb-2">
                                <span className="text-gray-500">{totalPieces}/{MAX_PIECES} pieces</span>
                                {totalPieces >= MAX_PIECES && <span className="text-red-500">Full</span>}
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all ${totalPieces >= MAX_PIECES ? 'bg-red-500' : 'bg-gray-900'}`}
                                    style={{ width: `${Math.min(100, (totalPieces / MAX_PIECES) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Category tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        <button
                            onClick={() => setActiveCategory('all')}
                            className={`text-[10px] uppercase tracking-tight px-5 py-2 border rounded-xl font-bold transition-all ${
                                activeCategory === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-900 hover:text-gray-900'
                            }`}
                        >
                            All
                        </button>
                        {categoryNames.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`text-[10px] uppercase tracking-tight px-5 py-2 border rounded-xl font-bold transition-all ${
                                    activeCategory === cat ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-900 hover:text-gray-900'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Bonbon grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {bonbons
                            .filter(b => activeCategory === 'all' || b.category === activeCategory)
                            .map(b => {
                                const inCart = cart[b.id] || 0;
                                const outOfStock = b.stock !== null && b.stock !== undefined && b.stock <= 0;
                                const atStockLimit = b.stock !== null && b.stock !== undefined && inCart >= b.stock;
                                return (
                                    <div
                                        key={b.id}
                                        className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${inCart > 0 ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-100'} ${outOfStock ? 'opacity-40' : ''}`}
                                    >
                                        <div className="relative aspect-square bg-gray-50">
                                            {b.image_url ? (
                                                <img src={b.image_url} alt={b.name} className="w-full h-full object-contain" loading="lazy" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                                            )}
                                            {inCart > 0 && (
                                                <div className="absolute top-2 right-2 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-[10px] font-black">
                                                    {inCart}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <p className="text-gray-900 text-xs font-bold tracking-tight truncate">{b.name}</p>
                                            <p className="text-gray-400 text-[10px] font-bold font-mono">{b.price} ETB</p>
                                            <div className="mt-2 flex gap-1">
                                                {outOfStock ? (
                                                    <span className="text-[10px] text-red-400 uppercase font-bold">Sold out</span>
                                                ) : inCart > 0 ? (
                                                    <>
                                                        <button
                                                            onClick={() => removeFromCart(b.id)}
                                                            className="flex-1 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            −
                                                        </button>
                                                        <button
                                                            onClick={() => addToCart(b.id)}
                                                            className="flex-1 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-30"
                                                            disabled={totalPieces >= MAX_PIECES || atStockLimit}
                                                        >
                                                            +
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(b.id)}
                                                        className="w-full py-1.5 bg-gray-50 text-gray-600 text-[10px] font-bold uppercase tracking-tight rounded-lg border border-gray-100 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all disabled:opacity-30"
                                                        disabled={totalPieces >= MAX_PIECES}
                                                    >
                                                        Add
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-6">
                        <h3 className="text-gray-900 text-sm font-bold uppercase tracking-tight mb-6">Order Summary</h3>

                        <form onSubmit={submitWalkInOrder}>
                            <div className="mb-6">
                                <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-2 font-bold">Customer Name (optional)</label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="w-full bg-transparent border-b-2 border-gray-100 text-gray-900 text-base py-2 focus:outline-none focus:border-gray-900 transition-colors font-bold tracking-tight"
                                    placeholder="Walk-in Customer"
                                />
                            </div>

                            {cartBonbons.length > 0 ? (
                                <div className="space-y-2 mb-6">
                                    {cartBonbons.map(({ bonbon, qty }) => (
                                        <div key={bonbon.id} className="flex items-center justify-between py-2 border-b border-gray-50">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                {bonbon.image_url && (
                                                    <img src={bonbon.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-gray-900 text-xs font-bold truncate">{bonbon.name}</p>
                                                    <p className="text-gray-400 text-[10px]">{bonbon.price} × {qty}</p>
                                                </div>
                                            </div>
                                            <span className="text-gray-900 text-sm font-mono font-bold ml-2">{bonbon.price * qty}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-gray-300 text-xs uppercase font-bold tracking-tight mb-6">
                                    No items added
                                </div>
                            )}

                            {wantsBox && (
                                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 py-2 border-b border-gray-50">
                                    <span>📦 {boxSizeObj?.label} Box</span>
                                    <span>Included</span>
                                </div>
                            )}

                            <div className="flex justify-between text-xl font-bold text-gray-900 mb-6 pt-3 border-t border-gray-200">
                                <span>Total</span>
                                <span className="font-mono tracking-tighter">{cartTotal} ETB</span>
                            </div>

                            {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}

                            <button
                                type="submit"
                                disabled={totalPieces === 0 || submitting}
                                className="w-full py-3.5 bg-gray-900 text-white text-sm font-bold uppercase tracking-tight rounded-xl hover:bg-gray-800 transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Logging...' : `Log Order — ${cartTotal} ETB`}
                            </button>

                            {totalPieces > 0 && (
                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="w-full mt-3 py-2.5 text-red-400 text-xs font-bold uppercase tracking-tight border border-red-100 rounded-xl hover:bg-red-50 transition-all"
                                >
                                    Clear Cart
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
