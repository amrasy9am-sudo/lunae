import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, RotateCw, ScanFace, ShieldCheck, Sun, Moon, Thermometer, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { concerns, productBySlug, tintBg } from "@/data/catalogue";
import { articles } from "@/data/journal";
import { rm } from "@/lib/format";
import { WeatherStrip } from "@/components/weather-strip";
import { Bestsellers, NightEdit } from "@/components/home/bestsellers";
import { DropCountdown, MoonStatusCards, SunsetLine } from "@/components/home/moon-widgets";
import { FaceIllustration } from "@/components/face-illustration";
import { MoonPhaseRow } from "@/components/home/phase-row";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const H = (p: string) => lhref(lang, p);
  const am = ["new-moon-gentle-cleanser", "full-moon-glow-serum", "daybreak-sun-gel", "eclipse-cushion"].map((s) => productBySlug(s)!);
  const pm = ["new-moon-gentle-cleanser", "full-moon-glow-serum", "nocturne-water-gel", "moonglow-liquid-highlighter"].map((s) => productBySlug(s)!);
  const sum = (a: typeof am) => a.reduce((x, p) => x + p.price, 0);

  return (
    <>
      {/* ---------------- HERO · Day ---------------- */}
      <div className="day-only">
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_70%_40%,var(--tint-clay),transparent_60%),linear-gradient(180deg,var(--surface),var(--bg))]">
          <div className="container-lux grid items-center gap-10 pt-12 pb-14 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr] lg:pt-16 lg:pb-20">
            <div className="animate-moonrise">
              <p className="eyebrow text-accent-deep">{T(tx("New · The Eclipse Cushion", "Baharu · Eclipse Cushion"))}</p>
              <h1 className="display-xl mt-5">
                {T(tx("Glow that", "Seri yang"))}
                <br />
                <em className="italic">{T(tx("outlasts", "mengatasi"))}</em> {T(tx("the heat.", "bahang."))}
              </h1>
              <p className="text-ink-2 mt-6 max-w-[34rem] text-[17px] leading-relaxed">
                {T(
                  tx(
                    "Halal makeup engineered in a 33°C, 80% humidity climate chamber. Sweat, humidity, tudung — your face stays on, from sun-up to moonlight.",
                    "Solekan halal yang direka dalam kebuk iklim 33°C, kelembapan 80%. Peluh, lembap, tudung — wajah anda kekal, dari terbit mentari hingga cahaya bulan.",
                  ),
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={H("/products/eclipse-cushion")} className="btn btn-primary">
                  {T(tx("Shop Eclipse", "Beli Eclipse"))} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={H("/shade-finder")} className="btn btn-secondary">
                  <Camera className="h-4 w-4" strokeWidth={1.5} /> {T(tx("Find my shade", "Cari rona saya"))}
                </Link>
              </div>
              <dl className="divide-line mt-10 grid max-w-lg grid-cols-3 divide-x">
                {[
                  ["8h", tx("sweat-test target*", "sasaran ujian peluh*")],
                  ["12", tx("shades for SEA skin", "rona kulit Asia Tenggara")],
                  ["100%", tx("halal formulas", "formula halal")],
                ].map(([n, d], i) => (
                  <div key={i} className={i ? "pl-5" : "pr-5"}>
                    <dt className="font-display text-[42px] leading-none">{n as string}</dt>
                    <dd className="text-ink-3 mt-1.5 text-[13px]">{T(d as { en: string; ms: string })}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[560px]">
              <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_50%_45%,#F6D9CB,#EFC6B4_70%)] [[data-theme=midnight]_&]:opacity-0" />
              <Image
                src="/img/cutouts/eclipse-cushion.webp"
                alt="Eclipse Cushion"
                width={905}
                height={551}
                priority
                className="absolute top-[36%] left-[14%] w-[62%] drop-shadow-[0_30px_30px_rgba(42,26,22,0.22)]"
              />
              <Image
                src="/img/cutouts/nightbloom-lip-cheek-tint.webp"
                alt="Nightbloom Lip & Cheek Tint"
                width={159}
                height={945}
                priority
                className="absolute top-[6%] left-[6%] w-[11%] -rotate-[8deg] drop-shadow-[0_20px_20px_rgba(42,26,22,0.2)]"
              />
              <Image
                src="/img/cutouts/moonbeam-skin-tint.webp"
                alt="Moonbeam Skin Tint SPF30"
                width={357}
                height={954}
                priority
                className="absolute top-[12%] right-[6%] w-[21%] rotate-[4deg] drop-shadow-[0_24px_24px_rgba(42,26,22,0.2)]"
              />
              <div className="bg-glass absolute bottom-[10%] left-0 flex items-center gap-3 rounded-[14px] px-4 py-3 shadow-[var(--shadow-e2)] backdrop-blur-[14px] sm:left-[4%]">
                <span className="bg-surface-2 grid h-9 w-9 place-items-center rounded-full">
                  <Thermometer className="text-accent-deep h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[13.5px] font-semibold">{T(tx("Tested at 33°C · 80% RH", "Diuji pada 33°C · 80% RH"))}</span>
                  <span className="text-ink-3 block text-[12px]">{T(tx("Thermal-camera wear test, 8 hours*", "Ujian kamera terma, 8 jam*"))}</span>
                </span>
              </div>
              <Link href={H("/shade-finder")} className="bg-glass absolute right-0 bottom-0 rounded-[14px] px-4 py-3 shadow-[var(--shadow-e2)] backdrop-blur-[14px] sm:right-[4%]">
                <span className="eyebrow text-sage">{T(tx("AI shade match", "Padanan rona AI"))}</span>
                <span className="mt-1.5 flex items-center gap-2 text-[14px] font-semibold">
                  <span className="h-5 w-5 rounded-full bg-[#D09A6C]" /> {T(tx("Find yours in 60 s", "Cari dalam 60 saat"))}
                </span>
              </Link>
            </div>
          </div>
        </section>
        <WeatherStrip />
      </div>

      {/* ---------------- HERO · Midnight ---------------- */}
      <div className="night-only">
        <section className="starfield bg-night text-moon relative overflow-hidden">
          <div className="container-lux grid items-center gap-10 pt-12 pb-10 lg:min-h-[620px] lg:grid-cols-[1fr_1fr] lg:pt-16">
            <div className="animate-moonrise">
              <p className="eyebrow text-glow">
                <SunsetLine />
              </p>
              <h1 className="display-xl mt-5">
                {T(tx("Still flawless", "Masih sempurna"))}
                <br />
                <em className="italic">{T(tx("at midnight.", "pada tengah malam."))}</em>
              </h1>
              <p className="text-halo mt-6 max-w-[32rem] text-[17px] leading-relaxed">
                {T(
                  tx(
                    "The site shifted to Moonlight mode at sunset. Tonight's edit: a glow that catches the light, colour that won't transfer, lashes that hold through the last dance.",
                    "Laman ini bertukar ke mod Moonlight selepas matahari terbenam. Pilihan malam ini: sinar yang menangkap cahaya, warna yang tak berpindah, bulu mata yang tahan hingga tamat majlis.",
                  ),
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={H("/shop?edit=night")} className="btn btn-accent">
                  {T(tx("Shop the night edit", "Beli pilihan malam"))} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={H("/circle")} className="btn border-mist text-moon hover:border-moon border">
                  <Moon className="h-4 w-4" strokeWidth={1.5} /> Lunae Circle
                </Link>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[560px]">
              <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle_at_35%_50%,#F3EDE4_0%,#E9DFCF_45%,transparent_46%)] opacity-90" />
              <div className="bg-night absolute inset-[6%] translate-x-[18%] rounded-full" />
              <Image
                src="/img/cutouts/moonglow-liquid-highlighter.webp"
                alt="Moonglow Liquid Highlighter"
                width={371}
                height={961}
                className="absolute top-[24%] left-[16%] w-[22%] drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)]"
              />
              <Image
                src="/img/cutouts/selene-matte-lipstick.webp"
                alt="Selene Matte Lipstick"
                width={653}
                height={956}
                className="absolute top-[38%] left-[42%] w-[30%] drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)]"
              />
              <Image
                src="/img/cutouts/starlash-lift-mascara.webp"
                alt="Starlash Lift Mascara"
                width={165}
                height={946}
                className="absolute top-[18%] right-[8%] w-[11%] rotate-[12deg] drop-shadow-[0_24px_30px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
          <div className="container-lux pb-12">
            <MoonStatusCards />
          </div>
        </section>
      </div>

      {/* ---------------- Shop by concern ---------------- */}
      <section className="container-lux py-20 lg:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ink-3">{T(tx("Shop by concern", "Beli ikut keperluan"))}</p>
            <h2 className="display-l mt-3">{T(tx("What does your day ask of you?", "Apa yang hari anda perlukan?"))}</h2>
          </div>
          <Link href={H("/shop")} className="hover:text-accent-deep hidden items-center gap-2 text-[13px] font-semibold tracking-[0.12em] uppercase md:flex">
            {T(tx("View all", "Lihat semua"))} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <ul className="no-scrollbar -mx-4 mt-10 flex snap-x gap-5 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-6 md:px-0">
          {concerns.map((c) => (
            <li key={c.key} className="w-[38vw] shrink-0 snap-start md:w-auto">
              <Link href={H(`/concern/${c.key}`)} className="group block text-center">
                <span className={`relative mx-auto block aspect-square overflow-hidden rounded-full ${tintBg[c.tint as keyof typeof tintBg]}`}>
                  <Image
                    src={c.image.replace("/products/", "/cutouts/")}
                    alt=""
                    fill
                    sizes="(min-width:768px) 15vw, 38vw"
                    className="object-contain p-[24%] drop-shadow-[0_12px_14px_rgba(42,26,22,0.18)] transition duration-700 group-hover:scale-110"
                  />
                </span>
                <span className="mt-4 block text-[15px] font-medium">{T(c.name)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- Bestsellers / Night edit ---------------- */}
      <section className="container-lux pb-20 lg:pb-28">
        <div className="day-only">
          <Bestsellers />
        </div>
        <div className="night-only">
          <NightEdit />
        </div>
      </section>

      {/* ---------------- AR promo ---------------- */}
      <section className="border-line bg-surface border-t">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div className="reveal bg-tint-clay relative overflow-hidden rounded-[24px] p-8 sm:p-12">
            <div className="border-cocoa-ink relative mx-auto w-[min(300px,70%)] overflow-hidden rounded-[40px] border-[8px] shadow-[var(--shadow-e3)]">
              <FaceIllustration lip="#B5303A" className="block w-full" />
              <span className="badge bg-cream text-cocoa-ink absolute top-4 left-4">Live AR</span>
            </div>
            <div className="bg-glass absolute top-10 right-4 rounded-[12px] px-3 py-2 text-[12.5px] shadow-[var(--shadow-e2)] backdrop-blur-[14px] sm:right-8">
              <strong>Selene · Rambutan</strong>
              <br />
              <span className="text-ink-3">{T(tx("Matte · transfer-resistant*", "Matte · tahan pindah*"))}</span>
            </div>
            <div className="bg-glass mx-auto mt-5 flex w-fit gap-2 rounded-full p-2 backdrop-blur">
              {["#B5303A", "#6C2A3D", "#D0283A", "#B07A5E", "#9A5B45", "#D96A7A"].map((c) => (
                <span key={c} className="h-7 w-7 rounded-full border-2 border-white/80" style={{ background: c }} />
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow text-accent-deep">{T(tx("Virtual try-on", "Cuba maya"))}</p>
            <h2 className="display-l mt-4">
              {T(tx("Try every shade.", "Cuba setiap rona."))}
              <br />
              <em className="italic">{T(tx("No swatches, no mess.", "Tanpa calit, tanpa comot."))}</em>
            </h2>
            <p className="text-ink-2 mt-6 max-w-lg text-[17px]">
              {T(
                tx(
                  "Real-time AR for lips right in your browser — cheeks, brows and base are next. Nothing to download, and your camera feed never leaves your phone.",
                  "AR masa nyata untuk bibir terus dalam pelayar anda — pipi, kening dan alas solek akan menyusul. Tiada muat turun, dan suapan kamera tidak pernah keluar dari telefon anda.",
                ),
              )}
            </p>
            <ul className="mt-8 grid max-w-lg grid-cols-2 gap-4 text-[14.5px]">
              {[
                [Camera, tx("Live camera or photo", "Kamera langsung atau foto")],
                [ScanFace, tx("478-point face mesh", "Jaringan wajah 478 titik")],
                [ShieldCheck, tx("On-device, private", "Dalam peranti, peribadi")],
                [RotateCw, tx("Compare 4 shades", "Banding 4 rona")],
              ].map(([I, s], i) => {
                const Icon = I as typeof Camera;
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className="bg-surface-2 grid h-10 w-10 place-items-center rounded-full">
                      <Icon className="text-accent-deep h-[18px] w-[18px]" strokeWidth={1.5} />
                    </span>
                    {T(s as { en: string; ms: string })}
                  </li>
                );
              })}
            </ul>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={H("/try-on")} className="btn btn-primary">
                {T(tx("Try it live", "Cuba sekarang"))}
              </Link>
              <Link href={H("/products/selene-matte-lipstick#view-360")} className="btn btn-secondary">
                <RotateCw className="h-4 w-4" strokeWidth={1.5} /> {T(tx("360° product view", "Paparan 360°"))}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Routine builder ---------------- */}
      <section className="bg-surface-2">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.15fr] lg:py-28">
          <div>
            <p className="eyebrow text-accent-deep">{T(tx("Routine Builder", "Pembina Rutin"))}</p>
            <h2 className="display-l mt-4">
              {T(tx("One routine for the sun.", "Satu rutin untuk mentari."))}
              <br />
              <em className="italic">{T(tx("Another for the moon.", "Satu lagi untuk bulan."))}</em>
            </h2>
            <p className="text-ink-2 mt-6 max-w-md text-[17px]">
              {T(
                tx(
                  "Drag products into your AM and PM steps — bundle pricing updates live. Save it, share it, or let it auto-refill.",
                  "Seret produk ke langkah pagi dan malam — harga set dikemas kini serta-merta. Simpan, kongsi, atau biar isi semula automatik.",
                ),
              )}
            </p>
            <div className="mt-8 flex items-center gap-5">
              <Link href={H("/routine")} className="btn btn-accent">
                {T(tx("Build my routine", "Bina rutin saya"))}
              </Link>
              <span className="text-[14px] font-medium">{T(tx("Save up to 15%", "Jimat sehingga 15%"))}</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { list: am, title: tx("AM · Sun-up", "Pagi · Terbit"), icon: Sun, dark: false },
              { list: pm, title: tx("PM · Moonlight", "Malam · Moonlight"), icon: Moon, dark: true },
            ].map((r) => {
              const total = sum(r.list);
              const Icon = r.icon;
              return (
                <div key={r.title.en} className={`reveal rounded-[20px] p-6 shadow-[var(--shadow-e2)] ${r.dark ? "bg-night text-moon" : "bg-surface"}`}>
                  <p className="eyebrow flex items-center gap-2">
                    <Icon className="h-4 w-4" strokeWidth={1.5} /> {T(r.title)}
                  </p>
                  <ol className={`mt-4 divide-y ${r.dark ? "divide-mist" : "divide-line"}`}>
                    {r.list.map((p, i) => (
                      <li key={p.slug + i} className="flex items-center gap-3 py-3">
                        <span className="w-3 text-[12px] opacity-60">{i + 1}</span>
                        <span className={`relative h-11 w-10 shrink-0 overflow-hidden rounded-[8px] ${r.dark ? "bg-veil" : "bg-tint-sage"}`}>
                          <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="40px" className="object-contain p-1" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="product-name block text-[16px]">{p.shortName}</span>
                          <span className="block truncate text-[12.5px] opacity-60">{T(p.type)}</span>
                        </span>
                        <span className="text-[14px] font-semibold">{rm(p.price)}</span>
                      </li>
                    ))}
                  </ol>
                  <div className={`mt-2 flex items-center justify-between border-t pt-4 text-[14px] ${r.dark ? "border-mist" : "border-line"}`}>
                    <span className="opacity-75">{T(tx("Bundle −12%", "Set −12%"))}</span>
                    <span>
                      <s className="mr-2 opacity-50">{rm(total)}</s>
                      <strong className="text-[18px]">{rm(Math.round(total * 0.88))}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Lunae Circle ---------------- */}
      <section className="starfield bg-night text-moon">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="eyebrow text-glow">Lunae Circle</p>
            <h2 className="display-l mt-4">
              {T(tx("Rewards that wax", "Ganjaran yang mengembang"))}
              <br />
              <em className="italic">{T(tx("with every glow.", "bersama setiap seri."))}</em>
            </h2>
            <p className="text-halo mt-6 max-w-lg text-[17px]">
              {T(
                tx(
                  "Earn points on every ringgit, unlock new phases, and get first access to Full Moon Drops — limited releases that open only on full-moon nights, with double points.",
                  "Kumpul mata untuk setiap ringgit, buka fasa baharu, dan dapatkan akses awal ke Full Moon Drops — keluaran terhad yang dibuka hanya pada malam bulan purnama, dengan mata berganda.",
                ),
              )}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={H("/account/login?next=/account/circle")} className="btn bg-moon text-cocoa-ink hover:bg-white">
                {T(tx("Join free · 200 pts", "Sertai percuma · 200 mata"))}
              </Link>
              <Link href={H("/circle")} className="btn border-mist text-moon hover:border-moon border">
                {T(tx("How it works", "Cara ia berfungsi"))}
              </Link>
            </div>
          </div>
          <div className="border-mist bg-dusk/70 rounded-[24px] border p-7 backdrop-blur sm:p-9">
            <DropCountdown />
            <MoonPhaseRow lang={lang} />
          </div>
        </div>
      </section>

      {/* ---------------- Journal ---------------- */}
      <section className="container-lux py-20 lg:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-ink-3">{T(tx("The Journal", "Jurnal"))}</p>
            <h2 className="display-l mt-3">{T(tx("Made for the tropics", "Dicipta untuk tropika"))}</h2>
          </div>
          <Link href={H("/journal")} className="btn btn-secondary btn-sm hidden md:inline-flex">
            {T(tx("All stories", "Semua cerita"))}
          </Link>
        </div>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {articles.slice(0, 3).map((a) => (
            <Link key={a.slug} href={H(`/journal/${a.slug}`)} className="group reveal block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[20px]">
                <Image src={a.image} alt="" fill sizes="(min-width:768px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </span>
              <p className="eyebrow text-ink-3 mt-5">
                {T(a.kind)} · {a.minutes} min
              </p>
              <h3 className="group-hover:text-accent-deep mt-2 font-serif text-[22px] leading-snug">{T(a.title)}</h3>
            </Link>
          ))}
        </div>
        <p className="text-ink-3 mt-16 flex items-center gap-2 text-[12.5px]">
          <Sparkles className="h-3.5 w-3.5" />
          {T(
            tx(
              "*Claims marked with an asterisk are targets that will only be used once supported by independent testing (in-vivo SPF, dermatological & humid wear tests), within NPRA's cosmetic-claims scope.",
              "*Dakwaan bertanda bintang ialah sasaran yang hanya akan digunakan selepas disokong ujian bebas (SPF in-vivo, ujian dermatologi & ujian pakai lembap), dalam skop dakwaan kosmetik NPRA.",
            ),
          )}
        </p>
      </section>
    </>
  );
}
