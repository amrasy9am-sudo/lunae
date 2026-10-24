import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LUNAE — Glow from sun-up to moonlight",
    short_name: "LUNAE",
    description: "Halal makeup & skincare for tropical weather.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBF6F1",
    theme_color: "#2A1A16",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
