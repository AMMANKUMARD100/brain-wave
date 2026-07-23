import { useMemo } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface SuggestedPromptsProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export default function SuggestedPrompts({ prompts, onSelectPrompt }: SuggestedPromptsProps) {
  const cards = useMemo(
    () =>
      prompts.map((prompt) => ({
        prompt,
        id: prompt.toLowerCase().replace(/\s+/g, '-'),
      })),
    [prompts],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onSelectPrompt(card.prompt)}
          className="group overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 text-left shadow-[0_30px_60px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
          aria-label={`Send suggested prompt: ${card.prompt}`}
        >
          <div className="flex items-center gap-3 text-cyan-300">
            <Sparkles size={18} />
            <span className="text-sm uppercase tracking-[0.24em] text-cyan-200/80">Suggestion</span>
          </div>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-100">{card.prompt}</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-all duration-200 group-hover:text-cyan-300">
            <span>Try this</span>
            <ArrowRight size={16} />
          </div>
        </button>
      ))}
    </div>
  );
}
