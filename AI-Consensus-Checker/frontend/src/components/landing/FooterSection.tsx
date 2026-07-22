function FooterSection() {
  return (
    <footer className="mt-8 rounded-[2rem] border border-white/10 bg-slate-900/70 px-8 py-8 shadow-[0_20px_80px_rgba(0,0,0,0.2)] backdrop-blur">
      <div className="flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-medium text-slate-200">GitHub Placeholder</p>
          <p className="mt-1">Developer Placeholder</p>
        </div>
        <div className="text-left md:text-right">
          <p className="font-medium text-slate-200">Version 0.1.0</p>
          <p className="mt-1">Built for a premium hackathon presentation.</p>
        </div>
      </div>
    </footer>
  );
}

export default FooterSection;
