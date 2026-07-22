import { useMemo, useState, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Filter, Search, SlidersHorizontal } from 'lucide-react';
import type { CompareSession } from '../../types';
import {
  buildProviderRows,
  buildComparisonSummary,
  compareAnswerPairs,
  filterProviderRows,
  sortProviderRows,
} from '../../utils/comparisonHelpers';
import type { FilterState, ProviderCompareRow, SortKey, SortDirection } from '../../utils/comparisonHelpers';

const initialFilters: FilterState = {
  searchTerm: '',
  selectedProviders: [],
  consensusRange: [0, 100],
  responseTimeRange: [0, 10000],
  clusterSizeRange: [1, 10],
  confidenceLevels: [],
  status: 'all',
};

const sortOptions: Array<{ key: SortKey; label: string }> = [
  { key: 'highestConsensus', label: 'Highest Consensus' },
  { key: 'lowestConsensus', label: 'Lowest Consensus' },
  { key: 'fastestResponse', label: 'Fastest Response' },
  { key: 'longestAnswer', label: 'Longest Answer' },
  { key: 'shortestAnswer', label: 'Shortest Answer' },
  { key: 'highestSimilarity', label: 'Highest Similarity' },
  { key: 'providerName', label: 'Provider Name' },
];

const confidenceOptions = ['Very Strong', 'Strong', 'Moderate', 'Weak'] as const;

