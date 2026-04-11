import LandingSection from "@/components/Sections/HomePage/LandingSection";
import VerticalSection from "@/components/Sections/HomePage/VerticalSection";
import CorporateSection from "@/components/Sections/HomePage/CorporateSection";
import ChangingText from "@/components/UI/ChangingText";

export default function Home() {
  return (
    <main>
      <LandingSection />

      <ChangingText
        textA={
          <>
            Rooted In <span className="italic">Africa</span>
          </>
        }
        textB={
          <>
            Inspired by the <span className="italic">World</span>
          </>
        }
        subtitle="We believe in slow food, bold ideas, and local excellence. Our goal is to contribute to Ethiopian craftsmanship on the global stage — with chocolate."
        dark
      />

      <VerticalSection />

      <ChangingText
        textA={
          <>
            Crafted with <span className="italic">Care.</span>
          </>
        }
        textB={
          <>
            Shared with <span className="italic">Generosity.</span>
          </>
        }
        subtitle="From classic truffles to flavour-forward bonbons, every collection reflects our passion for beauty, balance, and storytelling."
        dark={false}
      />

      <CorporateSection />
    </main>
  );
}