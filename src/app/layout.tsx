import type { Metadata } from "next";
import { Questrial } from "next/font/google";
// import { Inter } from "next/font/google"; // Hidden - can switch back to Inter if needed
import localFont from "next/font/local";
import "./globals.css";

const questrial = Questrial({
  variable: "--font-questrial",
  subsets: ["latin"],
  weight: "400",
});

// Hidden Inter font - uncomment to switch back
// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

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
        className={`${questrial.variable} ${accentGraphic.variable} antialiased overflow-x-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
