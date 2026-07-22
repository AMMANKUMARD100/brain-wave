interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.35em] text-cyan-400">{eyebrow}</p>
      <h2 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h2>
      <p className="mt-3 text-lg text-slate-300">{description}</p>
    </div>
  );
}

export default SectionHeading;
