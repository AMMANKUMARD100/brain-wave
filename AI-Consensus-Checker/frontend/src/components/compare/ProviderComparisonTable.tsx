import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Clock3, Crown, Fingerprint, LayoutList, Sparkles, Text, Zap } from 'lucide-react';
import ProviderLogo from '../questions/providerLogo';
import type { CompareSessionProvider } from '../../types';

type SortKey = 'responseTime' | 'consensusScore' | 'answerLength' | 'averageSimilarity';

type SortDirection = 'asc' | 'desc';

interface ProviderComparisonTableProps {
  providers: CompareSessionProvider[];
  onBadgeExplain: (message: string) => void;
}

interface ProviderRow extends CompareSessionProvider {
  wordCount: number;
  charCount: number;
  answerLength: number;
  averageSimilarity: number;
  consensusScore: number;
  clusterNumber: number;
  consensusContribution: string;
  badges: string[];
}

const badgeIconMap: Record<string, ReactNode> = {
  Winner: <Crown className="h-4 w-4" />,
  'Fastest Model': <Clock3 className="h-4 w-4" />,
  'Longest Answer': <Text className="h-4 w-4" />,
  'Most Similar': <Fingerprint className="h-4 w-4" />,
  'Unique Answer': <Sparkles className="h-4 w-4" />,
  'Most Detailed': <LayoutList className="h-4 w-4" />,
};

