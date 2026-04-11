"use client";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * ChangingText — cycles between two JSX text nodes every `interval` ms.
 *
 * Props
 * ─────
 * textA        JSX   first text
 * textB        JSX   second text
 * subtitle     str   optional body text below the heading
 * interval     ms    swap cadence (default 2500)
 * dark         bool  dark‑background variant (white text)
 * className    str   extra wrapper classes
 */
export default function ChangingText({
    textA,
    textB,
    subtitle,
    interval = 2500,
    dark = false,
    className = "",
}) {
    const [showA, setShowA] = useState(true);
    const textRef = useRef(null);

    useEffect(() => {
        const id = setInterval(() => setShowA((prev) => !prev), interval);
        return () => clearInterval(id);
    }, [interval]);

    /* animate every time showA changes */
    useEffect(() => {
        if (!textRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                textRef.current,
                { opacity: 0, y: 24 },
                { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
            );
        });
        return () => ctx.revert();
    }, [showA]);

    return (
        <section
            className={`flex flex-col h-screen w-full items-center justify-center text-center px-6 ${dark ? "bg-[#3A271C] text-white" : "bg-[#FAF9EE] text-stone-800"
                } ${className}`}
        >
            <h1
                ref={textRef}
                className="font-eb text-[2.5rem] sm:text-[3rem] md:text-[6rem] leading-tight"
            >
                {showA ? textA : textB}
            </h1>
            {subtitle && (
                <p className={`max-w-2xl mt-10 font-calson text-lg md:text-xl leading-relaxed ${dark ? "text-[#c5bdb0]" : "text-stone-500"
                    }`}>
                    {subtitle}
                </p>
            )}
        </section>
    );
}
