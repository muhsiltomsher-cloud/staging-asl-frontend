import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const accentGraphic = localFont({
  src: [
    {
      path: "../../public/fonts/AccentGraphic-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/AccentGraphic-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/AccentGraphic-Bold.otf",
      weight: "700",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${accentGraphic.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
