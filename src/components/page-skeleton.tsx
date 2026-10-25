/** Instant placeholder shown while a dynamic page (product, article, batch…) streams in. */
export function PageSkeleton() {
  return (
    <div className="container-lux py-10 lg:py-14" aria-busy="true">
      <div className="skeleton h-4 w-48 rounded-full" />
      <div className="skeleton mt-6 h-14 w-full max-w-lg rounded-[14px]" />
      <div className="skeleton mt-4 h-5 w-full max-w-2xl rounded-full" />
      <div className="skeleton mt-2 h-5 w-full max-w-xl rounded-full" />
      <div className="skeleton mt-10 h-[420px] w-full rounded-[22px]" />
    </div>
  );
}
