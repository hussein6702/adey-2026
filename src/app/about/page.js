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

export default function AboutPage() {
    const heroRef = useRef(null);
    const storyRef = useRef(null);
    const nameRef = useRef(null);
    const logoRef = useRef(null);

    /* hero entrance */
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { duration: 0.6, ease: "power3.out" } });
            tl.from(".about-logo", { y: 100, opacity: 1 });
            tl.from([".about-heading", ".about-copy", ".about-links"], { y: 20, opacity: 0, stagger: 0.12 }, ">-0.05");
        }, heroRef);
        return () => ctx.revert();
    }, []);

    useReveal(storyRef, [".story-image", ".story-heading", ".story-copy"]);
    useReveal(nameRef, [".name-image", ".name-heading", ".name-copy"]);
    useReveal(logoRef, [".logo-image", ".logo-heading", ".logo-copy"]);

    return (
        <main>
            {/* ─── HERO — mirrors LandingSection ─────────────── */}
            <section
                ref={heroRef}
                className="h-screen lg:p-20 w-full lg:flex lg:flex-col flex flex-col justify-center items-center lg:gap-10 gap-15 p-10 overflow-hidden"
            >
                <div className="about-logo">
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
                <MainHeadings className="about-heading">Our Story</MainHeadings>
                <BodyText className="about-copy">
                    Crafted with intention, rooted in place. One bonbon at a time.
                </BodyText>
                <div className="about-links">
                    <Links>
                        <p><Link href="/shop">Shop</Link></p>
                        <p>|</p>
                        <p><Link href="/contact">Contact</Link></p>
                    </Links>
                </div>
            </section>

            {/* ─── OUR STORY — text left, image right ────────── */}
            <section
                ref={storyRef}
                className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="story-heading">Rooted in Ethiopia, <br />
                        Inspired by the world.</Headings>
                    <BodyText className="story-copy text-left lg:text-xl">
                        Chocolatier Adey was born from a simple desire to convey Ethiopia's
                        rich history of craftsmanship and culinary heritage through the
                        medium of chocolate. What started in a basement kitchen in 2017 is
                        now a growing atelier, where every piece is made by hand with care,
                        skill, and artistic expression.
                        <br /><br />
                        We are self‑taught chocolatiers inspired by refined European
                        techniques, the rich tapestry of African cultures, and a passion for
                        creating beauty by bridging the two.
                        <br /><br />
                        At Chocolatier Adey, each piece is an embodiment of the resilience,
                        creativity &amp; ambition of the African Renaissance — a celebration of
                        what has been, what is, and what is yet to come.
                    </BodyText>
                </div>
                <div className="story-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Image
                        src="/01.jpg"
                        alt="Chocolatier Adey studio"
                        width={1080}
                        height={1920}
                        className="w-70 lg:w-150 h-auto mb transition"
                    />
                </div>
            </section>

            {/* ─── OUR NAME — image left, text right ─────────── */}
            <section
                ref={nameRef}
                className="flex flex-col-reverse lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="name-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Image
                        src="/flowers.jpg"
                        alt="Chocolatier Adey bonbons"
                        width={1080}
                        height={1920}
                        className="w-70 lg:w-120 lg:mt-20 h-auto mb transition"
                    />
                </div>
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="name-heading">Our Name</Headings>
                    <BodyText className="name-copy text-left lg:text-xl">
                        Our name, Adey, honours the flower that marks the Ethiopian New Year,
                        symbolising the renewal and resurgence of African craftsmanship on the
                        global stage. Reflecting the budding promise of Ethiopia &amp; Africa
                        blossoming into a beacon of excellence, this is chocolate with a
                        point of view — rooted in place, crafted for the world.
                    </BodyText>
                </div>
            </section>

            {/* ─── OUR LOGO — text left, image right ──────────── */}
            <section
                ref={logoRef}
                className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
            >
                <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                    <Headings className="logo-heading">Our Logo</Headings>
                    <BodyText className="logo-copy text-left lg:text-xl">
                        A visual representation of the Akan proverb "Nea Onnim No Sua A,
                        Ohu" — "One who does not know, can know through learning" — it
                        speaks to our self‑taught beginnings, and the resourcefulness of a
                        continent that turns scarcity into artistry, and challenges into
                        triumphs. It is a quiet homage to Ethiopia and Africa as a whole.
                    </BodyText>
                </div>
                <div className="logo-image w-full h-1/2 lg:h-full lg:w-1/2 lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                    <Link href="/" className="inline-block">
                        <Image
                            src="/brownLogo.svg"
                            alt="Chocolatier Adey Logo"
                            width={1080}
                            height={1920}
                            className="w-35 lg:w-75 h-auto mb transition"
                        />
                    </Link>
                </div>
            </section>
        </main>
    );
}
