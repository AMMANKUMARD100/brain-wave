import { useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CompareSession } from '../../types';
import type { ConsensusCluster } from '../../types/cluster';

interface ConsensusChartProps {
  session: CompareSession;
  title: string;
  subtitle: string;
  metric: 'consensusScore' | 'averageSimilarity';
  metricLabel: string;
}

const chartColors = ['#38bdf8', '#818cf8', '#f472b6', '#a855f7', '#34d399', '#facc15'];

function buildClustersFromProviders(providers: CompareSession['providers']): ConsensusCluster[] {
  const groupMap = new Map<string, ConsensusCluster>();
  const totalProviders = providers.length;

  providers.forEach((provider) => {
    const answerKey = provider.answer.trim() || `__empty_answer_${provider.providerId}`;
    const existing = groupMap.get(answerKey);
    if (existing) {
      existing.members.push({
        id: provider.providerId,
        model: provider.modelName,
        answer: provider.answer,
      });
    } else {
      const clusterIndex = groupMap.size + 1;
      groupMap.set(answerKey, {
        clusterId: `cluster-${clusterIndex}`,
        clusterLabel: `Cluster ${clusterIndex}`,
        representativeAnswer: provider.answer,
        representativeId: provider.providerId,
        representativeModel: provider.modelName,
        members: [
          {
            id: provider.providerId,
            model: provider.modelName,
            answer: provider.answer,
          },
        ],
        modelCount: 1,
        averageSimilarity: 0,
        minimumSimilarity: 0,
        maximumSimilarity: 0,
        variance: 0,
        consensusScore: 0,
        confidenceLabel: 'Unique',
        explanation: `This cluster captures the response from ${provider.modelName}.`,
      });
    }
  });

  return Array.from(groupMap.values()).map((cluster) => {
    const score = Math.round((cluster.members.length / totalProviders) * 100);
    const averageSimilarity = Number((score / 100).toFixed(2));
    const confidenceLabel =
      score >= 85 ? 'Very Strong Consensus' : score >= 65 ? 'Strong Consensus' : score >= 45 ? 'Moderate Consensus' : 'Low Consensus';
    const explanation =
      cluster.members.length > 1
        ? `${cluster.members.length} of ${totalProviders} providers agree on this answer.`
        : `This answer is unique among the current providers.`;

    return {
      ...cluster,
      modelCount: cluster.members.length,
      averageSimilarity,
      minimumSimilarity: averageSimilarity,
      maximumSimilarity: averageSimilarity,
      variance: 0,
      consensusScore: score,
      confidenceLabel,
      explanation,
    };
  })
  .sort((a, b) => b.consensusScore - a.consensusScore || b.modelCount - a.modelCount);
}

