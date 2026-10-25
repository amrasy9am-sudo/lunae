export default function Loading() {
  return (
    <div className="container-lux py-8 lg:py-12" aria-busy="true">
      <div className="skeleton h-4 w-56 rounded-full" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="skeleton aspect-square rounded-[22px]" />
        <div className="space-y-4">
          <div className="skeleton h-4 w-32 rounded-full" />
          <div className="skeleton h-12 w-3/4 rounded-[14px]" />
          <div className="skeleton h-6 w-24 rounded-full" />
          <div className="skeleton h-24 w-full rounded-[14px]" />
          <div className="skeleton h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}
