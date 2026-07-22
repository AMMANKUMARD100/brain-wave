export default function SkeletonAnswerCard() {
  return (
    <article className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.16)] backdrop-blur animate-pulse">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-block h-12 w-12 rounded-2xl bg-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-full bg-slate-700" />
            <div className="h-3 w-24 rounded-full bg-slate-700" />
          </div>
        </div>
        <div className="h-8 w-20 rounded-full bg-slate-700" />
      </div>

      <div className="space-y-3">
        <div className="h-3 rounded-full bg-slate-700" />
        <div className="h-3 rounded-full bg-slate-700" />
        <div className="h-3 rounded-full bg-slate-700" />
        <div className="h-3 rounded-full bg-slate-700" />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="h-8 w-20 rounded-full bg-slate-700" />
        <span className="h-8 w-24 rounded-full bg-slate-700" />
        <span className="h-8 w-16 rounded-full bg-slate-700" />
      </div>
    </article>
  );
}
