"use client";

import { MessageCircle, Phone, Mail } from "lucide-react";

interface QuickContactButtonsProps {
  whatsappLabel: string;
  callLabel: string;
  emailLabel: string;
}

export function QuickContactButtons({
  whatsappLabel,
  callLabel,
  emailLabel,
}: QuickContactButtonsProps) {
  const handleEmailClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = "mailto:info@aromaticscentslab.com";
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <a
        href="https://wa.me/971506071405"
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all duration-300 hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:shadow-green-500/30"
      >
        <MessageCircle className="h-5 w-5" />
        {whatsappLabel}
      </a>
      <a
        href="tel:+971506071405"
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 transition-all duration-300 hover:from-amber-600 hover:to-amber-700 hover:shadow-xl hover:shadow-amber-500/30"
      >
        <Phone className="h-5 w-5" />
        {callLabel}
      </a>
      <a
        href="mailto:info@aromaticscentslab.com"
        onClick={handleEmailClick}
        className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30"
      >
        <Mail className="h-5 w-5" />
        {emailLabel}
      </a>
    </div>
  );
}
