import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <section className="starfield bg-night text-moon grid min-h-dvh place-items-center px-4 text-center">
      <div>
        <LogoMark className="text-moon mx-auto h-20 w-20" />
        <p className="eyebrow text-glow mt-8">404 · New moon</p>
        <h1 className="display-l mt-4">This page has slipped behind the clouds.</h1>
        <p className="text-halo mx-auto mt-4 max-w-md">Halaman ini tiada. Try the shop, or search for what you need.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/en" className="btn bg-moon text-cocoa-ink">
            Home
          </Link>
          <Link href="/en/search" className="btn border-mist text-moon border">
            Search
          </Link>
          <Link href="/ms" className="btn border-mist text-moon border">
            Laman utama (BM)
          </Link>
        </div>
      </div>
    </section>
  );
}
