"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Headings from "../../UI/Headings";
import MainHeadings from "../../UI/MainHeadings";
import BodyText from "../../UI/BodyText";
import Links from "../../UI/Links";
import Link from "next/link";
import Image from "next/image";

export default function VerticalSection() {
    const ref = useRef(null);

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

            // image first, then heading -> copy -> links (staggered)
            tl.from(".vertical-image", { x: 60, opacity: 0 });
            tl.from([".vertical-heading", ".vertical-copy", ".vertical-links"], { y: 20, opacity: 0, stagger: 0.12 }, "-0.25");
        }, ref);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={ref}
            className="flex flex-col lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
        >            <div className="w-full  lg:h-full lg:w-1/2  flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                <Headings className="vertical-heading">
                    Handcrafted Excellence.
                </Headings>
                <BodyText className="vertical-copy text-left lg:text-xl">
                    Every Bonbon we produce is a culinary masterpiece. Handcrafted using world-class ingredients, our chocolates are a means to express what we stand for: slow food, craft and attention to the finest of details.
                </BodyText>
                <div className="vertical-links">
                    <Links>
                        <p>
                            <Link href="/shop">Shop</Link>
                        </p>
                        <p>|</p>
                        <p>
                            <Link href="/about">About</Link>
                        </p>
                    </Links>
                </div>
            </div>

            <div className="vertical-image w-full h-1/2 lg:h-full lg:w-1/2  lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                <Image
                    src="/High Res 1.webp"
                    alt="Chocolatier Adey logo"
                    width={1080}
                    height={1920}
                    className="w-70 lg:w-150 h-auto mb transition hover:grayscale-none"
                />
            </div>

        </section>
    )
}