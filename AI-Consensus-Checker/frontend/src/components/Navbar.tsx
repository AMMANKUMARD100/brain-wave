import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-semibold tracking-wide text-white">
          AI Consensus Checker
        </Link>
        <nav className="flex gap-4 text-sm text-slate-300">
          <Link to="/" className="transition hover:text-white">
            Home
          </Link>
          <Link to="/compare" className="transition hover:text-white">
            Compare
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
