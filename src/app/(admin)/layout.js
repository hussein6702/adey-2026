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
  LogOut,
  Users,
  Menu,
  X
} from 'lucide-react';

const poppins = Poppins({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'] });

export default function AdminRootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin_access') === 'true';
    if (!auth && pathname !== '/login') {
      router.replace('/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isAuthorized === null && pathname !== '/login') return <div className="h-screen bg-gray-50" />;
  if (pathname === '/login') return <div className={poppins.className}>{children}</div>;

  const navItems = [
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Storefront', href: '/storefront', icon: Store },
    { name: 'Walk-ins', href: '/walk-ins', icon: Users },
  ];

  return (
    <div className={`admin-root ${poppins.className} flex h-screen bg-gray-50 text-gray-800`}>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar backdrop (mobile only) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white flex flex-col border-r border-gray-200 shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-10 flex items-center justify-between">
          <div>
            <h2 className="text-gray-900 text-2xl font-bold tracking-tight">BONBON</h2>
            <p className="text-gray-400 text-[10px] tracking-normal mt-1 font-semibold uppercase">Administration</p>
          </div>
          {/* Close button (mobile only) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors"
            aria-label="Close menu"
          >
            <X size={16} />
          </button>
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

      <main className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-16 pt-16 md:pt-16">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}