import type { MetadataRoute } from "next";
import { categories, concerns, products } from "@/data/catalogue";
import { articles } from "@/data/journal";
import { glossary } from "@/data/formulas";
import { policies } from "@/data/policies";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/shop",
    ...categories.map((c) => `/shop/${c.key}`),
    ...concerns.map((c) => `/concern/${c.key}`),
    ...products.map((p) => `/products/${p.slug}`),
    "/shade-finder",
    "/try-on",
    "/routine",
    "/sets",
    "/drops",
    "/circle",
    "/lab",
    "/ingredients",
    ...glossary.map((g) => `/ingredients/${g.key}`),
    "/journal",
    ...articles.map((a) => `/journal/${a.slug}`),
    "/live",
    "/glow-forecast",
    "/trace",
    "/about",
    "/halal",
    "/stockists",
    "/help",
    "/contact",
    ...policies.map((p) => `/policies/${p.slug}`),
    "/partners",
    "/partners/join",
  ];
  return paths.map((p) => ({
    url: `${SITE_URL}/en${p}`,
    changeFrequency: p.startsWith("/products") || p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : p.startsWith("/products") || p.startsWith("/shop") ? 0.8 : 0.6,
    alternates: { languages: { en: `${SITE_URL}/en${p}`, ms: `${SITE_URL}/ms${p}` } },
  }));
}
