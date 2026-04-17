'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on admin pages
    const adminPaths = ['/login', '/orders', '/collections', '/storefront', '/analytics'];
    if (adminPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
        return null;
    }

    return (
        <footer className="site-footer">
            <div className="footer-inner">
                {/* Brand */}
                <div className="footer-brand">
                    <h2 className="footer-logo">Chocolatier Adey</h2>
                    <p className="footer-tagline">
                        Handcrafted. Rooted in Africa.<br />One bonbon at a time.
                    </p>
                </div>

                {/* Navigation */}
                <nav className="footer-nav">
                    <h3 className="footer-nav-heading">Explore</h3>
                    <ul className="footer-nav-list">
                        {[
                            { href: '/', label: 'Home' },
                            { href: '/shop', label: 'Shop' },
                            { href: '/about', label: 'About' },
                            { href: '/corporate', label: 'Corporate' },
                            { href: '/contact', label: 'Contact' },
                        ].map(({ href, label }) => (
                            <li key={href}>
                                <Link href={href} className="footer-nav-link">{label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Contact */}
                <div className="footer-contact">
                    <h3 className="footer-nav-heading">Get in Touch</h3>
                    <ul className="footer-nav-list">
                        <li><a href="mailto:hello@adeychocolatier.com" className="footer-nav-link">hello@adeychocolatier.com</a></li>
                        <li><a href="tel:+251987863536" className="footer-nav-link">+251 987 863 536</a></li>
                        <li><span className="footer-nav-link">Addis Ababa, Ethiopia</span></li>
                    </ul>
                    <div className="footer-social">
                        <a href="https://www.instagram.com/adeychocolatier/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                            </svg>
                        </a>
                        <a href="https://www.tiktok.com/@adey.chocolatier" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="TikTok">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Chocolatier Adey. All rights reserved.</p>
            </div>

            <style jsx>{`
                .site-footer {
                    background: #2c2418;
                    color: #c5bdb0;
                    padding: 5rem 2rem 0;
                    font-family: var(--font-calson), Georgia, serif;
                }

                .footer-inner {
                    max-width: 1200px;
                    margin: 0 auto;
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr;
                    gap: 4rem;
                    padding-bottom: 4rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .footer-logo {
                    font-family: var(--font-eb), Georgia, serif;
                    font-size: 1.8rem;
                    font-weight: 400;
                    color: #f5f0e8;
                    margin-bottom: 1rem;
                    letter-spacing: -0.01em;
                }

                .footer-tagline {
                    font-size: 0.9rem;
                    line-height: 1.7;
                    color: #9a8b78;
                }

                .footer-nav-heading {
                    font-family: var(--font-calson), Georgia, serif;
                    font-size: 0.7rem;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: #9a8b78;
                    margin-bottom: 1.5rem;
                    font-weight: 400;
                }

                .footer-nav-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }

                .footer-nav-link {
                    color: #c5bdb0;
                    text-decoration: none;
                    font-size: 0.88rem;
                    transition: color 0.3s ease;
                    cursor: pointer;
                }

                .footer-nav-link:hover {
                    color: #f5f0e8;
                }

                .footer-social {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }

                .footer-social-link {
                    color: #9a8b78;
                    transition: color 0.3s ease;
                }

                .footer-social-link:hover {
                    color: #f5f0e8;
                }

                .footer-bottom {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem 0;
                    text-align: center;
                    font-size: 0.75rem;
                    color: #6b5e50;
                    letter-spacing: 0.04em;
                }

                @media (max-width: 768px) {
                    .footer-inner {
                        grid-template-columns: 1fr;
                        gap: 2.5rem;
                        text-align: center;
                    }

                    .footer-social {
                        justify-content: center;
                    }
                }
            `}</style>
        </footer>
    );
}
