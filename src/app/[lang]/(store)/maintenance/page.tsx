import type { Metadata } from "next";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Maintenance", robots: { index: false } };

export default async function Maintenance({ params }: PageProps<"/[lang]/maintenance">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <section className="starfield bg-night text-moon grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <LogoMark className="text-moon mx-auto h-20 w-20" />
        <h1 className="display-l mt-8">{ms ? "Kami sedang bersolek." : "We're touching up."}</h1>
        <p className="text-halo mx-auto mt-4 max-w-md">
          {ms ? "Penyelenggaraan berjadual — kami kembali sebentar lagi. Troli anda selamat." : "Scheduled maintenance — we'll be back shortly. Your bag is saved."}
        </p>
      </div>
    </section>
  );
}
