import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { recoverCompareSession, clearCompareSession } from '../utils/sessionManager';
import type { CompareSession } from '../types';
import ComparePageShell from '../components/compare/ComparePageShell';
import CompareTopNavigation from '../components/compare/CompareTopNavigation';
import CompareHeaderCard from '../components/compare/CompareHeaderCard';
import CompareMetricCard from '../components/compare/CompareMetricCard';
import CompareProviderDetail from '../components/compare/CompareProviderDetail';
import ConsensusChart from '../components/compare/ConsensusChart';
import ExplainabilityPanel from '../components/compare/ExplainabilityPanel';
import AdvancedComparisonPanel from '../components/compare/AdvancedComparisonPanel';
import ReportExportModal from '../components/compare/ReportExportModal';
import { saveCompareSession } from '../utils/sessionManager';

function ComparePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<CompareSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const recovered = recoverCompareSession();
    if (!recovered) {
      clearCompareSession();
      navigate('/', { replace: true });
      return;
    }

    setSession(recovered);
    setIsLoading(false);
  }, [navigate]);

  if (isLoading) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[50vh] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/80 p-10 shadow-2xl shadow-black/20"
      >
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-400">Restoring session</p>
          <h1 className="mt-4 text-3xl font-semibold text-white">Recovering your compare session</h1>
          <p className="mt-3 text-slate-400">Please wait while we restore your previous results.</p>
        </div>
      </motion.section>
    );
  }

  if (!session) {
    return null;
  }

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const successfulProviders = useMemo(
    () => session.providers.filter((provider) => provider.status === 'success').length,
    [session.providers],
  );
  const failedProviders = useMemo(
    () => session.providers.filter((provider) => provider.status === 'error').length,
    [session.providers],
  );
  const processingTime = useMemo(
    () => `${session.providers.reduce((sum, provider) => sum + provider.responseTime, 0)} ms`,
    [session.providers],
  );
  const totalProviders = session.providers.length;
  const modelsUsed = totalProviders;
  const generatedAt = useMemo(() => new Date(session.createdAt).toLocaleString(), [session.createdAt]);

  const handleImportSession = (nextSession: CompareSession) => {
    saveCompareSession(nextSession);
    setSession(nextSession);
    setIsExportModalOpen(false);
  };

  const clusterData = useMemo(
    () => [
      {
        answer: 'Largest consensus answer',
        confidence: 'Very Strong Consensus',
        score: '87%',
        representative: session.providers[0]?.modelName || 'N/A',
        members: session.providers.slice(0, 3).map((provider) => provider.modelName),
      },
      {
        answer: 'Secondary consensus answer',
        confidence: 'Strong Consensus',
        score: '76%',
        representative: session.providers[1]?.modelName || 'N/A',
        members: session.providers.slice(1, 4).map((provider) => provider.modelName),
      },
    ],
    [session.providers],
  );

  return (
    <ComparePageShell>
      <CompareTopNavigation title="AI Consensus Analytics" subtitle="Compare results with a premium dashboard" />

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Export ready</p>
          <p className="text-sm text-slate-300">Export complete comparison reports, share JSON snapshots, or print a polished report layout.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          Export report
        </button>
      </div>

      <ReportExportModal session={session} visible={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} onImportSession={handleImportSession} />

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <CompareHeaderCard
          question={session.question}
          timestamp={generatedAt}
          modelsUsed={modelsUsed}
          generationTime={processingTime}
          totalProviders={totalProviders}
          successfulProviders={successfulProviders}
          failedProviders={failedProviders}
        />

        <aside className="space-y-6">
          <CompareMetricCard title="Highest Agreement" value="92%" label="Top cluster" accent="bg-cyan-500/20 text-cyan-200" />
          <CompareMetricCard title="Lowest Agreement" value="42%" label="Outlier" accent="bg-rose-500/20 text-rose-200" />
          <CompareMetricCard title="Average Similarity" value="78%" label="Consensus" accent="bg-violet-500/20 text-violet-200" />
          <CompareMetricCard title="Total Clusters" value="4" label="Clusters" accent="bg-slate-500/20 text-slate-200" />
          <CompareMetricCard title="Processing Time" value={processingTime} label="Session" accent="bg-emerald-500/20 text-emerald-200" />
        </aside>
      </div>

      <div className="grid gap-6">
        <AdvancedComparisonPanel session={session} />
      </div>

      <div className="grid gap-6">
        <ExplainabilityPanel session={session} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <ConsensusChart
          session={session}
          title="Agreement Distribution"
          subtitle="Review how provider cluster agreement maps to the strongest semantic consensus signals."
          metric="consensusScore"
          metricLabel="Consensus score"
        />

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Cluster details</p>
            <div className="mt-5 space-y-4">
              {clusterData.map((cluster) => (
                <div key={cluster.answer} className="rounded-[1.5rem] bg-slate-900/70 p-4">
                  <p className="text-sm font-semibold text-white">{cluster.answer}</p>
                  <p className="mt-1 text-sm text-slate-400">Representative: {cluster.representative}</p>
                  <p className="mt-1 text-sm text-slate-400">Score: {cluster.score}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)]">
            <p className="text-sm uppercase tracking-[0.28em] text-cyan-300/80">Provider details</p>
            <div className="mt-5 space-y-4">
              {session.providers.map((provider) => (
                <CompareProviderDetail
                  key={provider.providerId}
                  providerName={provider.providerName}
                  modelName={provider.modelName}
                  status={provider.status}
                  responseTime={provider.responseTime}
                  answer={provider.answer}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </ComparePageShell>
  );
}

export default ComparePage;
