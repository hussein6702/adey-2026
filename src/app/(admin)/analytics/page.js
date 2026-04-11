'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../../../supabase';

export default function AnalyticsPage() {
    const [orders, setOrders] = useState([]);
    const [bonbons, setBonbons] = useState([]);
    const [loading, setLoading] = useState(true);

    const getLocalDateString = (date = new Date()) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [dateRange, setDateRange] = useState({
        start: getLocalDateString(new Date(new Date().setDate(new Date().getDate() - 30))),
        end: getLocalDateString(),
    });

    useEffect(() => {
        async function fetchData() {
            const [ordersRes, bonbonsRes] = await Promise.all([
                supabase.from('orders').select('*').order('created_at', { ascending: false }),
                supabase.from('bonbons').select('*'),
            ]);
            if (ordersRes.data) setOrders(ordersRes.data);
            if (bonbonsRes.data) setBonbons(bonbonsRes.data);
            setLoading(false);
        }
        fetchData();
    }, []);

    const toLocalDateString = (date) => {
        const d = new Date(date);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            const d = toLocalDateString(o.created_at);
            return d >= dateRange.start && d <= dateRange.end;
        });
    }, [orders, dateRange]);

    const stats = useMemo(() => {
        if (!filteredOrders.length) return null;

        let totalRevenue = 0;
        const bonbonSales = {};
        const categorySales = {};
        const dayOfWeekSales = [0, 0, 0, 0, 0, 0, 0];
        const dayOfWeekRevenue = [0, 0, 0, 0, 0, 0, 0];
        const hourOfDaySales = Array(24).fill(0);

        filteredOrders.forEach(order => {
            const amount = Number(order.amount) || 0;
            totalRevenue += amount;
            const date = new Date(order.created_at);
            const dayIdx = date.getDay();
            dayOfWeekSales[dayIdx]++;
            dayOfWeekRevenue[dayIdx] += amount;
            hourOfDaySales[date.getHours()]++;

            if (order.order_items && Array.isArray(order.order_items)) {
                order.order_items.forEach(item => {
                    const id = item.bonbonId;
                    if (id) {
                        bonbonSales[id] = (bonbonSales[id] || 0) + (item.quantity || 0);
                        const b = bonbons.find(x => x.id === id);
                        if (b) {
                            categorySales[b.category] = (categorySales[b.category] || 0) + (item.quantity || 0);
                        }
                    }
                });
            }
        });

        const bonbonEntries = Object.entries(bonbonSales);
        const top5Bonbons = bonbonEntries
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(e => ({
                bonbon: bonbons.find(b => b.id === e[0]),
                sales: e[1]
            }))
            .filter(e => e.bonbon);

        const bestSellingBonbon = top5Bonbons.length ? top5Bonbons[0].bonbon : null;
        const catEntries = Object.entries(categorySales);
        const bestSellingCategory = catEntries.length ? catEntries.sort((a, b) => b[1] - a[1])[0][0] : null;

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const peakDayIdx = dayOfWeekRevenue.indexOf(Math.max(...dayOfWeekRevenue));
        const peakDay = days[peakDayIdx];
        const peakHour = hourOfDaySales.indexOf(Math.max(...hourOfDaySales));

        return {
            totalRevenue,
            totalOrders: filteredOrders.length,
            bestSellingBonbon,
            bestSellingCategory,
            peakDay,
            peakHour,
            dayOfWeekSales,
            dayOfWeekRevenue,
            hourOfDaySales,
            categorySales,
            top5Bonbons
        };
    }, [filteredOrders, bonbons]);

    const setRange = (days) => {
        const end = new Date();
        const start = new Date();
        if (days === 'all') {
            const earliest = orders.length > 0 ? new Date(orders[orders.length - 1].created_at) : new Date();
            setDateRange({ start: toLocalDateString(earliest), end: toLocalDateString(end) });
        } else {
            start.setDate(end.getDate() - days);
            setDateRange({ start: toLocalDateString(start), end: toLocalDateString(end) });
        }
    };

    if (loading) return <div className="p-20 text-gray-400 font-semibold uppercase tracking-tight text-base">Loading Reports...</div>;

    const maxDaySales = Math.max(1, ...stats?.dayOfWeekSales || []);
    const maxHourSales = Math.max(1, ...stats?.hourOfDaySales || []);

    return (
        <div className="w-full pb-20">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase">Analytics</h1>
                    <p className="text-gray-400 text-base mt-2 font-medium">Performance insights and sales trends</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-3 bg-white p-3 border border-gray-100 rounded-[24px] shadow-sm">
                    <div className="flex bg-gray-50 border border-gray-100 p-1.5 rounded-[16px]">
                        {[
                            { label: '7D', value: 7 },
                            { label: '30D', value: 30 },
                            { label: 'All', value: 'all' }
                        ].map(r => (
                            <button
                                key={r.label}
                                onClick={() => setRange(r.value)}
                                className="px-5 py-2 text-[10px] font-bold uppercase tracking-tight text-gray-400 hover:text-gray-900 transition-colors border-r border-gray-100 last:border-0"
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 p-3 border border-gray-100 rounded-[16px]">
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-tight px-1">From</label>
                        <input 
                            type="date" 
                            title="Start Date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent text-gray-900 text-xs font-bold uppercase tracking-tight focus:outline-none px-1 cursor-pointer"
                        />
                        <span className="text-gray-200">/</span>
                        <label className="text-[10px] text-gray-400 font-bold uppercase tracking-tight px-1">To</label>
                        <input 
                            type="date" 
                            title="End Date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent text-gray-900 text-xs font-bold uppercase tracking-tight focus:outline-none px-1 cursor-pointer"
                        />
                    </div>
                </div>
            </header>

            {!stats ? (
                <div className="py-32 text-center border-2 border-dashed border-gray-100 bg-white rounded-[32px]">
                    <p className="text-gray-400 text-xl uppercase tracking-tight font-bold">Waiting for Data</p>
                    <button onClick={() => setRange('all')} className="mt-4 text-gray-900 text-base font-bold uppercase tracking-tight underline">View all time</button>
                </div>
            ) : (
                <div className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <MetricCard label="Revenue" value={`${stats.totalRevenue.toLocaleString()}`} unit="ETB" sub="Net inflow" />
                        <MetricCard label="Orders" value={stats.totalOrders} sub="Volume" />
                        <MetricCard label="Top Item" value={stats.bestSellingBonbon?.name || '—'} sub={stats.bestSellingCategory || 'Assorted'} />
                        <MetricCard label="Peak Day" value={stats.peakDay} sub="Strongest" />
                        <MetricCard label="Peak Hour" value={`${stats.peakHour}:00`} sub="Active" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-gray-100 p-10 rounded-[32px] shadow-sm">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mb-12 opacity-60">Weekly Volume</h3>
                            <div className="flex justify-between h-64 gap-5 relative">
                                <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between pointer-events-none opacity-5">
                                    <div className="border-t border-gray-400 w-full"></div>
                                    <div className="border-t border-gray-400 w-full"></div>
                                    <div className="border-t border-gray-400 w-full"></div>
                                    <div className="border-t border-gray-400 w-full"></div>
                                </div>
                                {stats.dayOfWeekSales.map((val, i) => {
                                    const h = (val / maxDaySales) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-3 group z-10 h-full">
                                            <div 
                                                className="w-full bg-gray-900 transition-all duration-500 relative rounded-t-xl"
                                                style={{ height: `max(6%, ${h}%)` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-gray-900 opacity-0 group-hover:opacity-100 transition-all font-mono font-bold bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-xl">{val}</div>
                                            </div>
                                            <span className="text-[10px] text-gray-400 group-hover:text-gray-900 font-bold uppercase tracking-tight h-3">
                                                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][i]}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 p-10 rounded-[32px] shadow-sm">
                            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-tight mb-12 opacity-60">Hourly Trends</h3>
                            <div className="flex justify-between h-64 gap-2 relative">
                                <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between pointer-events-none opacity-5">
                                    <div className="border-t border-gray-400 w-full"></div>
                                    <div className="border-t border-gray-400 w-full"></div>
                                    <div className="border-t border-gray-400 w-full"></div>
                                    <div className="border-t border-gray-400 w-full"></div>
                                </div>
                                {stats.hourOfDaySales.map((val, i) => {
                                    const h = (val / maxHourSales) * 100;
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group z-10 h-full">
                                            <div
                                                className="w-full bg-amber-500 transition-all duration-400 relative rounded-t-md"
                                                style={{ height: `max(4%, ${h}%)` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-amber-700 opacity-0 group-hover:opacity-100 transition-all font-mono font-bold bg-white border border-amber-100 px-2 py-0.5 rounded-lg shadow-xl">{val}</div>
                                            </div>
                                            <span className="text-[9px] text-gray-400 font-bold h-3 flex items-center justify-center">
                                                {i % 4 === 0 ? `${i}h` : ''}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
                            <h3 className="text-gray-900 text-lg font-bold uppercase tracking-tight mb-10">Category Mix</h3>
                            <div className="space-y-8">
                                {Object.entries(stats.categorySales)
                                    .sort((a, b) => b[1] - a[1])
                                    .map(([label, val]) => {
                                        const percentage = (val / Object.values(stats.categorySales).reduce((a, b) => a + b, 0)) * 100;
                                        return (
                                            <div key={label} className="space-y-3">
                                                <div className="flex justify-between items-end text-xs uppercase tracking-tight">
                                                    <span className="text-gray-900 font-bold text-base">{label}</span>
                                                    <span className="text-gray-400 font-mono font-bold">{val} pcs ({percentage.toFixed(0)}%)</span>
                                                </div>
                                                <div className="h-3 bg-gray-50 w-full rounded-full overflow-hidden border border-gray-100">
                                                    <div
                                                        className="h-full bg-gray-900 transition-all duration-1000 ease-out rounded-full"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>

                        <div className="bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
                            <h3 className="text-gray-900 text-lg font-bold uppercase tracking-tight mb-10">Top Products</h3>
                            <div className="space-y-8">
                                {stats.top5Bonbons.map((item, idx) => {
                                    const maxSales = stats.top5Bonbons[0]?.sales || 1;
                                    const percentage = (item.sales / maxSales) * 100;
                                    return (
                                        <div key={item.bonbon.id} className="space-y-3">
                                            <div className="flex justify-between items-center text-xs uppercase tracking-tight">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl font-bold text-gray-200 tracking-tight w-6">{idx + 1}</span>
                                                    {item.bonbon.image_url ? (
                                                        <img src={item.bonbon.image_url} alt="" className="w-10 h-10 object-cover rounded-xl shadow-sm" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                                                    )}
                                                    <span className="text-gray-900 font-bold text-base">{item.bonbon.name}</span>
                                                </div>
                                                <span className="text-gray-400 font-mono font-bold text-base">{item.sales} sold</span>
                                            </div>
                                            <div className="h-3 bg-gray-50 w-full rounded-full overflow-hidden border border-gray-100">
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-1000 ease-out rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricCard({ label, value, unit, sub }) {
    return (
        <div className="bg-white border border-gray-100 p-6 rounded-[24px] shadow-sm group hover:border-gray-900 transition-all">
            <p className="text-gray-400 text-[10px] uppercase tracking-tight mb-3 font-bold transition-colors group-hover:text-gray-500">{label}</p>
            <div className="flex items-baseline gap-1">
                <h4 className="text-gray-900 text-2xl font-bold tracking-tight truncate">{value}</h4>
                {unit && <span className="text-[10px] font-bold text-gray-400">{unit}</span>}
            </div>
            <p className="text-gray-400 text-[9px] uppercase tracking-tight mt-1.5 font-semibold">{sub}</p>
        </div>
    );
}
