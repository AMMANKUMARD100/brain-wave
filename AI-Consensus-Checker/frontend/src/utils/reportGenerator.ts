import type { CompareSession } from '../types';

export interface ComparisonClusterSummary {
  clusterId: string;
  clusterLabel: string;
  representativeAnswer: string;
  consensusScore: number;
  confidenceLabel: string;
  memberModels: string[];
  memberProviders: string[];
}

export interface ComparisonReport {
  id: string;
  createdAt: string;
  question: string;
  timestamp: string;
  consensusAnswer: string;
  consensusScore: number;
  confidenceLevel: string;
  conclusion: string;
  similaritySummary: {
    averageSimilarity: number;
    highestSimilarity: number;
    lowestSimilarity: number;
  };
  responseTimeSummary: {
    fastest: number;
    slowest: number;
    average: number;
  };
  clusters: ComparisonClusterSummary[];
  providers: Array<{
    providerId: string;
    providerName: string;
    modelName: string;
    status: string;
    responseTime: number;
    answer: string;
    wordCount: number;
    charCount: number;
  }>;
}

function normalizeAnswer(answer: string) {
  return answer.trim().toLowerCase();
}

function buildClusters(session: CompareSession) {
  const groupMap = new Map<string, ComparisonClusterSummary>();
  const totalProviders = session.providers.length;

  session.providers.forEach((provider) => {
    const answerKey = normalizeAnswer(provider.answer) || `__empty_answer_${provider.providerId}`;
    const existing = groupMap.get(answerKey);
    if (existing) {
      existing.memberModels.push(provider.modelName);
      existing.memberProviders.push(provider.providerName);
    } else {
      groupMap.set(answerKey, {
        clusterId: `cluster-${groupMap.size + 1}`,
        clusterLabel: `Cluster ${groupMap.size + 1}`,
        representativeAnswer: provider.answer.trim(),
        consensusScore: 0,
        confidenceLabel: 'Low Consensus',
        memberModels: [provider.modelName],
        memberProviders: [provider.providerName],
      });
    }
  });

  const clusters = Array.from(groupMap.values()).map((cluster) => {
    const score = Math.round((cluster.memberModels.length / totalProviders) * 100);
    const confidenceLabel =
      score >= 85 ? 'Very Strong' : score >= 65 ? 'Strong' : score >= 45 ? 'Moderate' : 'Weak';

    return {
      ...cluster,
      consensusScore: score,
      confidenceLabel,
    };
  });

  return clusters.sort((a, b) => b.consensusScore - a.consensusScore || b.memberModels.length - a.memberModels.length);
}

function buildProviderSummaries(session: CompareSession) {
  return session.providers.map((provider) => {
    const words = provider.answer.trim().split(/\s+/).filter(Boolean);
    return {
      providerId: provider.providerId,
      providerName: provider.providerName,
      modelName: provider.modelName,
      status: provider.status,
      responseTime: provider.responseTime,
      answer: provider.answer.trim(),
      wordCount: words.length,
      charCount: provider.answer.length,
    };
  });
}

function computeSimilaritySummary(clusters: ComparisonClusterSummary[]) {
  const scores = clusters.map((cluster) => cluster.consensusScore);
  const averageSimilarity = Math.round((scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length)) * 10) / 10;
  return {
    averageSimilarity,
    highestSimilarity: Math.max(...scores, 0),
    lowestSimilarity: Math.min(...scores, 0),
  };
}

function computeResponseTimeSummary(providers: ComparisonReport['providers']) {
  const times = providers.map((provider) => provider.responseTime);
  const fastest = Math.min(...times);
  const slowest = Math.max(...times);
  const average = Math.round(times.reduce((sum, value) => sum + value, 0) / Math.max(1, times.length));
  return { fastest, slowest, average };
}

function formatConfidenceLevel(score: number) {
  return score >= 85 ? 'Very Strong' : score >= 65 ? 'Strong' : score >= 45 ? 'Moderate' : 'Weak';
}

function buildConclusion(report: ComparisonReport) {
  return `The comparison report for "${report.question}" shows ${report.providers.length} AI providers with a top consensus answer scoring ${report.consensusScore}% confidence. The strongest cluster contains ${report.clusters[0]?.memberModels.length ?? 0} model${report.clusters[0]?.memberModels.length === 1 ? '' : 's'} agreeing most closely, while response times ranged from ${report.responseTimeSummary.fastest} ms to ${report.responseTimeSummary.slowest} ms. Use the attached charts and cluster summaries to review agreement strength, provider-specific differences, and explanation patterns.`;
}

export function buildComparisonReport(session: CompareSession): ComparisonReport {
  const clusters = buildClusters(session);
  const providers = buildProviderSummaries(session);
  const similaritySummary = computeSimilaritySummary(clusters);
  const responseTimeSummary = computeResponseTimeSummary(providers);
  const primary = clusters[0] ?? {
    clusterId: 'cluster-1',
    clusterLabel: 'Cluster 1',
    representativeAnswer: session.providers[0]?.answer.trim() ?? 'No answer available',
    consensusScore: 0,
    confidenceLabel: 'Weak',
    memberModels: [],
    memberProviders: [],
  };

  const consensusScore = primary.consensusScore;
  const report: ComparisonReport = {
    id: `report-${new Date().toISOString()}`,
    createdAt: new Date().toISOString(),
    question: session.question,
    timestamp: session.createdAt,
    consensusAnswer: primary.representativeAnswer,
    consensusScore,
    confidenceLevel: formatConfidenceLevel(consensusScore),
    conclusion: '',
    similaritySummary,
    responseTimeSummary,
    clusters,
    providers,
  };

  report.conclusion = buildConclusion(report);
  return report;
}

