"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Headings from "@/components/UI/Headings";
import BodyText from "@/components/UI/BodyText";
import Links from "@/components/UI/Links";
import MainHeadings from "@/components/UI/MainHeadings";

/* ── scroll‑triggered reveal helper ────────────────── */
function useReveal(ref, selectors) {
    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { duration: 0.6, ease: "power3.out" },
                scrollTrigger: {
                    trigger: ref.current,
                    start: "top 70%",
                    toggleActions: "play none none none",
                },
            });
            selectors.forEach((sel, i) => {
                tl.from(sel, { y: 20, opacity: 0, stagger: 0.12 }, i === 0 ? 0 : "-=0.25");
            });
        }, ref);
        return () => ctx.revert();
    }, [ref, selectors]);
}

export default function CorporatePage() {
    const heroRef = useRef(null);
    const whyRef = useRef(null);
    const processRef = useRef(null);
    const ctaRef = useRef(null);

    /* hero entrance */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power3.out" } });
            tl.from(".corp-logo", { y: 100, opacity: 1 });
            tl.from([".corp-heading", ".corp-copy", ".corp-links"], { y: 20, opacity: 0, stagger: 0.12 }, ">-0.05");
        }, heroRef);
        return () => ctx.revert();
    }, []);

    useReveal(whyRef, [".why-image", ".why-heading", ".why-copy"]);
    useReveal(processRef, [".process-image", ".process-heading", ".process-copy"]);
    useReveal(ctaRef, [".cta-image", ".cta-heading", ".cta-copy", ".cta-links"]);

    return (
        <main>
            {/* ─── HERO — mirrors LandingSection ─────────────── */}
            <section
                ref={heroRef}
                className="h-screen lg:p-20 w-full lg:flex lg:flex-col flex flex-col justify-center items-center lg:gap-10 gap-15 p-10 overflow-hidden"
            >
                <div className="corp-logo">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/brownLogo.svg"
                            alt="Chocolatier Adey logo"
                            width={200}
                            height={200}
                            className="w-30 h-44 lg:w-72 lg:h-40 mb transition"
                        />
                    </Link>
                </div>
                <MainHeadings className="corp-heading">Gifting</MainHeadings>
                <BodyText className="corp-copy">
                    Make an impression that lasts.
                </BodyText>
                <div className="corp-links">
                    <Links>
                        <p><Link href="/contact">Get in Touch</Link></p>
                        <p>|</p>
                        <p><Link href="/shop">Shop</Link></p>
                    </Links>
                </div>
            </section>

            {/* ─── WHY ADEY — text left, image right ─────────── */}
            <section
                ref={whyRef}
                className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="why-heading">Why Adey?</Headings>
                    <BodyText className="why-copy text-left lg:text-xl">
                        Whether
                        you're gifting for clients, executives, or events, we offer
                        customisable chocolate gifts that convey refined taste,
                        gratitude, and brand warmth.
                        <br /><br />
                        • Handcrafted in Ethiopia<br />
                        • Premium presentation<br />
                        • Custom branding options<br />
                        • Tiered offerings to suit various gifting needs
                    </BodyText>
                </div>
                <div className="why-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Image
                        src="/High2.webp"
                        alt="Corporate gift box"
                        width={1080}
                        height={1920}
                        className="w-70 lg:w-150 h-auto mb transition"
                    />
                </div>
            </section>

            {/* ─── HOW IT WORKS — image left, text right ──────── */}
            <section
                ref={processRef}
                className="flex flex-col-reverse lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="process-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Image
                        src="/Box.png"
                        alt="Adey chocolate box"
                        width={1080}
                        height={1920}
                        className="w-70 lg:w-150 h-auto mb transition"
                    />
                </div>
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="process-heading">How It Works</Headings>
                    <BodyText className="process-copy text-left lg:text-xl">
                        <strong>01 — Consult</strong><br />
                        Tell us about your occasion, audience, and branding needs. We'll
                        guide you to the perfect collection.
                        <br /><br />
                        <strong>02 — Customise</strong><br />
                        Choose your selection, packaging, and personal touches. We handle
                        the design and production.
                        <br /><br />
                        <strong>03 — Deliver</strong><br />

                        We ensure every gift is beautifully packaged and delivered on time.
                        <br />
                        <span className="text-sm">* Please note, we require a minimum of 2-4 weeks advance notice for bespoke orders</span>
                    </BodyText>
                </div>
            </section>

            {/* ─── CTA — text left, image right ───────────────── */}
            <section
                ref={ctaRef}
                className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="cta-heading">Get in Touch</Headings>
                    <BodyText className="cta-copy text-left lg:text-xl">
                        Get in touch to discuss your  gifting
                        needs and let us craft a memorable experience for your clients,
                        partners, or team.
                    </BodyText>
                    <div className="cta-links">
                        <Links>
                            <p><Link className="underline" href="/contact">Book a Meeting</Link></p>
                        </Links>
                    </div>
                </div>
                <div className="cta-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Image
                        src="/Bark.webp"
                        alt="Chocolate bark"
                        width={1080}
                        height={1920}
                        className="w-70 lg:w-150 h-auto mb transition"
                    />
                </div>
            </section>
        </main>
    );
}
