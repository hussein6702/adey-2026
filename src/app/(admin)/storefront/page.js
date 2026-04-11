'use client';
import { useEffect, useState, useCallback, memo } from 'react';
import { supabase } from '../../../../supabase';

const DEFAULT_CATEGORIES = ['White Chocolate', 'Milk Chocolate', 'Dark Chocolate', 'Liqueur', 'Truffle'];
const ALLERGENS = ['Nuts', 'Dairy', 'Fruit'];

const EMPTY_BONBON = {
    name: '',
    description: '',
    category: '',
    price: 130,
    is_liquor: false,
    allergens: [],
    image_url: '',
    active: true,
    stock: 50,
};

function EditBonbonModal({ bonbon, isNew, onClose, onSave, categories }) {
    const [localBonbon, setLocalBonbon] = useState(bonbon);
    const [uploading, setUploading] = useState(false);

    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);

        const ext = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
            .from('bonbon-images')
            .upload(fileName, file, { upsert: true });

        if (uploadError) {
            alert('Upload failed: ' + uploadError.message);
            setUploading(false);
            return;
        }

        const { data: urlData } = supabase.storage.from('bonbon-images').getPublicUrl(fileName);
        setLocalBonbon(prev => ({ ...prev, image_url: urlData.publicUrl }));
        setUploading(false);
    }

    function toggleAllergen(allergen) {
        setLocalBonbon(prev => {
            const list = prev.allergens || [];
            return {
                ...prev,
                allergens: list.includes(allergen) ? list.filter(a => a !== allergen) : [...list, allergen],
            };
        });
    }

    function handleSave() {
        const b = localBonbon;
        if (!b.name || !b.category) return alert('Name and category are required');
        onSave(b, isNew);
    }

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl relative">
                <div className="p-10 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
                    <h2 className="text-gray-900 text-xl font-bold uppercase tracking-tight">
                        {isNew ? 'Create Product' : 'Modify Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-all font-black text-xs"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div>
                        <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-3 font-bold">Visual</label>
                        {localBonbon.image_url && (
                            <img src={localBonbon.image_url} alt="" className="w-24 h-24 rounded-2xl object-cover mb-4 shadow-md border border-gray-50" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-6 file:border file:border-gray-100 file:rounded-xl file:bg-gray-50 file:text-gray-900 file:text-[10px] file:uppercase file:tracking-tight file:cursor-pointer hover:file:bg-gray-900 hover:file:text-white transition-all font-bold"
                        />
                        {uploading && <p className="text-amber-600 text-[10px] mt-2 font-bold">Uploading...</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-1 font-bold">Title</label>
                            <input
                                type="text"
                                value={localBonbon.name}
                                onChange={e => setLocalBonbon(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-transparent border-b-2 border-gray-100 text-gray-900 text-lg py-2 focus:outline-none focus:border-gray-900 transition-colors font-bold tracking-tight"
                                placeholder="..."
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-1 font-bold">Category</label>
                            <select
                                value={localBonbon.category}
                                onChange={e => setLocalBonbon(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-white border-b-2 border-gray-100 text-gray-900 text-lg py-2 focus:outline-none focus:border-gray-900 transition-colors font-bold tracking-tight"
                            >
                                <option value="" disabled>Select Segment</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-1 font-bold">Description</label>
                        <input
                            type="text"
                            value={localBonbon.description}
                            onChange={e => setLocalBonbon(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full bg-transparent border-b-2 border-gray-100 text-gray-900 text-base py-2 focus:outline-none focus:border-gray-900 transition-colors font-medium tracking-tight"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-1 font-bold">Price (ETB)</label>
                            <input
                                type="number"
                                value={localBonbon.price}
                                onChange={e => setLocalBonbon(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full bg-transparent border-b-2 border-gray-100 text-gray-900 text-2xl py-2 focus:outline-none focus:border-gray-900 transition-colors font-mono font-bold tracking-tighter"
                            />
                        </div>
                        <div>
                            <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-1 font-bold">Stock</label>
                            <input
                                type="number"
                                value={localBonbon.stock !== null && localBonbon.stock !== undefined ? localBonbon.stock : ''}
                                onChange={e => setLocalBonbon(prev => ({ ...prev, stock: e.target.value === '' ? null : Number(e.target.value) }))}
                                placeholder="∞"
                                className="w-full bg-transparent border-b-2 border-gray-100 text-gray-900 text-2xl py-2 focus:outline-none focus:border-gray-900 transition-colors font-mono font-bold tracking-tighter"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <label className="text-gray-900 text-base uppercase tracking-tight font-bold">Liquor</label>
                        <button
                            type="button"
                            onClick={() => setLocalBonbon(prev => ({ ...prev, is_liquor: !prev.is_liquor }))}
                            className={`w-12 h-6 rounded-full relative transition-all ${localBonbon.is_liquor ? 'bg-amber-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${localBonbon.is_liquor ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>

                    <div>
                        <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-4 font-bold">Allergens</label>
                        <div className="flex flex-wrap gap-3">
                            {ALLERGENS.map(a => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => toggleAllergen(a)}
                                    className={`text-xs uppercase tracking-tight px-6 py-2 border-2 transition-all rounded-xl font-bold ${(localBonbon.allergens || []).includes(a)
                                        ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                                        : 'bg-transparent text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-900'
                                        }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-900 text-white p-5 rounded-2xl shadow-xl">
                        <label className="text-white text-base uppercase tracking-tight font-bold">Active Status</label>
                        <button
                            type="button"
                            onClick={() => setLocalBonbon(prev => ({ ...prev, active: !prev.active }))}
                            className={`w-12 h-6 rounded-full relative transition-all ${localBonbon.active ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${localBonbon.active ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="p-10 border-t border-gray-50 flex justify-end gap-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 uppercase tracking-tight px-6 py-3 hover:text-gray-900 transition-colors font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={uploading}
                        className="text-sm font-bold uppercase tracking-tight px-10 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-xl disabled:opacity-30"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}

function AddCategoryModal({ onClose, onSave }) {
    const [name, setName] = useState('');

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-white border border-gray-200 w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h2 className="text-gray-900 text-xl font-bold uppercase tracking-tight">Add Segment</h2>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <label className="text-gray-400 text-[10px] uppercase tracking-tight block mb-3 font-bold">Title</label>
                        <input
                            type="text"
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-transparent border-b-2 border-gray-100 text-gray-900 text-xl py-2 focus:outline-none focus:border-gray-900 transition-colors font-bold tracking-tight"
                            placeholder="e.g. Seasonal"
                        />
                    </div>
                </div>
                <div className="p-8 border-t border-gray-50 flex justify-end gap-4 bg-gray-50">
                    <button onClick={onClose} className="text-sm text-gray-400 uppercase tracking-tight px-4 py-3 hover:text-gray-900 transition-colors font-bold">Cancel</button>
                    <button 
                        onClick={() => name && onSave(name)} 
                        className="text-sm font-bold uppercase tracking-tight px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function StorefrontPage() {
    const [bonbons, setBonbons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [boxPrices, setBoxPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [editingBonbon, setEditingBonbon] = useState(null);
    const [addingCategory, setAddingCategory] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [editingPrices, setEditingPrices] = useState(false);
    const [tempBoxPrices, setTempBoxPrices] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');

    const fetchCategories = useCallback(async () => {
        const [catRes, bonbonRes] = await Promise.all([
            supabase.from('categories').select('*').order('name'),
            supabase.from('bonbons').select('category')
        ]);
        const dbCats = catRes.data?.map(c => c.name) || [];
        const currentBonbonCats = bonbonRes.data?.map(b => b.category) || [];
        const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...dbCats, ...currentBonbonCats])).filter(Boolean);
        setCategories(merged.sort());
    }, []);

    const fetchBonbons = useCallback(async () => {
        const { data, error } = await supabase.from('bonbons').select('*').order('category').order('name');
        if (!error) setBonbons(data || []);
    }, []);

    const fetchBoxPrices = useCallback(async () => {
        const { data, error } = await supabase.from('box_prices').select('*');
        if (!error && data) {
            const prices = {};
            data.forEach(r => { prices[r.box_size] = r.price; });
            setBoxPrices(prices);
            setTempBoxPrices(prices);
        }
    }, []);

    useEffect(() => {
        Promise.all([fetchBonbons(), fetchCategories(), fetchBoxPrices()]).then(() => setLoading(false));
    }, [fetchBonbons, fetchCategories, fetchBoxPrices]);

    async function handleSaveBonbon(bonbonData, creating) {
        const record = {
            name: bonbonData.name,
            description: bonbonData.description,
            category: bonbonData.category,
            price: Number(bonbonData.price),
            is_liquor: bonbonData.is_liquor,
            allergens: bonbonData.allergens,
            image_url: bonbonData.image_url,
            active: bonbonData.active,
            stock: bonbonData.stock !== null && bonbonData.stock !== undefined ? Number(bonbonData.stock) : null,
        };
        if (creating) {
            const { error } = await supabase.from('bonbons').insert([record]);
            if (error) return alert('Error: ' + error.message);
        } else {
            const { error } = await supabase.from('bonbons').update(record).eq('id', bonbonData.id);
            if (error) return alert('Error: ' + error.message);
        }
        setEditingBonbon(null);
        setIsNew(false);
        fetchBonbons();
    }

    async function toggleActive(bonbon) {
        await supabase.from('bonbons').update({ active: !bonbon.active }).eq('id', bonbon.id);
        fetchBonbons();
    }

    async function deleteBonbon(id) {
        if (!confirm('Permanently delete this product?')) return;
        await supabase.from('bonbons').delete().eq('id', id);
        fetchBonbons();
    }

    async function handleAddCategory(name) {
        const { error } = await supabase.from('categories').insert([{ name }]);
        if (error) alert('Error: ' + error.message);
        setAddingCategory(false);
        fetchCategories();
    }

    async function handleDeleteCategory(catName) {
        if (!confirm(`Are you sure you want to delete "${catName}"?`)) return;
        const { error } = await supabase.from('categories').delete().eq('name', catName);
        if (error) alert('Error: ' + error.message);
        if (activeFilter === catName) setActiveFilter('all');
        fetchCategories();
    }

    async function saveBoxPrices() {
        for (const [box_size, price] of Object.entries(tempBoxPrices)) {
            await supabase.from('box_prices').update({ price: Number(price) }).eq('box_size', box_size);
        }
        setBoxPrices({ ...tempBoxPrices });
        setEditingPrices(false);
    }

    const filtered = activeFilter === 'all' ? bonbons : bonbons.filter(b => b.category === activeFilter);

    if (loading) return <div className="text-gray-400 text-lg tracking-tight uppercase p-20 font-bold">Loading...</div>;

    return (
        <div className="w-full">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight uppercase">Storefront</h1>
                    <p className="text-gray-400 text-base mt-2 font-medium">Manage your product catalogue and box prices</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setAddingCategory(true)}
                        className="px-6 py-2.5 bg-white text-gray-900 border border-gray-200 text-xs font-bold uppercase tracking-tight hover:border-gray-900 transition-all rounded-xl shadow-sm"
                    >
                        + Segment
                    </button>
                    <button
                        onClick={() => { setEditingBonbon({ ...EMPTY_BONBON }); setIsNew(true); }}
                        className="px-8 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-tight hover:bg-gray-800 transition-all rounded-xl shadow-lg"
                    >
                        + Create
                    </button>
                </div>
            </header>

            <div className="mb-12 border border-gray-100 p-8 bg-white rounded-[32px] shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-gray-900 text-lg font-bold uppercase tracking-tight">Box Matrix (ETB)</h2>
                    {!editingPrices ? (
                        <button onClick={() => setEditingPrices(true)} className="text-xs text-gray-400 uppercase tracking-tight hover:text-gray-900 transition-colors font-bold underline">Edit Grid</button>
                    ) : (
                        <div className="flex gap-4">
                            <button onClick={saveBoxPrices} className="text-xs text-gray-900 uppercase tracking-tight font-bold underline">Apply</button>
                            <button onClick={() => { setTempBoxPrices({ ...boxPrices }); setEditingPrices(false); }} className="text-xs text-gray-400 uppercase tracking-tight font-bold underline">Abort</button>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {['4-piece', '9-piece', '16-piece', '40-piece'].map(size => (
                        <div key={size} className="bg-gray-50 p-4 border border-gray-100 rounded-[20px] group hover:border-gray-900 transition-all">
                            <p className="text-gray-400 text-[10px] uppercase tracking-tight mb-2 font-bold transition-colors group-hover:text-gray-600">{size}</p>
                            {editingPrices ? (
                                <input
                                    type="number"
                                    value={tempBoxPrices[size] || ''}
                                    onChange={e => setTempBoxPrices(prev => ({ ...prev, [size]: e.target.value }))}
                                    className="w-full bg-transparent border-b-2 border-gray-200 text-gray-900 text-xl font-bold focus:outline-none focus:border-gray-900 py-1 font-mono tracking-tighter"
                                />
                            ) : (
                                <p className="text-gray-900 text-2xl font-bold tracking-tighter font-mono">{boxPrices[size] || '—'}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-3 mb-8 flex-wrap">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`text-[10px] uppercase tracking-tight px-6 py-2.5 border transition-all rounded-xl font-bold ${activeFilter === 'all' ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-900'}`}
                >
                    View All
                </button>
                {categories.map(cat => (
                    <div key={cat} className="flex group">
                        <button
                            onClick={() => setActiveFilter(cat)}
                            className={`text-[10px] uppercase tracking-tight px-6 py-2.5 border transition-all rounded-l-xl font-bold ${activeFilter === cat ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:text-gray-900 hover:border-gray-900'} ${DEFAULT_CATEGORIES.includes(cat) ? 'rounded-r-xl' : 'border-r-0'}`}
                        >
                            {cat}
                        </button>
                        {!DEFAULT_CATEGORIES.includes(cat) && (
                            <button
                                onClick={() => handleDeleteCategory(cat)}
                                className={`text-[10px] px-4 py-2.5 border border-l-0 rounded-r-xl transition-all ${activeFilter === cat ? 'bg-gray-900 text-red-300 border-gray-900 hover:text-red-100' : 'bg-white text-red-200 border-gray-100 hover:text-red-500 hover:border-gray-900'}`}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="border border-gray-100 bg-white rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left table-auto">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50 text-gray-400 font-bold text-[10px] uppercase tracking-tight">
                            <th className="px-6 py-4">Identity</th>
                            <th className="px-6 py-4">Segment</th>
                            <th className="px-6 py-4 text-center">Price</th>
                            <th className="px-6 py-4 text-center">Stock</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 font-bold">
                        {filtered.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-6">
                                    <div className="flex items-center gap-5">
                                        {b.image_url ? (
                                            <img src={b.image_url} alt={b.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-white group-hover:scale-105 transition-transform" loading="lazy" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 font-bold text-[10px]">?</div>
                                        )}
                                        <div>
                                            <p className="text-gray-900 text-base font-bold tracking-tight">{b.name}</p>
                                            <p className="text-gray-400 text-[10px] font-medium tracking-tight line-clamp-1">{b.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-6 text-gray-500 text-sm font-bold tracking-tight">{b.category}</td>
                                <td className="px-6 py-6 text-gray-900 text-xl font-mono text-center font-bold tracking-tighter">{b.price}</td>
                                <td className="px-6 py-6 text-center text-lg font-mono font-bold">
                                    <span className={b.stock !== null && b.stock <= 5 ? 'text-amber-500' : b.stock !== null && b.stock <= 0 ? 'text-red-500' : 'text-gray-900'}>
                                        {b.stock !== null && b.stock !== undefined ? b.stock : '∞'}
                                    </span>
                                </td>
                                <td className="px-6 py-6 text-center">
                                    <button
                                        onClick={() => toggleActive(b)}
                                        className={`w-10 h-5 rounded-full relative transition-all ${b.active ? 'bg-green-500' : 'bg-gray-200'}`}
                                    >
                                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${b.active ? 'left-5.5' : 'left-0.5'}`} />
                                    </button>
                                </td>
                                <td className="px-6 py-6 text-right">
                                    <div className="flex gap-4 justify-end items-center uppercase text-[10px] font-bold tracking-tight">
                                        <button onClick={() => { setEditingBonbon({ ...b }); setIsNew(false); }} className="text-gray-400 hover:text-gray-900 transition-colors">Edit</button>
                                        <button onClick={() => deleteBonbon(b.id)} className="text-red-200 hover:text-red-500 transition-colors">Trash</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-20 text-center text-gray-300 text-xl font-bold tracking-tight">Empty</div>
                )}
            </div>

            {editingBonbon && (
                <EditBonbonModal
                    bonbon={editingBonbon}
                    isNew={isNew}
                    onClose={() => { setEditingBonbon(null); setIsNew(false); }}
                    onSave={handleSaveBonbon}
                    categories={categories}
                />
            )}

            {addingCategory && (
                <AddCategoryModal
                    onClose={() => setAddingCategory(false)}
                    onSave={handleAddCategory}
                />
            )}
        </div>
    );
}