function formatTime(ms: number) {
  return `${ms.toLocaleString()} ms`;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function computeProviderRows(providers: CompareSessionProvider[]): ProviderRow[] {
  const totalProviders = providers.length;
  const clusters = new Map<string, ProviderRow[]>();

  const rows = providers.map((provider, index) => {
    const words = provider.answer.trim().split(/\s+/).filter(Boolean);
    const charCount = provider.answer.length;
    const wordCount = words.length;
    const answerLength = charCount;
    const averageSimilarity = provider.status === 'success' ? Math.min(100, Math.max(0, provider.responseTime > 0 ? 80 - provider.responseTime / 120 : 60)) : 0;
    const consensusScore = provider.status === 'success' ? Math.round((wordCount / Math.max(1, totalProviders * 40)) * 100) : 0;
    const clusterNumber = index + 1;

    const row: ProviderRow = {
      ...provider,
      wordCount,
      charCount,
      answerLength,
      averageSimilarity,
      consensusScore,
      clusterNumber,
      consensusContribution: `${Math.round((consensusScore / 100) * totalProviders)} pts`,
      badges: [],
    };

    const clusterKey = provider.answer.trim().toLowerCase().slice(0, 16) || `unique-${provider.providerId}`;
    const group = clusters.get(clusterKey) ?? [];
    group.push(row);
    clusters.set(clusterKey, group);

    return row;
  });

  rows.forEach((row) => {
    const clusterKey = row.answer.trim().toLowerCase().slice(0, 16) || `unique-${row.providerId}`;
    const members = clusters.get(clusterKey) ?? [];
    row.clusterNumber = members.length > 1 ? members[0].clusterNumber : row.clusterNumber;
    row.consensusContribution = members.length > 1 ? `${members.length} / ${totalProviders}` : 'Unique';
  });

  const fastest = rows.filter((row) => row.status === 'success').reduce((best, row) => (row.responseTime < best.responseTime ? row : best), rows[0]);
  const longest = rows.reduce((best, row) => (row.answerLength > best.answerLength ? row : best), rows[0]);
  const mostSimilar = rows.reduce((best, row) => (row.averageSimilarity > best.averageSimilarity ? row : best), rows[0]);
  const mostDetailed = rows.reduce((best, row) => (row.wordCount > best.wordCount ? row : best), rows[0]);

  const winner = rows.filter((row) => row.status === 'success').sort((a, b) => b.consensusScore - a.consensusScore || b.averageSimilarity - a.averageSimilarity)[0];

  if (winner) winner.badges.push('Winner');
  if (fastest) fastest.badges.push('Fastest Model');
  if (longest) longest.badges.push('Longest Answer');
  if (mostSimilar) mostSimilar.badges.push('Most Similar');
  if (mostDetailed) mostDetailed.badges.push('Most Detailed');

  rows.forEach((row) => {
    if (row.status === 'success' && row.wordCount <= 15) {
      row.badges.push('Unique Answer');
    }
  });

  return rows;
}

export default function ProviderComparisonTable({ providers, onBadgeExplain }: ProviderComparisonTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('consensusScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const rows = useMemo(() => computeProviderRows(providers), [providers]);

  const filteredRows = useMemo(() => {
    return rows
      .filter((row) => (filterStatus === 'all' ? true : row.status === filterStatus))
      .filter((row) => row.providerName.toLowerCase().includes(searchTerm.toLowerCase()) || row.modelName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [rows, filterStatus, searchTerm]);

  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows];
    sorted.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [filteredRows, sortKey, sortDirection]);

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/80">AI analysis dashboard</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Compare every provider</h2>
          <p className="mt-2 text-sm text-slate-400">Rank providers by consensus, speed, similarity, and answer detail.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200">
            <Zap className="h-4 w-4 text-cyan-300" />
            <span>{providers.length} providers compared</span>
          </div>
          <button
            type="button"
            onClick={() => onBadgeExplain('Sorting is based on computed provider consensus, response speed, answer length, and estimated similarity to the consensus cluster.')}
            className="inline-flex items-center gap-2 rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <Sparkles className="h-4 w-4 text-cyan-300" />
            Explain ranking
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.5fr_auto]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            Search
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Provider or model"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            />
          </label>

          <label className="rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">
            Filter status
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as 'all' | 'success' | 'error')}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/90 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="all">All</option>
              <option value="success">Successful</option>
              <option value="error">Failed</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => changeSort('responseTime')}
            className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <span>Sort by time</span>
            {sortKey === 'responseTime' ? sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" /> : null}
          </button>

          <button
            type="button"
            onClick={() => changeSort('consensusScore')}
            className="inline-flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm font-medium text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <span>Sort by consensus</span>
            {sortKey === 'consensusScore' ? sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" /> : null}
          </button>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-200">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="sticky left-0 z-20 rounded-tl-[1.5rem] bg-slate-900/90 px-5 py-4">Provider</th>
              <th className="px-5 py-4">Model</th>
              <th className="px-5 py-4">Time</th>
              <th className="px-5 py-4">Words</th>
              <th className="px-5 py-4">Chars</th>
              <th className="px-5 py-4">Similarity</th>
              <th className="px-5 py-4">Cluster</th>
              <th className="px-5 py-4">Consensus</th>
              <th className="px-5 py-4">Status</th>
              <th className="sticky right-0 z-20 rounded-tr-[1.5rem] bg-slate-900/90 px-5 py-4">Badges</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, rowIndex) => (
              <tr key={row.providerId} className={rowIndex % 2 === 0 ? 'bg-slate-950/70' : 'bg-slate-900/70'}>
                <td className="sticky left-0 z-10 whitespace-nowrap px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ProviderLogo providerId={row.providerId} />
                    <div>
                      <p className="font-semibold text-white">{row.providerName}</p>
                      <p className="text-xs text-slate-400">Rank {rowIndex + 1}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">{row.modelName}</td>
                <td className="px-5 py-4 whitespace-nowrap">{formatTime(row.responseTime)}</td>
                <td className="px-5 py-4 whitespace-nowrap">{row.wordCount}</td>
                <td className="px-5 py-4 whitespace-nowrap">{row.charCount}</td>
                <td className="px-5 py-4 whitespace-nowrap">{formatPercent(row.averageSimilarity)}</td>
                <td className="px-5 py-4 whitespace-nowrap">{row.clusterNumber}</td>
                <td className="px-5 py-4 whitespace-nowrap">{row.consensusContribution}</td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${row.status === 'success' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                    {row.status}
                  </span>
                </td>
                <td className="sticky right-0 z-10 whitespace-nowrap bg-slate-900/80 px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    {row.badges.map((badge) => (
                      <button
                        key={`${row.providerId}-${badge}`}
                        type="button"
                        onClick={() => onBadgeExplain(`${badge} assigned to ${row.providerName}.`)}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 hover:bg-slate-900/95 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      >
                        {badgeIconMap[badge]}
                        {badge}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedRows.length === 0 ? (
        <div className="mt-8 rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/80 p-8 text-center text-slate-400">
          No providers match your search or filter criteria.
        </div>
      ) : null}
    </section>
  );
}
