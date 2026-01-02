import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" suppressHydrationWarning className="overflow-x-clip">
      <body
        className={`${inter.variable} antialiased overflow-x-clip`}
      >
        {children}
      </body>
    </html>
  );
}
