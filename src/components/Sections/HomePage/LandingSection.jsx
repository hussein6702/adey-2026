"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Headings from "../../UI/Headings";
import MainHeadings from "../../UI/MainHeadings"
import BodyText from "../../UI/BodyText"
import Links from "../../UI/Links"
import Link from "next/link"
import Image from "next/image"

export default function LandingSection({ className = "" }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: 0.6, ease: "power3.out" },
      });

      // logo first
      tl.from(".landing-logo", { y: 100, opacity: 1 });

      // then heading image, copy, links — staggered
      tl.from(
        [".landing-heading-logo", ".landing-copy", ".landing-links"],
        { y: 20, opacity: 0, stagger: 0.12 },
        ">-0.05"
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={`${className} h-screen lg:p-20 w-full lg:flex lg:flex-col flex flex-col justify-center items-center lg:gap-10  gap-15 p-10 overflow-hidden`}>
      <div className="landing-logo">

      </div>
      <div className="landing-heading-logo mb-6">
        <Link href="/" className="inline-block">
          <Image
            src="/full_logo.svg"
            alt="Chocolatier Adey Full Logo"
            width={600}
            height={150}
            className="w-[80vw] max-w-150 h-auto"
          />
        </Link>
      </div>
      <BodyText className="landing-copy">
      </BodyText>
      <div className="landing-links">
        <Links>
          <p>
            <Link
              href="/about">
              Our Story
            </Link>
          </p>
          <p>|</p>
          <p>
            <Link
              href="/shop">
              Shop
            </Link>
          </p>
        </Links>
      </div>
    </section>
  );
}
