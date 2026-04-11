'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../../supabase';

const STATUS_COLORS = {
    received: 'text-amber-600',
    pending: 'text-amber-600',
    confirmed: 'text-blue-600',
    completed: 'text-green-600',
    cancelled: 'text-red-500',
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
        const headers = ['Date', 'Customer', 'Email', 'Phone', 'Type', 'Amount', 'Status', 'Items'];
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

    if (loading) return <div className="p-20 text-gray-400 font-semibold uppercase tracking-tight text-base">Loading...</div>;

    return (
        <div className="w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase">Orders</h1>
                    <p className="text-gray-400 text-base mt-2 font-medium">Manage and track your customer transactions</p>
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

            <div className="border border-gray-200 bg-white rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-tight">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4 text-center">Amount</th>
                            <th className="px-6 py-4 text-right">Preview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredOrders.map((order) => (
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
                                    <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-full border ${order.order_type === 'bestSeller' ? 'text-amber-600 border-amber-100 bg-amber-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                                        {order.order_type === 'bestSeller' ? 'Best Seller' : 'Custom Box'}
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
                {filteredOrders.length === 0 && (
                    <div className="py-20 text-center text-gray-300 text-lg font-bold tracking-tight">
                        No orders found
                    </div>
                )}
            </div>

            {viewingOrder && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6" onClick={() => setViewingOrder(null)}>
                    <div className="bg-white border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <div className="p-10 border-b border-gray-50 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">Order Details</h3>
                                <p className="text-gray-400 text-[10px] tracking-tight mt-1 font-bold uppercase">ID: {viewingOrder.id}</p>
                            </div>
                            <button onClick={() => setViewingOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-all text-sm font-black">✕</button>
                        </div>

                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-gray-400 text-[10px] uppercase tracking-tight mb-3 font-bold">Customer Details</h4>
                                    <p className="text-gray-900 font-bold text-2xl tracking-tight">{viewingOrder.customer_name}</p>
                                    <p className="text-gray-500 text-base mt-1 font-medium">{viewingOrder.user_email}</p>
                                    <p className="text-gray-500 text-base mt-0.5 font-bold">{viewingOrder.phone_number}</p>
                                    
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
                                        <div className="border-t border-gray-200 pt-4 mt-3">
                                            <p className="flex justify-between text-2xl"><span className="text-gray-400 font-bold tracking-tight">TOTAL</span> <span className="text-gray-900 font-bold tracking-tighter">{viewingOrder.amount} ETB</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-gray-400 text-[10px] uppercase tracking-tight mb-4 font-bold border-b border-gray-50 pb-2">Items</h4>
                                <div className="space-y-2">
                                    {(viewingOrder.order_items || []).map((item, i) => {
                                        const globalBonbon = bonbons.find(b => b.id === item.bonbonId);
                                        const itemImage = item.imageUrl || globalBonbon?.image_url;
                                        return (
                                        <div key={i} className="flex justify-between items-center bg-gray-50 p-4 border border-gray-100 rounded-[16px] group">
                                            <div className="flex items-center gap-4">
                                                {itemImage ? (
                                                    <img src={itemImage} alt="" className="w-12 h-12 object-cover rounded-xl shadow-sm group-hover:scale-105 transition-transform" />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                                )}
                                                <div>
                                                    <p className="text-gray-900 text-base font-bold tracking-tight">{item.bonbonName}</p>
                                                    <p className="text-gray-400 text-[10px] font-mono font-bold tracking-tighter">{item.bonbonId}</p>
                                                </div>
                                            </div>
                                            <p className="text-gray-900 font-bold text-lg font-mono">×{item.quantity}</p>
                                        </div>
                                        );
                                    })}
                                    {(!viewingOrder.order_items || viewingOrder.order_items.length === 0) && (
                                        <div className="bg-gray-50 p-8 text-center border border-gray-100 rounded-[24px]">
                                            <p className="text-gray-400 text-sm uppercase font-bold tracking-tight">Best Seller Box ({viewingOrder.box_size})</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-10 border-t border-gray-50 flex justify-end sticky bottom-0 bg-white/80 backdrop-blur-sm">
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