function formatTooltip(cluster: ConsensusCluster, metricLabel: string): ReactNode {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-4 text-left text-sm text-slate-200 shadow-[0_30px_70px_rgba(0,0,0,0.35)]">
      <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{cluster.clusterLabel}</p>
      <p className="mt-3 text-base font-semibold text-white">{cluster.confidenceLabel}</p>
      <div className="mt-3 space-y-2">
        <p className="text-slate-300">
          <span className="font-semibold text-white">{metricLabel}:</span>{' '}
          {metricLabel === 'Average similarity' ? `${Math.round(cluster.averageSimilarity * 100)}%` : `${cluster.consensusScore}%`}
        </p>
        <p className="text-slate-300">Representative: {cluster.representativeModel}</p>
        <p className="text-slate-300">Members: {cluster.members.length}</p>
        <p className="text-slate-300">Similarity range: {Math.round(cluster.minimumSimilarity * 100)}%–{Math.round(cluster.maximumSimilarity * 100)}%</p>
        <p className="text-slate-300">Explanation: {cluster.explanation}</p>
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ConsensusChart({ session, title, subtitle, metric, metricLabel }: ConsensusChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartId = useId();
  const [activeCluster, setActiveCluster] = useState<string | null>(null);

  const clusters = useMemo(() => buildClustersFromProviders(session.providers), [session.providers]);
  const selectedCluster = clusters.find((cluster) => cluster.clusterId === activeCluster) ?? clusters[0];
  const chartData = clusters.map((cluster) => ({
    ...cluster,
    displayValue: metric === 'averageSimilarity' ? cluster.averageSimilarity * 100 : cluster.consensusScore,
  }));

  const handleExportSvg = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) {
      return;
    }

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, `${title.replace(/\s+/g, '-').toLowerCase()}.svg`);
  };

  const handleExportPng = () => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (!svgElement) {
      return;
    }

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }
      context.fillStyle = '#0f172a';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${title.replace(/\s+/g, '-').toLowerCase()}.png`);
        }
        URL.revokeObjectURL(url);
      });
    };
    image.src = url;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] print:bg-white print:text-slate-950"
      role="region"
      aria-labelledby={`${chartId}-title`}
      ref={containerRef}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p id={`${chartId}-title`} className="text-sm uppercase tracking-[0.32em] text-cyan-300/80">{title}</p>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportSvg}
            className="inline-flex items-center justify-center rounded-full border border-cyan-500/30 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-200 transition hover:border-cyan-400/70 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Export SVG
          </button>
          <button
            type="button"
            onClick={handleExportPng}
            className="inline-flex items-center justify-center rounded-full border border-slate-700/80 bg-slate-900/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Export PNG
          </button>
        </div>
      </div>

      <div className="mt-6 h-[340px] min-h-[280px] rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-4 print:border-0 print:bg-white/0" aria-label="Semantic consensus bar chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 24 }}>
            <defs>
              <linearGradient id={`gradient-${chartId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#0f172a" stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.12)" />
            <XAxis
              dataKey="clusterLabel"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              minTickGap={16}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15,23,42,0.75)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) {
                  return null;
                }
                return formatTooltip(payload[0].payload as ConsensusCluster, metricLabel);
              }}
            />
            <Bar dataKey="displayValue" radius={[18, 18, 6, 6]} fill={`url(#gradient-${chartId})`}>
              {chartData.map((entry, entryIndex) => (
                <Cell
                  key={entry.clusterId}
                  fill={chartColors[entryIndex % chartColors.length]}
                  aria-label={`${entry.clusterLabel}: ${Math.round(entry.displayValue)}% ${metricLabel.toLowerCase()}`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {clusters.map((cluster) => (
          <button
            key={cluster.clusterId}
            type="button"
            onClick={() => setActiveCluster(cluster.clusterId)}
            className={`rounded-[1.5rem] border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
              selectedCluster?.clusterId === cluster.clusterId
                ? 'border-cyan-500/50 bg-cyan-500/10'
                : 'border-white/10 bg-slate-950/80 hover:border-cyan-400/30 hover:bg-slate-900/90'
            }`}
            aria-label={`Focus ${cluster.clusterLabel}, ${cluster.modelCount} model${cluster.modelCount === 1 ? '' : 's'}, ${cluster.confidenceLabel}`}
          >
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-semibold text-white">{cluster.clusterLabel}</span>
              <span className="rounded-full bg-slate-950/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
                {cluster.members.length} models
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-400">{cluster.representativeModel}</p>
            <div className="mt-4 flex items-center justify-between gap-4">
              <span className="text-xs uppercase tracking-[0.24em] text-slate-500">{metricLabel}</span>
              <span className="text-lg font-semibold text-white">{Math.round(cluster.consensusScore)}%</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 text-slate-300 print:border-0 print:bg-transparent">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Selected cluster summary</p>
        <h3 className="mt-3 text-xl font-semibold text-white">{selectedCluster.clusterLabel}</h3>
        <p className="mt-2 text-sm text-slate-400">{selectedCluster.confidenceLabel} — representative model {selectedCluster.representativeModel}</p>
        <p className="mt-3 text-sm leading-6 text-slate-300">{selectedCluster.explanation}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-950/70 p-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            <p className="font-semibold text-white">Consensus</p>
            <p className="mt-2 text-lg font-semibold text-white">{selectedCluster.consensusScore}%</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            <p className="font-semibold text-white">Similarity</p>
            <p className="mt-2 text-lg font-semibold text-white">{Math.round(selectedCluster.averageSimilarity * 100)}%</p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 p-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            <p className="font-semibold text-white">Members</p>
            <p className="mt-2 text-lg font-semibold text-white">{selectedCluster.members.length}</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
