import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/*/cart",
          "/*/checkout",
          "/*/order-confirmation",
          "/*/account",
          "/*/account/*",
          "/*/login",
          "/*/register",
          "/*/forgot-password",
          "/*/reset-password",
          "/*/wishlist",
          "/api/",
          "/wp-admin/",
          "/wp-login.php",
          "/wp-content/",
          "/wp-includes/",
          "/xmlrpc.php",
          "/wp-json/",
          "/feed/",
          "/trackback/",
          "/comments/",
          "/?s=",
          "/*?replytocom=",
        ],
      },
      {
        userAgent: "AhrefsBot",
        disallow: "/",
      },
      {
        userAgent: "SemrushBot",
        disallow: "/",
      },
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
      {
        userAgent: "DotBot",
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
