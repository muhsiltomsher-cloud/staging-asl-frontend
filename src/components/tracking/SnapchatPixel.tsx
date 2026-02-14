"use client";

import Script from "next/script";

interface SnapchatPixelProps {
  pixelId: string;
}

export function SnapchatPixel({ pixelId }: SnapchatPixelProps) {
  if (!pixelId) return null;

  return (
    <Script id="snapchat-pixel" strategy="afterInteractive">
      {`
        (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
        {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
        a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;
        r.src=n;var u=t.getElementsByTagName(s)[0];
        u.parentNode.insertBefore(r,u);})(window,document,
        'https://sc-static.net/scevent.min.js');
        snaptr('init', '${pixelId}', {});
        snaptr('track', 'PAGE_VIEW');
      `}
    </Script>
  );
}
