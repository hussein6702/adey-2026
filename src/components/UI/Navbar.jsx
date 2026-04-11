'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [open, setOpen] = useState(false);
    const overlayRef = useRef(null);
    const menuRef = useRef(null);
    const linksRef = useRef(null);
    const pathname = usePathname();

    // Hide navbar on admin pages
    const adminPaths = ['/login', '/orders', '/collections', '/storefront'];
    const isAdminPage = adminPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

    useEffect(() => {
        if (open) {
            const ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.3, ease: 'power2.out' }
                );
                gsap.fromTo(menuRef.current,
                    { yPercent: -100 },
                    { yPercent: 0, duration: 0.5, ease: 'power3.out' }
                );
                gsap.fromTo('.nav-link-item',
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: 'power3.out', delay: 0.2 }
                );
            });
            return () => ctx.revert();
        }
    }, [open]);

    function handleClose() {
        const tl = gsap.timeline({
            onComplete: () => setOpen(false),
        });
        tl.to('.nav-link-item', { y: -20, opacity: 0, duration: 0.2, stagger: 0.04, ease: 'power2.in' });
        tl.to(menuRef.current, { yPercent: -100, duration: 0.4, ease: 'power3.in' }, '-=0.1');
        tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.2');
    }

    if (isAdminPage) return null;

    return (
        <>
            {/* Hamburger Button — fixed top right */}
            <button
                onClick={() => setOpen(true)}
                className="fixed top-[clamp(0.8rem,1vw,1.25rem)] right-[clamp(0.8rem,1vw,1.25rem)] z-[999] w-[clamp(1.5rem,1.8vw,2rem)] h-[clamp(1.5rem,1.8vw,2rem)] flex flex-col items-center justify-center gap-1.5 bg-transparent border-none cursor-pointer group"
                aria-label="Open menu"
                style={{ display: open ? 'none' : 'flex' }}
            >
                <span className="block w-[clamp(1rem,1.1vw,1.25rem)] h-[1.5px] bg-current transition-colors group-hover:opacity-70" />
                <span className="block w-[clamp(1rem,1.1vw,1.25rem)] h-[1.5px] bg-current transition-colors group-hover:opacity-70" />
                <span className="block w-[clamp(0.6rem,0.7vw,0.8rem)] h-[1.5px] bg-current transition-colors group-hover:opacity-70 self-start ml-[clamp(4px,0.3vw,5px)]" />
            </button>

            {/* Full Menu Overlay */}
            {open && (
                <>
                    {/* Backdrop */}
                    <div
                        ref={overlayRef}
                        className="fixed inset-0 z-[1000] bg-black/30 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Menu Panel — top half */}
                    <div
                        ref={menuRef}
                        className="fixed top-0 left-0 right-0 h-[50vh] z-[1001] bg-white flex flex-col"
                    >
                        {/* Top bar */}
                        <div className="flex items-center justify-between px-[clamp(1rem,1.4vw,1.75rem)] py-[clamp(0.8rem,1.1vw,1.25rem)]">
                            <Link href="/" onClick={handleClose}>
                                <Image
                                    src="/brownLogo.svg"
                                    alt="Chocolatier Adey"
                                    width={40}
                                    height={50}
                                    className="h-[clamp(1.5rem,1.8vw,2.25rem)] w-auto"
                                />
                            </Link>
                            <button
                                onClick={handleClose}
                                className="w-[clamp(1.5rem,1.8vw,2.25rem)] h-[clamp(1.5rem,1.8vw,2.25rem)] flex items-center justify-center text-[#2c2418] text-[clamp(1rem,1.1vw,1.25rem)] font-light cursor-pointer bg-transparent border-none"
                                aria-label="Close menu"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Links */}
                        <nav ref={linksRef} className="flex-1 flex flex-col items-center justify-center gap-1">
                            {[
                                { href: '/', label: 'Home' },
                                { href: '/shop', label: 'Shop' },
                                { href: '/about', label: 'About' },
                                { href: '/corporate', label: 'Corporate' },
                                { href: '/contact', label: 'Contact' },
                            ].map(({ href, label }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={handleClose}
                                    className="nav-link-item font-calson text-[#2c2418] text-[clamp(1.5rem,2vw,2.5rem)] font-light tracking-tight py-[clamp(0.25rem,0.4vw,0.5rem)] hover:opacity-50 transition-opacity no-underline"
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* Bottom border line */}
                        <div className="h-px bg-[#eae5dd]" />
                    </div>
                </>
            )}
        </>
    );
}
