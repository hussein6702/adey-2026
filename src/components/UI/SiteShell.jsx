'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/UI/Navbar';
import Footer from '@/components/UI/Footer';

// Admin and shop routes should NOT show the main site navbar/footer
const HIDDEN_PREFIXES = ['/orders', '/analytics', '/storefront', '/walk-ins', '/login', '/shop', '/collections'];

export default function SiteShell({ children }) {
    const pathname = usePathname();
    const hide = HIDDEN_PREFIXES.some(prefix => pathname.startsWith(prefix));

    return (
        <>
            {!hide && <Navbar />}
            {children}
            {!hide && <Footer />}
        </>
    );
}
