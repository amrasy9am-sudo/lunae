export default function Loading() {
  return (
    <div className="container-lux py-10 lg:py-14" aria-busy="true">
      <div className="skeleton h-4 w-40 rounded-full" />
      <div className="skeleton mt-6 h-16 w-72 rounded-[14px]" />
      <div className="skeleton mt-4 h-5 w-full max-w-xl rounded-full" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="skeleton aspect-[4/5] rounded-[18px]" />
        ))}
      </div>
    </div>
  );
}