function AdvancedComparisonPanel({ session }: { session: CompareSession }) {
  const [sortKey, setSortKey] = useState<SortKey>('highestConsensus');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [panelOpen, setPanelOpen] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedPair, setSelectedPair] = useState<{ left: ProviderCompareRow | null; right: ProviderCompareRow | null }>({ left: null, right: null });

  const { rows } = useMemo(() => buildProviderRows(session), [session]);
  const filtered = useMemo(() => filterProviderRows(rows, filters, session.question), [rows, filters, session.question]);
  const sorted = useMemo(() => sortProviderRows(filtered, sortKey, sortDirection), [filtered, sortKey, sortDirection]);
  const summary = useMemo(() => buildComparisonSummary(session, sorted, filters.searchTerm), [session, sorted, filters.searchTerm]);

  const pairAnalysis = useMemo(() => {
    if (!selectedPair.left || !selectedPair.right) return null;
    return compareAnswerPairs(selectedPair.left, selectedPair.right);
  }, [selectedPair]);

  const providers = Array.from(new Set(session.providers.map((provider) => provider.providerName)));

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_auto]">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">Advanced comparison</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Explore results instantly</h2>
            </div>
            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <Filter className="h-4 w-4" />
              {panelOpen ? 'Hide filters' : 'Show filters'}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {panelOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 overflow-hidden"
              >
                <div className="grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Search</label>
                    <div className="mt-3 flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3">
                      <Search className="h-4 w-4 text-slate-400" />
                      <input
                        value={filters.searchTerm}
                        onChange={(event) => setFilters({ ...filters, searchTerm: event.target.value })}
                        placeholder="Search question, provider, answer, cluster..."
                        className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                        aria-label="Instant search across question and answers"
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Sort</label>
                    <select
                      value={sortKey}
                      onChange={(event) => setSortKey(event.target.value as SortKey)}
                      className="mt-3 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.key} value={option.key} className="bg-slate-950 text-slate-100">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setSortDirection((dir) => (dir === 'asc' ? 'desc' : 'asc'))}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                      {sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Provider</label>
                    <select
                      multiple
                      value={filters.selectedProviders}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          selectedProviders: Array.from(event.target.selectedOptions, (option) => option.value),
                        })
                      }
                      className="mt-3 h-40 w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none"
                    >
                      {providers.map((provider) => (
                        <option key={provider} value={provider} className="bg-slate-950 text-slate-100">
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Consensus score</label>
                    <div className="mt-3 grid gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={filters.consensusRange[0]}
                        onChange={(event) => setFilters({ ...filters, consensusRange: [Number(event.target.value), filters.consensusRange[1]] })}
                        className="w-full accent-cyan-400"
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={filters.consensusRange[1]}
                        onChange={(event) => setFilters({ ...filters, consensusRange: [filters.consensusRange[0], Number(event.target.value)] })}
                        className="w-full accent-cyan-400"
                      />
                      <p className="text-sm text-slate-400">{filters.consensusRange[0]}%–{filters.consensusRange[1]}%</p>
                    </div>
                  </div>

                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Confidence level</label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {confidenceOptions.map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => {
                            const present = filters.confidenceLevels.includes(level);
                            setFilters({
                              ...filters,
                              confidenceLevels: present
                                ? filters.confidenceLevels.filter((item) => item !== level)
                                : [...filters.confidenceLevels, level],
                            });
                          }}
                          className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                            filters.confidenceLevels.includes(level)
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                              : 'bg-slate-950/80 text-slate-400 border border-white/10'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Response time range</label>
                    <div className="mt-3 space-y-2">
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={50}
                        value={filters.responseTimeRange[0]}
                        onChange={(event) => setFilters({ ...filters, responseTimeRange: [Number(event.target.value), filters.responseTimeRange[1]] })}
                        className="w-full accent-cyan-400"
                      />
                      <input
                        type="range"
                        min={0}
                        max={10000}
                        step={50}
                        value={filters.responseTimeRange[1]}
                        onChange={(event) => setFilters({ ...filters, responseTimeRange: [filters.responseTimeRange[0], Number(event.target.value)] })}
                        className="w-full accent-cyan-400"
                      />
                      <p className="text-sm text-slate-400">{filters.responseTimeRange[0]}–{filters.responseTimeRange[1]} ms</p>
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                    <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Cluster size</label>
                    <div className="mt-3 space-y-2">
                      <input
                        type="range"
                        min={1}
                        max={session.providers.length}
                        value={filters.clusterSizeRange[0]}
                        onChange={(event) => setFilters({ ...filters, clusterSizeRange: [Number(event.target.value), filters.clusterSizeRange[1]] })}
                        className="w-full accent-cyan-400"
                      />
                      <input
                        type="range"
                        min={1}
                        max={session.providers.length}
                        value={filters.clusterSizeRange[1]}
                        onChange={(event) => setFilters({ ...filters, clusterSizeRange: [filters.clusterSizeRange[0], Number(event.target.value)] })}
                        className="w-full accent-cyan-400"
                      />
                      <p className="text-sm text-slate-400">{filters.clusterSizeRange[0]}–{filters.clusterSizeRange[1]} providers</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
                  <label className="block text-xs uppercase tracking-[0.28em] text-slate-500">Status</label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['all', 'success', 'error'] as const).map((statusOption) => (
                      <button
                        key={statusOption}
                        type="button"
                        onClick={() => setFilters({ ...filters, status: statusOption })}
                        className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] ${
                          filters.status === statusOption
                            ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30'
                            : 'bg-slate-950/80 text-slate-400 border border-white/10'
                        }`}
                      >
                        {statusOption}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total questions</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.totalQuestions}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Total clusters</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.totalClusters}</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Highest consensus</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.highestConsensus}%</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Average similarity</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.averageSimilarity}%</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Average response time</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.averageResponseTime} ms</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Failed providers</p>
              <p className="mt-3 text-3xl font-semibold text-white">{summary.failedProviders}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-300/80">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Answer comparison</span>
          </div>
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300">
                Left answer
                <select
                  value={selectedPair.left?.providerId ?? ''}
                  onChange={(event) => {
                    const provider = rows.find((row) => row.providerId === event.target.value) ?? null;
                    setSelectedPair((current) => ({ ...current, left: provider }));
                  }}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none"
                >
                  <option value="">Select provider</option>
                  {sorted.map((row) => (
                    <option key={`left-${row.providerId}`} value={row.providerId}>{row.providerName}</option>
                  ))}
                </select>
              </label>
              <label className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300">
                Right answer
                <select
                  value={selectedPair.right?.providerId ?? ''}
                  onChange={(event) => {
                    const provider = rows.find((row) => row.providerId === event.target.value) ?? null;
                    setSelectedPair((current) => ({ ...current, right: provider }));
                  }}
                  className="mt-3 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 outline-none"
                >
                  <option value="">Select provider</option>
                  {sorted.map((row) => (
                    <option key={`right-${row.providerId}`} value={row.providerId}>{row.providerName}</option>
                  ))}
                </select>
              </label>
            </div>

            {pairAnalysis ? (
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300">
                <p className="text-sm font-semibold text-white">Matching concepts</p>
                <p className="mt-2">{pairAnalysis.matchingConcepts.join(', ') || 'None detected'}</p>
                <p className="mt-4 text-sm font-semibold text-white">Different concepts</p>
                <p className="mt-2">Left only: {pairAnalysis.leftOnly.join(', ') || 'None'}.</p>
                <p className="mt-2">Right only: {pairAnalysis.rightOnly.join(', ') || 'None'}.</p>
                <p className="mt-4 text-sm font-semibold text-white">Contradictions</p>
                <p className="mt-2">{pairAnalysis.contradictions.join(', ') || 'None identified'}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-400">Select two answers to compare matching and differing concepts.</p>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="rounded-tl-[1.5rem] px-5 py-4">Provider</th>
                <th className="px-5 py-4">Consensus</th>
                <th className="px-5 py-4">Cluster</th>
                <th className="px-5 py-4">Confidence</th>
                <th className="px-5 py-4">Response</th>
                <th className="px-5 py-4">Words</th>
                <th className="px-5 py-4">Similarity</th>
                <th className="rounded-tr-[1.5rem] px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <motion.tr
                  key={row.providerId}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="odd:bg-slate-950/70 even:bg-slate-900/70"
                >
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="font-semibold text-white">{row.providerName}</div>
                    <div className="text-xs text-slate-400">{row.modelName}</div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">{row.consensusScore}%</td>
                  <td className="px-5 py-4 whitespace-nowrap">{row.clusterLabel} ({row.clusterSize})</td>
                  <td className="px-5 py-4 whitespace-nowrap">{row.confidenceLabel}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{row.responseTime} ms</td>
                  <td className="px-5 py-4 whitespace-nowrap">{row.wordCount}</td>
                  <td className="px-5 py-4 whitespace-nowrap">{row.averageSimilarity}%</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default memo(AdvancedComparisonPanel);


