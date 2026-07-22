import { useMemo, useState } from 'react';
import { Download, Info, TrendingUp } from 'lucide-react';
import { analyzeExplainability, type ExplainabilityAnalysis } from '../../utils/explainability';
import type { CompareSession } from '../../types';

interface ExplainabilityPanelProps {
  session: CompareSession;
}

const fileNameBase = 'ai-consensus-explainability-report';

export default function ExplainabilityPanel({ session }: ExplainabilityPanelProps) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const analysis: ExplainabilityAnalysis = useMemo(() => analyzeExplainability(session), [session]);

  const downloadText = () => {
    const blob = new Blob([analysis.reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileNameBase}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([analysis.reportMarkdown], { type: 'text/markdown;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileNameBase}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Explainability layer</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Why consensus exists</h2>
          <p className="mt-2 text-sm text-slate-400">Understand the shared reasoning and divergent signals behind each cluster.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadText}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Download className="h-4 w-4" />
            Download TXT
          </button>
          <button
            type="button"
            onClick={downloadMarkdown}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Download className="h-4 w-4" />
            Download Markdown
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-4">
          <article className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-500">AI recommendation</p>
            <p className="mt-4 text-lg leading-7 text-slate-200">{analysis.recommendation}</p>
          </article>

          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3 text-cyan-200">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Agreement</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{analysis.clusters[0]?.agreementPercent ?? 0}%</p>
              <p className="mt-2 text-sm text-slate-400">Consensus percentage for the leading cluster.</p>
            </article>
            <article className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5">
              <div className="flex items-center gap-3 text-rose-200">
                <Info className="h-5 w-5" />
                <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Disagreement</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{analysis.clusters[0]?.disagreementPercent ?? 0}%</p>
              <p className="mt-2 text-sm text-slate-400">Remaining provider divergence in the same cluster.</p>
            </article>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-6">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Timeline</p>
            <div className="mt-5 space-y-4">
              {analysis.timeline.map((step) => (
                <div key={step.step} className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{step.step}</p>
                  <p className="mt-2 text-sm text-slate-300">{step.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {analysis.clusters.map((cluster) => {
            const isExpanded = expandedCluster === cluster.clusterId;
            return (
              <article key={cluster.clusterId} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-900/80 shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
                <button
                  type="button"
                  onClick={() => setExpandedCluster(isExpanded ? null : cluster.clusterId)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isExpanded}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">{cluster.clusterLabel}</p>
                    <p className="mt-2 text-lg font-semibold text-white">{cluster.consensusStrength}</p>
                  </div>
                  <div className="rounded-full bg-slate-950/80 px-4 py-2 text-sm font-semibold text-slate-200">
                    {cluster.agreementPercent}%
                  </div>
                </button>
                <div className={`border-t border-white/10 px-6 transition-all duration-300 ${isExpanded ? 'py-5' : 'py-0'} ${isExpanded ? 'max-h-[800px]' : 'max-h-0'} overflow-hidden`}>
                  <div className="space-y-4">
                    <p className="text-sm leading-6 text-slate-300">{cluster.explanation}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Common concepts</p>
                        <p className="mt-3 text-sm text-slate-300">{cluster.commonConcepts.join(', ') || 'None'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Unique concepts</p>
                        <p className="mt-3 text-sm text-slate-300">{cluster.uniqueConcepts.join(', ') || 'None'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Missing concepts</p>
                        <p className="mt-3 text-sm text-slate-300">{cluster.missingConcepts.join(', ') || 'None'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Contradictions</p>
                        <p className="mt-3 text-sm text-slate-300">{cluster.contradictions.join(', ') || 'None'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {cluster.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

    </section>
  );
}