export function generateReportFilename(base: string, extension: string) {
  const normalizedBase = base.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `${normalizedBase}-${timestamp}.${extension}`;
}

export function generateTxtReport(report: ComparisonReport): string {
  const lines: string[] = [];
  lines.push('AI Consensus Comparison Report');
  lines.push('='.repeat(34));
  lines.push(`Question: ${report.question}`);
  lines.push(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push('Consensus Answer:');
  lines.push(report.consensusAnswer);
  lines.push('');
  lines.push(`Consensus Score: ${report.consensusScore}%`);
  lines.push(`Confidence Level: ${report.confidenceLevel}`);
  lines.push('');
  lines.push('Similarity Matrix Summary:');
  lines.push(`- Average similarity: ${report.similaritySummary.averageSimilarity}%`);
  lines.push(`- Highest cluster score: ${report.similaritySummary.highestSimilarity}%`);
  lines.push(`- Lowest cluster score: ${report.similaritySummary.lowestSimilarity}%`);
  lines.push('');
  lines.push('Semantic Clusters:');
  report.clusters.forEach((cluster) => {
    lines.push(`- ${cluster.clusterLabel} (${cluster.consensusScore}%, ${cluster.confidenceLabel})`);
    lines.push(`  Representative answer: ${cluster.representativeAnswer}`);
    lines.push(`  Providers: ${cluster.memberProviders.join(', ')}`);
    lines.push('');
  });
  lines.push('Provider Metrics:');
  report.providers.forEach((provider) => {
    lines.push(`- ${provider.providerName} (${provider.modelName})`);
    lines.push(`  Status: ${provider.status}`);
    lines.push(`  Response time: ${provider.responseTime} ms`);
    lines.push(`  Word count: ${provider.wordCount}`);
    lines.push(`  Character count: ${provider.charCount}`);
    lines.push(`  Answer: ${provider.answer}`);
    lines.push('');
  });
  lines.push('Response Times:');
  lines.push(`- Fastest: ${report.responseTimeSummary.fastest} ms`);
  lines.push(`- Slowest: ${report.responseTimeSummary.slowest} ms`);
  lines.push(`- Average: ${report.responseTimeSummary.average} ms`);
  lines.push('');
  lines.push('Conclusion:');
  lines.push(report.conclusion);
  lines.push('');
  lines.push('Charts:');
  lines.push('- Bar chart export is available separately as PNG or SVG.');
  return lines.join('\n');
}

export function generateMarkdownReport(report: ComparisonReport): string {
  const lines: string[] = [];
  lines.push(`# AI Consensus Comparison Report`);
  lines.push('');
  lines.push(`**Question:** ${report.question}`);
  lines.push(`**Timestamp:** ${new Date(report.timestamp).toLocaleString()}`);
  lines.push('');
  lines.push(`## Consensus Answer`);
  lines.push(report.consensusAnswer);
  lines.push('');
  lines.push(`- **Consensus Score:** ${report.consensusScore}%`);
  lines.push(`- **Confidence Level:** ${report.confidenceLevel}`);
  lines.push('');
  lines.push('## Similarity Matrix Summary');
  lines.push(`- Average similarity: ${report.similaritySummary.averageSimilarity}%`);
  lines.push(`- Highest cluster score: ${report.similaritySummary.highestSimilarity}%`);
  lines.push(`- Lowest cluster score: ${report.similaritySummary.lowestSimilarity}%`);
  lines.push('');
  lines.push('## Semantic Clusters');
  report.clusters.forEach((cluster) => {
    lines.push(`### ${cluster.clusterLabel}`);
    lines.push(`- Confidence: ${cluster.confidenceLabel}`);
    lines.push(`- Consensus Score: ${cluster.consensusScore}%`);
    lines.push(`- Providers: ${cluster.memberProviders.join(', ')}`);
    lines.push('');
    lines.push('#### Representative Answer');
    lines.push(cluster.representativeAnswer);
    lines.push('');
  });
  lines.push('## Provider Metrics');
  lines.push('| Provider | Model | Status | Response Time | Words | Chars |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  report.providers.forEach((provider) => {
    lines.push(`| ${provider.providerName} | ${provider.modelName} | ${provider.status} | ${provider.responseTime} ms | ${provider.wordCount} | ${provider.charCount} |`);
  });
  lines.push('');
  lines.push('## Response Times');
  lines.push(`- Fastest: ${report.responseTimeSummary.fastest} ms`);
  lines.push(`- Slowest: ${report.responseTimeSummary.slowest} ms`);
  lines.push(`- Average: ${report.responseTimeSummary.average} ms`);
  lines.push('');
  lines.push('## Conclusion');
  lines.push(report.conclusion);
  lines.push('');
  lines.push('## Charts');
  lines.push('- Bar chart exported separately as PNG or SVG.');
  return lines.join('\n');
}

export function generateShareJson(report: ComparisonReport, session: CompareSession) {
  return JSON.stringify({ type: 'ai-consensus-compare-report', report, session }, null, 2);
}
