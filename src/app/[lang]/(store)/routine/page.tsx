import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { RoutineBuilder } from "@/components/routine-builder";

export const metadata: Metadata = { title: "Routine Builder" };

export default async function RoutinePage({ params }: PageProps<"/[lang]/routine">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader
        eyebrow={ms ? "Pembina Rutin" : "Routine Builder"}
        title={
          <>
            {ms ? "Satu rutin untuk mentari." : "One routine for the sun."} <em>{ms ? "Satu lagi untuk bulan." : "Another for the moon."}</em>
          </>
        }
        intro={
          ms
            ? "Seret produk ke langkah pagi dan malam — harga set dikemas kini serta-merta. Simpan, kongsi pautan, atau masukkan ke troli."
            : "Drag products into your AM and PM steps — bundle pricing updates live. Save it, share a link, or add it to your bag."
        }
      />
      <div className="container-lux py-12">
        <Suspense fallback={<div className="skeleton h-[500px]" />}>
          <RoutineBuilder />
        </Suspense>
      </div>
    </>
  );
}
