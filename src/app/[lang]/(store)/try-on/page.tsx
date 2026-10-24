import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { TryOn } from "@/components/try-on";

export const metadata: Metadata = { title: "Virtual try-on" };

export default async function TryOnPage({ params }: PageProps<"/[lang]/try-on">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader
        eyebrow={ms ? "Studio cuba maya" : "Try-on studio"}
        title={
          <>
            {ms ? "Cuba setiap rona." : "Try every shade."} <em>{ms ? "Tanpa calit, tanpa comot." : "No swatches, no mess."}</em>
          </>
        }
        intro={
          ms
            ? "AR masa nyata untuk bibir dan pipi terus dalam pelayar — tiada muat turun. Kening dan alas solek menyusul dalam fasa 2."
            : "Real-time AR for lips and cheeks right in your browser — nothing to download. Brows and base follow in phase 2."
        }
      />
      <div className="container-lux py-12">
        <Suspense fallback={<div className="skeleton h-[600px]" />}>
          <TryOn />
        </Suspense>
      </div>
    </>
  );
}
