import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const accentGraphic = localFont({
  src: [
    {
      path: "../../public/fonts/AccentGraphic-Medium.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-accent-graphic",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aromatic Scents Lab",
  description: "Premium fragrances and perfumes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${inter.variable} ${accentGraphic.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
