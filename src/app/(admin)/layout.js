// app/(admin)/layout.js
'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Poppins } from 'next/font/google';
import { 
  ShoppingBag, 
  BarChart3, 
  Store, 
  LogOut 
} from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_access') === 'true';
    if (!auth && pathname !== '/login') {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  if (isAuthorized === null && pathname !== '/login') return <div className="h-screen bg-gray-50" />;
  if (pathname === '/login') return <div className={poppins.className}>{children}</div>;

  const navItems = [
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Storefront', href: '/storefront', icon: Store },
  ];

  return (
    <div className={`admin-root ${poppins.className} flex h-screen bg-gray-50 text-gray-800`}>
      <aside className="w-64 bg-white flex flex-col border-r border-gray-200 shadow-sm">
        <div className="p-10">
          <h2 className="text-gray-900 text-2xl font-bold tracking-tight">BONBON</h2>
          <p className="text-gray-400 text-[10px] tracking-normal mt-1 font-semibold uppercase">Administration</p>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gray-900 text-white shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-sm font-semibold tracking-tight`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-gray-50">
          <button
            onClick={() => { localStorage.removeItem('admin_access'); router.push('/login'); }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-gray-400 hover:text-red-600 transition-colors rounded-xl hover:bg-red-50"
          >
            <LogOut size={16} />
            <span className="text-xs font-bold tracking-tight uppercase">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-12 py-16" style={{ willChange: 'scroll-position', contain: 'paint' }}>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}