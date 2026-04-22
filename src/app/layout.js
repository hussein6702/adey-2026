import { Geist, Geist_Mono, EB_Garamond, Crimson_Text, Inter, Libre_Caslon_Text, Lato } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/UI/SiteShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const libreCalson = Libre_Caslon_Text({
  variable: "--font-calson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Chocolatier Adey",
  description: "Experience the art of artisanal chocolate",
  icons: {
    icon: "/brownLogo.svg",
    apple: "/brownLogo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${crimsonText.variable} ${libreCalson.variable} ${lato.variable} ${inter.variable} antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}


