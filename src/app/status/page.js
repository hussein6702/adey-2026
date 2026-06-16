'use client';
import { useState } from 'react';
import { supabase } from '../../../supabase';
import Link from 'next/link';
import { Search, Package, MapPin, Calendar, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

const STATUS_MAP = {
    received: { label: 'Order Received', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'We have received your order and it is awaiting confirmation.' },
    pending: { label: 'Pending', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Your order is being reviewed.' },
    confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Your order has been confirmed and is being prepared.' },
    completed: { label: 'Completed', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', desc: 'Your order has been fulfilled. Thank you for choosing Adey!' },
    cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', desc: 'This order has been cancelled.' },
};

export default function StatusPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    async function handleSearch(e) {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            // Search by code or phone number
            const { data, error: supabaseError } = await supabase
                .from('orders')
                .select('*')
                .or(`order_code.eq.${query.toUpperCase()},phone_number.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (supabaseError) throw supabaseError;

            if (data && data.length > 0) {
                setOrder(data[0]);
            } else {
                setError('No order found with that code or phone number.');
            }
        } catch (err) {
            console.error('Search error:', err);
            setError('An error occurred while searching. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const statusInfo = order ? (STATUS_MAP[order.status] || STATUS_MAP.received) : null;
    const StatusIcon = statusInfo?.icon;

    return (
        <div className="min-h-screen bg-[#faf9f6] font-sans text-[#2c241a]">
            {/* Header */}
            <header className="bg-white border-b border-[#eae5dd] py-6 px-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-[#2c241a]">
                        Adey<span className="text-[#9a8b78]">.</span>
                    </Link>
                    <Link href="/shop" className="text-xs font-bold uppercase tracking-widest text-[#9a8b78] hover:text-[#2c241a] transition-colors">
                        Back to Shop
                    </Link>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-12 md:py-20">
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Track Your Order</h1>
                    <p className="text-[#9a8b78] text-sm md:text-base">Enter your order code or phone number to see the current status of your handcrafted bonbons.</p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleSearch} className="relative mb-12">
                    <input
                        type="text"
                        placeholder="Order Code (e.g. AD123X) or Phone Number"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white border-2 border-[#eae5dd] rounded-2xl px-6 py-4 pr-16 focus:outline-none focus:border-[#2c241a] transition-all shadow-sm text-lg font-medium placeholder:text-[#c5bdb0]"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-3 top-3 bottom-3 aspect-square bg-[#2c241a] text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Search size={20} />
                        )}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 mb-8">
                        <AlertCircle className="text-red-500 shrink-0" size={20} />
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}

                {order && (
                    <div className="bg-white border border-[#eae5dd] rounded-3xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Status Banner */}
                        <div className={`${statusInfo.bg} px-8 py-10 text-center border-b border-[#eae5dd]`}>
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-6 bg-white shadow-sm`}>
                                <StatusIcon className={statusInfo.color} size={32} />
                            </div>
                            <h2 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>{statusInfo.label}</h2>
                            <p className="text-[#9a8b78] text-sm max-w-xs mx-auto font-medium">{statusInfo.desc}</p>
                        </div>

                        {/* Order Details */}
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c5bdb0] mb-2">Order Code</p>
                                    <p className="text-lg font-bold tracking-tight">{order.order_code || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#c5bdb0] mb-2">Order Date</p>
                                    <p className="text-lg font-bold tracking-tight">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#c5bdb0] pb-2 border-b border-[#faf9f6]">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Package size={18} className="text-[#c5bdb0]" />
                                        <p className="text-sm font-bold">{order.order_type === 'bestSeller' ? 'Best Seller Assortment' : 'Custom Collection'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin size={18} className="text-[#c5bdb0]" />
                                        <p className="text-sm font-bold uppercase tracking-tight">{order.pick_up_type}</p>
                                    </div>
                                    {order.pickup_date && (
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} className="text-[#c5bdb0]" />
                                            <p className="text-sm font-bold">{new Date(order.pickup_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-[#faf9f6] flex items-center justify-between">
                                <p className="text-sm font-bold text-[#c5bdb0]">Total Amount</p>
                                <p className="text-2xl font-black tracking-tighter">{order.amount} ETB</p>
                            </div>
                        </div>

                        <div className="bg-[#faf9f6] p-6 text-center text-[10px] font-bold uppercase tracking-widest text-[#c5bdb0]">
                            Thank you for your order
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="py-12 px-4 text-center border-t border-[#eae5dd] mt-12 bg-white">
                <p className="text-[#c5bdb0] text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Adey Chocolatier</p>
                <div className="flex justify-center gap-6">
                    <Link href="/about" className="text-[#c5bdb0] hover:text-[#2c241a] transition-colors text-[10px] font-bold uppercase tracking-widest">About</Link>
                    <Link href="/contact" className="text-[#c5bdb0] hover:text-[#2c241a] transition-colors text-[10px] font-bold uppercase tracking-widest">Contact</Link>
                    <Link href="/shop" className="text-[#c5bdb0] hover:text-[#2c241a] transition-colors text-[10px] font-bold uppercase tracking-widest">Shop</Link>
                </div>
            </footer>
        </div>
    );
}
