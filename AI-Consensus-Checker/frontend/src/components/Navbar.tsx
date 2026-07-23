import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sparkles } from 'lucide-react';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Compare', href: '/compare' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-wide text-white transition-all duration-300"
        >
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
            className="rounded-lg bg-gradient-to-br from-cyan-400 to-indigo-500 p-2 text-slate-950"
          >
            <Sparkles size={20} />
          </motion.div>
          <span className="bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            AI Consensus
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="relative px-4 py-2 text-sm font-medium text-slate-300 transition-colors duration-300 hover:text-white group"
            >
              {item.label}
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={isOpen ? 'visible' : 'hidden'}
        variants={containerVariants}
        className="md:hidden border-t border-white/10 bg-slate-900/50 backdrop-blur"
      >
        <div className="px-6 py-4 space-y-2">
          {navItems.map((item) => (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                to={item.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-3 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-all duration-300"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </header>
  );
}

export default Navbar;
