import type { Metadata } from "next";
import { FileText, Thermometer, Users, Clock, Droplets, Camera } from "lucide-react";
import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-bits";
import { SweatSlider } from "@/components/sweat-slider";
import { products } from "@/data/catalogue";
import { formulas } from "@/data/formulas";

export const metadata: Metadata = { title: "Sweat-Test Lab" };

export default async function LabPage({ params }: PageProps<"/[lang]/lab">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const proto = [
    { i: Thermometer, k: "33°C · 80% RH", d: tx("Climate chamber set to a Malaysian afternoon", "Kebuk iklim ditetapkan seperti petang di Malaysia") },
    { i: Clock, k: "0 → 8 h", d: tx("Measured at hour 0, 2, 4, 6 and 8", "Diukur pada jam 0, 2, 4, 6 dan 8") },
    { i: Users, k: "20", d: tx("Panellists across Fitzpatrick types III–VI", "Panel merangkumi jenis Fitzpatrick III–VI") },
    { i: Camera, k: "Thermal + 5,000K", d: tx("Thermal camera and calibrated daylight photography", "Kamera terma dan fotografi cahaya siang yang dikalibrasi") },
    { i: Droplets, k: "Sebumeter", d: tx("Shine & oil measured instrumentally, not by eye", "Kilat & minyak diukur dengan alat, bukan mata") },
    { i: FileText, k: "Independent", d: tx("Third-party lab report published as PDF", "Laporan makmal pihak ketiga diterbitkan sebagai PDF") },
  ];
  return (
    <>
      <PageHeader
        dark
        eyebrow="Sweat-Test Lab"
        title={
          <>
            {T(tx("Proof, not promises.", "Bukti, bukan janji."))} <em>#TahanCuacaKita</em>
          </>
        }
        intro={T(
          tx(
            "Every performance claim on LUNAE is tested in real heat and humidity before it's printed. If it doesn't pass, it isn't sold.",
            "Setiap dakwaan prestasi LUNAE diuji dalam panas dan kelembapan sebenar sebelum dicetak. Jika tidak lulus, ia tidak dijual.",
          ),
        )}
      />
      <section className="container-lux grid items-center gap-12 py-16 lg:grid-cols-[1.2fr_1fr]">
        <SweatSlider />
        <div>
          <h2 className="heading">{T(tx("The protocol", "Protokol"))}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {proto.map(({ i: Icon, k, d }) => (
              <li key={k} className="border-line bg-surface rounded-[16px] border p-4">
                <Icon className="text-accent-deep h-5 w-5" strokeWidth={1.5} />
                <p className="mt-2 font-semibold">{k}</p>
                <p className="text-ink-2 text-[13.5px]">{T(d)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="border-line bg-surface border-t">
        <div className="container-lux py-16">
          <h2 className="heading">{T(tx("Claims & their test status", "Dakwaan & status ujian"))}</h2>
          <p className="text-ink-2 mt-2 max-w-2xl">
            {T(
              tx(
                "Claims with an asterisk are pass thresholds. Reports will be linked here as each product completes testing with our ODM partners.",
                "Dakwaan bertanda bintang ialah ambang lulus. Laporan akan dipautkan di sini apabila setiap produk selesai diuji bersama rakan ODM kami.",
              ),
            )}
          </p>
          <div className="border-line mt-8 overflow-x-auto rounded-[16px] border">
            <table className="w-full min-w-[640px] text-left text-[14.5px]">
              <thead className="bg-band text-band-ink">
                <tr>
                  <th className="px-4 py-3 font-semibold">{T(tx("Product", "Produk"))}</th>
                  <th className="px-4 py-3 font-semibold">{T(tx("Performance target", "Sasaran prestasi"))}</th>
                  <th className="px-4 py-3 font-semibold">{T(tx("Status", "Status"))}</th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {products.map((p) => (
                  <tr key={p.slug} className="bg-bg">
                    <td className="px-4 py-3 font-serif font-semibold">{p.name}</td>
                    <td className="text-ink-2 px-4 py-3">{formulas[p.slug].performance}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-surface-3 text-ink-2">{T(tx("Scheduled with ODM", "Dijadualkan dengan ODM"))}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
