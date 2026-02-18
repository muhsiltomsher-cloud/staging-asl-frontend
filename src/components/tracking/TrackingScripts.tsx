"use client";

import { GoogleAnalytics } from "./GoogleAnalytics";
import { FacebookPixel } from "./FacebookPixel";
import { TikTokPixel } from "./TikTokPixel";
import { SnapchatPixel } from "./SnapchatPixel";

interface TrackingScriptsProps {
  gaId?: string;
  googleAdsId?: string;
  fbPixelId?: string;
  tiktokPixelId?: string;
  snapPixelId?: string;
}

export function TrackingScripts({
  gaId,
  googleAdsId,
  fbPixelId,
  tiktokPixelId,
  snapPixelId,
}: TrackingScriptsProps){
  return (
    <>
      {gaId && <GoogleAnalytics gaId={gaId} googleAdsId={googleAdsId} />}
      {fbPixelId && <FacebookPixel pixelId={fbPixelId} />}
      {tiktokPixelId && <TikTokPixel pixelId={tiktokPixelId} />}
      {snapPixelId && <SnapchatPixel pixelId={snapPixelId} />}
    </>
  );
}
