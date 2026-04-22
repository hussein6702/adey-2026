'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase';
import { ArrowUpDown } from 'lucide-react';

const STATUS_COLORS = {
    received: 'text-amber-600',
    pending: 'text-amber-600',
    confirmed: 'text-blue-600',
    completed: 'text-green-600',
    cancelled: 'text-red-500',
};

const SOURCE_STYLES = {
    online: 'text-indigo-600 border-indigo-100 bg-indigo-50',
    'walk-in': 'text-emerald-600 border-emerald-100 bg-emerald-50',
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [bonbons, setBonbons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewingOrder, setViewingOrder] = useState(null);
    
    const getLocalDateString = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState({
        start: getLocalDateString(),
        end: getLocalDateString(),
    });
    const [sortField, setSortField] = useState('created_at');
    const [sortDir, setSortDir] = useState('desc');

    // Lock body scroll when modal is open
    useEffect(() => {
        if (viewingOrder) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [viewingOrder]);

    useEffect(() => { fetchOrders(); }, []);

    async function fetchOrders() {
        const [ordersRes, bonbonsRes] = await Promise.all([
            supabase.from('orders').select('*').order('created_at', { ascending: false }),
            supabase.from('bonbons').select('*')
        ]);
        if (!ordersRes.error) setOrders(ordersRes.data || []);
        if (!bonbonsRes.error) setBonbons(bonbonsRes.data || []);
        setLoading(false);
    }

    async function updateStatus(orderId, nextStatus) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
        await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
    }

    function exportToCSV() {
        if (filteredOrders.length === 0) return;
        const headers = ['Date', 'Customer', 'Email', 'Phone', 'Type', 'Source', 'Amount', 'Status', 'Items'];
        const csvContent = [
            headers.join(','),
            ...filteredOrders.map(order => {
                const date = new Date(order.created_at).toLocaleDateString();
                const itemsStr = (order.order_items || []).map(i => `${i.quantity}x ${i.bonbonName}`).join(' | ');
                return [
                    `"${date}"`,
                    `"${order.customer_name}"`,
                    `"${order.user_email}"`,
                    `"${order.phone_number}"`,
                    `"${order.order_type}"`,
                    `"${order.order_source || 'online'}"`,
                    order.amount,
                    `"${order.status}"`,
                    `"${itemsStr}"`
                ].join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    }

    const filteredOrders = orders.filter(order => {
        const s = searchTerm.toLowerCase();
        if (s) {
            return (order.customer_name || '').toLowerCase().includes(s) ||
                   (order.phone_number || '').includes(s) ||
                   (order.user_email || '').toLowerCase().includes(s) ||
                   String(order.id).toLowerCase().includes(s);
        }
        const orderDate = getLocalDateString(new Date(order.created_at));
        return orderDate >= dateRange.start && orderDate <= dateRange.end;
    });

    // Sort
    const sortedOrders = [...filteredOrders].sort((a, b) => {
        let valA, valB;
        switch (sortField) {
            case 'created_at':
                valA = new Date(a.created_at).getTime();
                valB = new Date(b.created_at).getTime();
                break;
            case 'amount':
                valA = a.amount || 0;
                valB = b.amount || 0;
                break;
            case 'status':
                valA = a.status || '';
                valB = b.status || '';
                break;
            case 'customer_name':
                valA = (a.customer_name || '').toLowerCase();
                valB = (b.customer_name || '').toLowerCase();
                break;
            case 'order_source':
                valA = (a.order_source || 'online');
                valB = (b.order_source || 'online');
                break;
            default:
                valA = 0; valB = 0;
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });

    function toggleSort(field) {
        if (sortField === field) {
            setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    }

    function getMessageText(order) {
        let msg = `Hello ${order.customer_name},\n\nWe received your order for `;
        if (order.order_type === 'bestSeller') {
            msg += `a Best Seller Box (${order.composition ? Object.keys(order.composition)[0] : 'Assorted'}). `;
        } else {
            const itemCount = order.order_items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
            msg += `${itemCount} custom bonbons. `;
        }
        msg += `Your total is ${order.amount} ETB. We will contact you soon regarding your ${order.pick_up_type}!`;
        return encodeURIComponent(msg);
    }

    function getSourceLabel(source) {
        return source === 'walk-in' ? 'Walk-in' : 'Online';
    }

    if (loading) return <div className="p-20 text-gray-400 font-semibold uppercase tracking-tight text-base">Loading...</div>;

    return (
        <div className="w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 tracking-tight uppercase">Orders</h1>
                    <p className="text-gray-400 text-sm md:text-base mt-2 font-medium">Manage and track your customer transactions</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-stretch gap-3">
                    <input 
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-800 text-sm px-4 py-2.5 w-full sm:w-64 focus:outline-none focus:border-gray-900 tracking-tight rounded-xl shadow-sm transition-all"
                    />
                    <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-sm">
                        <input 
                            type="date" 
                            title="Start Date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent text-gray-700 text-xs font-bold uppercase tracking-tight focus:outline-none cursor-pointer"
                        />
                        <span className="text-gray-200">/</span>
                        <input 
                            type="date" 
                            title="End Date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent text-gray-700 text-xs font-bold uppercase tracking-tight focus:outline-none cursor-pointer"
                        />
                    </div>
                    <button
                        onClick={exportToCSV}
                        className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold uppercase tracking-tight hover:bg-gray-800 transition-all rounded-xl whitespace-nowrap"
                    >
                        Export CSV
                    </button>
                </div>
            </header>

            {/* Sort controls */}
            <div className="flex gap-2 mb-6 flex-wrap">
                <span className="text-gray-400 text-[10px] uppercase tracking-tight font-bold self-center mr-2">Sort by:</span>
                {[
                    { field: 'created_at', label: 'Date' },
                    { field: 'amount', label: 'Amount' },
                    { field: 'status', label: 'Status' },
                    { field: 'customer_name', label: 'Name' },
                    { field: 'order_source', label: 'Source' },
                ].map(s => (
                    <button
                        key={s.field}
                        onClick={() => toggleSort(s.field)}
                        className={`text-[10px] uppercase tracking-tight px-4 py-2 border rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                            sortField === s.field
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                : 'bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-900'
                        }`}
                    >
                        {s.label}
                        {sortField === s.field && (
                            <ArrowUpDown size={10} className={sortDir === 'asc' ? 'rotate-180' : ''} />
                        )}
                    </button>
                ))}
            </div>

            {/* Mobile: Card layout */}
            <div className="block md:hidden space-y-3">
                {sortedOrders.map(order => (
                    <div 
                        key={order.id} 
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 cursor-pointer active:bg-gray-50 transition-colors"
                        onClick={() => setViewingOrder(order)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-900 text-sm font-bold tracking-tight truncate">{order.customer_name}</p>
                                <p className="text-gray-400 text-[10px] font-medium truncate">{order.user_email}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-gray-900 font-mono text-lg font-bold tracking-tighter">{order.amount}</span>
                                <span className="text-gray-400 font-mono text-[10px]">ETB</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <select
                                value={order.status === 'pending' ? 'received' : (order.status || 'received')}
                                onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                                onClick={e => e.stopPropagation()}
                                className={`text-[10px] uppercase font-bold tracking-tight px-2 py-1 rounded-lg bg-white border border-gray-100 focus:outline-none ${STATUS_COLORS[order.status] || 'text-gray-500'}`}
                            >
                                <option value="received">Received</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${order.order_type === 'bestSeller' ? 'text-amber-600 border-amber-100 bg-amber-50' : order.order_type === 'mixed' ? 'text-purple-600 border-purple-100 bg-purple-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                                {order.order_type === 'bestSeller' ? 'Best Seller' : order.order_type === 'mixed' ? 'Mixed' : 'Custom'}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${SOURCE_STYLES[order.order_source] || SOURCE_STYLES['online']}`}>
                                {getSourceLabel(order.order_source)}
                            </span>
                            <span className="text-gray-400 font-mono text-[10px] font-bold ml-auto">
                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                            </span>
                        </div>
                    </div>
                ))}
                {sortedOrders.length === 0 && (
                    <div className="py-20 text-center text-gray-300 text-lg font-bold tracking-tight">
                        No orders found
                    </div>
                )}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-tight">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4 text-center">Amount</th>
                            <th className="px-6 py-4 text-right">Preview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {sortedOrders.map((order) => (
                            <tr 
                                key={order.id} 
                                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                                onClick={() => setViewingOrder(order)}
                            >
                                <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                    <select
                                        value={order.status === 'pending' ? 'received' : (order.status || 'received')}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className={`text-[10px] uppercase font-bold tracking-tight px-2 py-1.5 rounded-lg bg-white border border-gray-100 focus:outline-none ${STATUS_COLORS[order.status] || 'text-gray-500'}`}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <option value="received">Received</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-gray-400 font-mono text-xs font-bold">
                                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-gray-900 text-sm font-bold tracking-tight">{order.customer_name}</p>
                                    <p className="text-gray-400 text-[10px] font-medium">{order.user_email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${order.order_type === 'bestSeller' ? 'text-amber-600 border-amber-100 bg-amber-50' : order.order_type === 'mixed' ? 'text-purple-600 border-purple-100 bg-purple-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                                        {order.order_type === 'bestSeller' ? 'Best Seller' : order.order_type === 'mixed' ? 'Mixed' : 'Custom Box'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${SOURCE_STYLES[order.order_source] || SOURCE_STYLES['online']}`}>
                                        {getSourceLabel(order.order_source)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-900 font-mono text-lg text-center font-bold tracking-tighter">{order.amount}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-[-8px] pointer-events-none">
                                        {(order.order_items || []).slice(0, 3).map((item, i) => {
                                            const globalBonbon = bonbons.find(b => b.id === item.bonbonId);
                                            const itemImage = item.imageUrl || globalBonbon?.image_url;
                                            return itemImage ? (
                                                <img 
                                                    key={i} 
                                                    src={itemImage} 
                                                    alt="" 
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-white -ml-2 shadow-sm" 
                                                />
                                            ) : (
                                                <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white -ml-2 shadow-sm" />
                                            );
                                        })}
                                        {(order.order_items || []).length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-gray-900 border-2 border-white -ml-2 flex items-center justify-center text-[8px] font-black text-white">
                                                +{(order.order_items.length - 3)}
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedOrders.length === 0 && (
                    <div className="py-20 text-center text-gray-300 text-lg font-bold tracking-tight">
                        No orders found
                    </div>
                )}
            </div>

            {viewingOrder && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6" onClick={() => setViewingOrder(null)}>
                    <div className="bg-white border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="p-6 md:p-10 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10 rounded-t-[32px]">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight uppercase">Order Details</h3>
                                    <span className={`text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-full border ${SOURCE_STYLES[viewingOrder.order_source] || SOURCE_STYLES['online']}`}>
                                        {getSourceLabel(viewingOrder.order_source)}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-[10px] tracking-tight mt-1 font-bold uppercase">ID: {viewingOrder.id}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-all text-sm font-black">✕</button>
                        </div>

                        <div className="p-6 md:p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-gray-400 text-[10px] uppercase tracking-tight mb-3 font-bold">Customer Details</h4>
                                    <p className="text-gray-900 font-bold text-xl md:text-2xl tracking-tight">{viewingOrder.customer_name}</p>
                                    <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">{viewingOrder.user_email}</p>
                                    <p className="text-gray-500 text-sm md:text-base mt-0.5 font-bold">{viewingOrder.phone_number}</p>
                                    
                                    <div className="mt-6 flex gap-3">
                                        {viewingOrder.preferred_contact === 'whatsapp' && (
                                            <a 
                                                href={`https://wa.me/${viewingOrder.phone_number.replace(/\D/g, '')}?text=${getMessageText(viewingOrder)}`} 
                                                target="_blank" 
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs uppercase font-bold tracking-tight bg-green-500 text-white px-6 py-2.5 hover:bg-green-600 transition-all rounded-xl shadow-lg shadow-green-100"
                                            >
                                                WhatsApp
                                            </a>
                                        )}
                                        {viewingOrder.preferred_contact === 'telegram' && (
                                            <a 
                                                href={`https://t.me/+${viewingOrder.phone_number.replace(/\D/g, '')}?text=${getMessageText(viewingOrder)}`} 
                                                target="_blank" 
                                                onClick={e => e.stopPropagation()}
                                                className="text-xs uppercase font-bold tracking-tight bg-sky-500 text-white px-6 py-2.5 hover:bg-sky-600 transition-all rounded-xl shadow-lg shadow-sky-100"
                                            >
                                                Telegram
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-[24px] border border-gray-100">
                                    <h4 className="text-gray-400 text-[10px] uppercase tracking-tight mb-3 font-bold">Summary</h4>
                                    <div className="space-y-2.5">
                                        <p className="flex justify-between text-base"><span className="text-gray-400 font-bold">Method:</span> <span className="text-gray-900 font-bold uppercase tracking-tight text-sm">{viewingOrder.pick_up_type}</span></p>
                                        <p className="flex justify-between text-base"><span className="text-gray-400 font-bold">Contact:</span> <span className="text-gray-900 font-bold uppercase tracking-tight text-sm">{viewingOrder.preferred_contact}</span></p>
                                        <p className="flex justify-between text-base"><span className="text-gray-400 font-bold">Box:</span> <span className="text-gray-900 font-bold uppercase tracking-tight text-sm">{viewingOrder.wants_box === false ? 'No' : 'Yes'}</span></p>
                                        <p className="flex justify-between text-base"><span className="text-gray-400 font-bold">Type:</span> <span className="text-gray-900 font-bold uppercase tracking-tight text-sm">{viewingOrder.order_type === 'bestSeller' ? 'Best Seller' : viewingOrder.order_type === 'mixed' ? 'Mixed' : 'Custom'}</span></p>
                                        
                                        {/* Box configuration breakdown */}
                                        {viewingOrder.composition && (() => {
                                            const validSizes = ['4-piece', '9-piece', '16-piece', '40-piece'];
                                            const entries = Object.entries(viewingOrder.composition).filter(([size, count]) => count > 0 && validSizes.includes(size));
                                            if (entries.length === 0) return null;
                                            return (
                                                <div className="border-t border-gray-200 pt-3 mt-2">
                                                    <p className="text-gray-400 text-[10px] uppercase tracking-tight font-bold mb-2">Box Configuration</p>
                                                    {entries.map(([size, count]) => (
                                                        <p key={size} className="flex justify-between text-sm">
                                                            <span className="text-gray-500 font-medium">{size.replace('-', ' ').replace('piece', 'Piece')}</span>
                                                            <span className="text-gray-900 font-bold">×{count}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            );
                                        })()}

                                        <div className="border-t border-gray-200 pt-4 mt-3">
                                            <p className="flex justify-between text-2xl"><span className="text-gray-400 font-bold tracking-tight">TOTAL</span> <span className="text-gray-900 font-bold tracking-tighter">{viewingOrder.amount} ETB</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-gray-400 text-[10px] uppercase tracking-tight mb-4 font-bold border-b border-gray-50 pb-2">Items</h4>
                                
                                {(() => {
                                    const allItems = viewingOrder.order_items || [];
                                    const customItems = allItems.filter(i => i.type !== 'bestSeller');
                                    const bestSellerItems = allItems.filter(i => i.type === 'bestSeller');

                                    return (
                                        <>
                                            {/* Custom bonbon grid */}
                                            {customItems.length > 0 && (() => {
                                                const allPieces = [];
                                                customItems.forEach(item => {
                                                    const globalBonbon = bonbons.find(b => b.id === item.bonbonId);
                                                    const img = item.imageUrl || globalBonbon?.image_url;
                                                    for (let i = 0; i < item.quantity; i++) {
                                                        allPieces.push({ name: item.bonbonName, img });
                                                    }
                                                });

                                                const total = allPieces.length;
                                                let gridCols = 'grid-cols-2';
                                                if (total <= 4) gridCols = 'grid-cols-2';
                                                else if (total <= 9) gridCols = 'grid-cols-3';
                                                else if (total <= 16) gridCols = 'grid-cols-4';
                                                else gridCols = 'grid-cols-5';

                                                return (
                                                    <>
                                                        <p className="text-gray-500 text-[10px] uppercase tracking-tight font-bold mb-2">Custom Selection</p>
                                                        <div className={`grid ${gridCols} gap-1.5 mb-4 max-w-sm`}>
                                                            {allPieces.map((piece, i) => (
                                                                <div key={i} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden border border-gray-100 group">
                                                                    {piece.img ? (
                                                                        <img src={piece.img} alt={piece.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px] font-bold uppercase">{piece.name?.charAt(0)}</div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="space-y-1 mb-4">
                                                            {customItems.map((item, i) => (
                                                                <div key={i} className="flex justify-between items-center py-2 px-3 bg-gray-50/50 rounded-xl">
                                                                    <span className="text-gray-700 text-xs font-bold tracking-tight">{item.bonbonName}</span>
                                                                    <span className="text-gray-900 font-bold text-sm font-mono">×{item.quantity}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                );
                                            })()}

                                            {/* Best seller items */}
                                            {bestSellerItems.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-gray-500 text-[10px] uppercase tracking-tight font-bold">Best Seller Boxes</p>
                                                    {bestSellerItems.map((item, i) => (
                                                        <div key={i} className="flex items-center justify-between bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">★</span>
                                                                <div>
                                                                    <p className="text-gray-900 text-sm font-bold tracking-tight">{item.bonbonName}</p>
                                                                    <p className="text-amber-600 text-[10px] font-bold uppercase tracking-tight">{item.price} ETB each</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-gray-900 font-bold text-lg font-mono">×{item.quantity}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Fallback */}
                                            {customItems.length === 0 && bestSellerItems.length === 0 && (
                                                <div className="bg-gray-50 p-8 text-center border border-gray-100 rounded-[24px]">
                                                    <p className="text-gray-300 text-sm uppercase font-bold tracking-tight">No items recorded</p>
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="p-6 md:p-10 border-t border-gray-50 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-sm rounded-b-[32px]">
                            <button
                                onClick={() => setViewingOrder(null)}
                                className="px-10 py-3.5 bg-gray-900 text-white text-sm font-bold uppercase tracking-tight hover:bg-gray-800 transition-all rounded-xl shadow-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}