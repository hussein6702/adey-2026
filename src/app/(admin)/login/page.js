// app/(admin)/login/page.js
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === '123') {
      localStorage.setItem('admin_access', 'true');
      router.push('/orders');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <form onSubmit={handleLogin} className="bg-white p-12 rounded-[32px] shadow-2xl w-full max-w-lg border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-900"></div>
        
        <div className="mb-10 text-center">
            <h1 className="text-4xl font-bold mb-3 text-gray-900 tracking-tight uppercase">Admin Access</h1>
            <p className="text-gray-400 text-sm font-bold tracking-tight uppercase">Enter credentials to proceed</p>
        </div>
        
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-tight ml-4">Password</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    className={`w-full p-5 bg-gray-50 border border-gray-100 rounded-[16px] text-xl font-bold outline-none transition-all text-gray-900 tracking-tighter focus:border-gray-900 focus:bg-white shadow-sm ${
                        error ? 'border-red-500 bg-red-50' : ''
                    }`}
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError(false);
                    }}
                />
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4 text-center font-bold tracking-tight">Incorrect credentials. Try again.</p>}
            
            <button className="w-full bg-gray-900 text-white py-4.5 rounded-[16px] text-lg font-bold hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 tracking-tight uppercase">
                Unlock Dashboard
            </button>
        </div>
      </form>
    </div>
  );
}