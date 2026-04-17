"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import Link from "next/link";
import Headings from "@/components/UI/Headings";
import BodyText from "@/components/UI/BodyText";
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

/* ── inline SVG icons ───────────────────────────────── */
function MapPinIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}
function ClockIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}
function PhoneIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    );
}
function MailIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    );
}

export default function ContactPage() {
    const heroRef = useRef(null);
    const formRef = useRef(null);
    const visitRef = useRef(null);

    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    /* hero entrance */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power3.out" } });
            tl.from(".contact-logo", { y: 100, opacity: 1 });
            tl.from([".contact-heading", ".contact-copy"], { y: 20, opacity: 0, stagger: 0.12 }, ">-0.05");
        }, heroRef);
        return () => ctx.revert();
    }, []);

    useReveal(formRef, [".form-heading", ".form-block"]);
    useReveal(visitRef, [".visit-image", ".visit-heading", ".visit-copy"]);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
    function handleSubmit(e) {
        e.preventDefault();
        setSubmitted(true);
    }

    return (
        <main>
            {/* ─── HERO — mirrors LandingSection ─────────────── */}
            <section
                ref={heroRef}
                className="h-screen lg:p-20 w-full lg:flex lg:flex-col flex flex-col justify-center items-center lg:gap-10 gap-15 p-10 overflow-hidden"
            >
                <div className="contact-logo">
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
                <MainHeadings className="contact-heading">Get in Touch</MainHeadings>
                <BodyText className="contact-copy">
                    We'd love to hear from you — whether it's about our chocolates,
                    corporate gifting, or visiting our tasting gallery.
                </BodyText>
            </section>

            {/* ─── FORM + INFO — left form, right image ───────── */}
            <section
                ref={formRef}
                className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-start mx-auto overflow-hidden"
            >
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-10 gap-8 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="form-heading">Send Us a Message</Headings>

                    <div className="form-block">
                        {submitted ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                <Headings>Thank you!</Headings>
                                <BodyText className="mt-4">
                                    We've received your message and will get back to you shortly.
                                </BodyText>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div>
                                    <label htmlFor="contact-name" className="block font-calson text-sm tracking-widest uppercase text-stone-400 mb-2">Name</label>
                                    <input id="contact-name" name="name" type="text" required value={form.name} onChange={handleChange}
                                        className="w-full border-b border-stone-300 bg-transparent py-3 font-calson text-lg text-stone-800 outline-none transition focus:border-[#3A271C]" />
                                </div>
                                <div>
                                    <label htmlFor="contact-email" className="block font-calson text-sm tracking-widest uppercase text-stone-400 mb-2">Email</label>
                                    <input id="contact-email" name="email" type="email" required value={form.email} onChange={handleChange}
                                        className="w-full border-b border-stone-300 bg-transparent py-3 font-calson text-lg text-stone-800 outline-none transition focus:border-[#3A271C]" />
                                </div>
                                <div>
                                    <label htmlFor="contact-subject" className="block font-calson text-sm tracking-widest uppercase text-stone-400 mb-2">Subject</label>
                                    <input id="contact-subject" name="subject" type="text" required value={form.subject} onChange={handleChange}
                                        className="w-full border-b border-stone-300 bg-transparent py-3 font-calson text-lg text-stone-800 outline-none transition focus:border-[#3A271C]" />
                                </div>
                                <div>
                                    <label htmlFor="contact-message" className="block font-calson text-sm tracking-widest uppercase text-stone-400 mb-2">Message</label>
                                    <textarea id="contact-message" name="message" rows={5} required value={form.message} onChange={handleChange}
                                        className="w-full border-b border-stone-300 bg-transparent py-3 font-calson text-lg text-stone-800 outline-none resize-none transition focus:border-[#3A271C]" />
                                </div>
                                <button type="submit"
                                    className="mt-4 self-start border border-[#3A271C] bg-[#3A271C] px-10 py-4 font-calson text-lg text-white transition-all duration-300 hover:bg-transparent hover:text-[#3A271C] cursor-pointer">
                                    Send Message
                                </button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Contact details on the right */}
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-10 gap-8 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings>Contact Information</Headings>
                    <div className="flex flex-col gap-5">
                        <div className="flex items-start gap-4 font-calson text-lg text-stone-600">
                            <MapPinIcon />
                            <span>Ground Level Finfinne Bldg., Meskel Sq., Addis Ababa</span>
                        </div>
                        <div className="flex items-start gap-4 font-calson text-lg text-stone-600">
                            <ClockIcon />
                            <span>Monday – Saturday, 10 am – 6 pm, Sundays, 12:30 pm – 4:30 pm</span>
                        </div>
                        <div className="flex items-start gap-4 font-calson text-lg text-stone-600">
                            <PhoneIcon />
                            <a href="tel:+251987863536" className="hover:text-stone-800 transition-colors">+251 987 863 536</a>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="flex items-start gap-4 font-calson text-lg text-stone-600">
                                <MailIcon />
                                <div className="flex flex-col gap-1">
                                    <a href="mailto:hello@adeychocolatier.com" className="hover:text-stone-800 transition-colors">hello@adeychocolatier.com</a>
                                    <a href="mailto:corporate@adeychocolatier.com" className="hover:text-stone-800 transition-colors text-sm text-stone-400">corporate@adeychocolatier.com</a>
                                    <a href="mailto:admin@adeychocolatier.com" className="hover:text-stone-800 transition-colors text-sm text-stone-400">admin@adeychocolatier.com</a>
                                    <a href="mailto:shop@adeychocolatier.com" className="hover:text-stone-800 transition-colors text-sm text-stone-400">shop@adeychocolatier.com</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── VISIT SECTION — left image, right text ───────── */}
            <section
                ref={visitRef}
                className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="visit-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Image
                        src="/High3.webp"
                        alt="Chocolatier Adey tasting gallery"
                        width={1080}
                        height={1920}
                        className="w-70 lg:w-150 h-auto mb transition"
                    />
                </div>
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="visit-heading">Visit us and Experience Chocolate as Art</Headings>
                    <BodyText className="visit-copy text-left lg:text-xl">
                        Our tasting gallery is more than a shop — it's a space to explore,
                        sample, and experience chocolate as art. Whether you're a
                        connoisseur or a curious newcomer, we welcome you to step inside.
                    </BodyText>
                </div>
            </section>
        </main>
    );
}
