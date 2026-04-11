"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Headings from "../../UI/Headings";
import BodyText from "../../UI/BodyText";
import Links from "../../UI/Links";
import Link from "next/link";
import Image from "next/image";

export default function CorporateSection(){
    const ref = useRef(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { duration: 0.6, ease: 'power3.out' },
                scrollTrigger: {
                    trigger: ref.current,
                    start: 'top 70%',
                    toggleActions: 'play none none none',
                }
            });

            // image first, then heading -> copy -> links
            gsap.set('.corporate-image, .corporate-heading, .corporate-copy, .corporate-links', { willChange: 'transform, opacity' });
            tl.from('.corporate-image', { x: 60, opacity: 0 });
            tl.from(['.corporate-heading', '.corporate-copy', '.corporate-links'], { y: 20, opacity: 0, stagger: 0.12 }, '-=0.25');
        }, ref);

        return () => ctx.revert();
    }, []);

    return(
<section 
  ref={ref} 
  className="flex flex-col-reverse lg:flex-row h-auto w-full lg:w-[80vw] lg:justify-center lg:items-center mx-auto overflow-hidden"
>            <div className="corporate-image w-full h-1/2 lg:h-full lg:w-1/2  lg:min-w-1/2 lg:flex p-10 lg:items-center lg:justify-center">
                <Image
                    src="/High2.webp"
                    alt="Chocolatier Adey image"
                    width={1080}
                    height={1920}
                    className="w-70 lg:w-150 h-auto mb transition hover:grayscale-none"
                />

            </div>
            <div className="w-full lg:h-full lg:w-1/2 flex flex-col lg:gap-20 gap-10 lg:min-w-1/2 lg:p-20 p-10">
                <Headings className="corporate-heading">
                        Corporate Gifting
                </Headings>
                <BodyText className="corporate-copy text-left lg:text-xl">
                   Whether you’re thanking a client or celebrating a milestone, our curated chocolate gifts speak volumes.<br/><br/>

 Whether you’re gifting for clients, executives, or events, we offer beautiful, customisable chocolate gifts that convey refined taste, gratitude, and brand warmth.
We offer custom branding options upon request. 
                </BodyText>
                <div className="corporate-links">
                    <Links>
                        <p>
                            <Link className="underline" href="/about">Book a meeting</Link>
                        </p>
                    </Links>
                </div>
            </div>
        </section>
    )
}