import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchResults } from "@/components/search-results";

export const metadata: Metadata = { title: "Search", robots: { index: false } };

export default async function SearchPage({ params }: PageProps<"/[lang]/search">) {
  const { lang } = await params;
  return (
    <div className="container-lux py-12 lg:py-16">
      <h1 className="display-l">{lang === "ms" ? "Cari" : "Search"}</h1>
      <div className="mt-8">
        <Suspense fallback={<div className="skeleton h-14 max-w-2xl" />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
