import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RaktSetu - Find blood. Fast.",
  description:
    "A free website that helps people in India find blood: nearby blood banks first, then donors who have confirmed they are available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable} font-sans h-full`}>
      <body className="min-h-full flex flex-col bg-white text-[#1F1F1F] antialiased">
        {children}
      </body>
    </html>
  );
}
