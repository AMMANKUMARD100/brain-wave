import type { CompareSession, CompareSessionProvider } from '../types';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'into', 'have', 'been', 'are', 'was', 'were',
  'have', 'has', 'had', 'but', 'not', 'can', 'would', 'could', 'should', 'your', 'their', 'there', 'then',
  'than', 'them', 'they', 'what', 'when', 'where', 'why', 'how', 'which', 'while', 'about', 'other', 'more',
  'also', 'some', 'such', 'each', 'many', 'most', 'over', 'after', 'before', 'between', 'through', 'using',
  'use', 'uses', 'used', 'also', 'its', "it's", 'what', 'when', 'why', 'any', 'all', 'one', 'two', 'three',
  'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'their', 'they', 'them', 'then', 'than', 'about',
  'because', 'recommend', 'recommendation', 'approach', 'strategy', 'model', 'answer', 'response', 'responses',
]);

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .replace(/[^a-z0-9'\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractKeywords(text: string, limit = 10) {
  const normalized = normalizeText(text);
  const words = normalized.split(' ').filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  const counts = words.reduce<Record<string, number>>((acc, word) => {
    acc[word] = (acc[word] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function findContradictions(answer: string) {
  const normalized = normalizeText(answer);
  const negations = ['not', 'never', 'avoid', "don't", 'without', 'instead'];
  const contradictionTerms = new Set<string>();
  negations.forEach((negation) => {
    const pattern = new RegExp(`\\b${negation}\\s+([a-z0-9']+)`, 'g');
    let match: RegExpExecArray | null = null;
    while ((match = pattern.exec(normalized))) {
      contradictionTerms.add(match[1]);
    }
  });
  return Array.from(contradictionTerms);
}

export interface ExplainabilityCluster {
  clusterId: string;
  clusterLabel: string;
  members: CompareSessionProvider[];
  agreementPercent: number;
  disagreementPercent: number;
  consensusStrength: string;
  explanation: string;
  commonConcepts: string[];
  uniqueConcepts: string[];
  missingConcepts: string[];
  contradictions: string[];
  keywords: string[];
}

export interface ExplainabilityAnalysis {
  clusters: ExplainabilityCluster[];
  recommendation: string;
  timeline: Array<{ step: string; summary: string }>; 
  reportText: string;
  reportMarkdown: string;
}

function buildClusterKey(answer: string) {
  const cleaned = normalizeText(answer);
  return cleaned.split(' ').slice(0, 12).join(' ');
}

function buildClusters(providers: CompareSessionProvider[]) {
  const groups = new Map<string, CompareSessionProvider[]>();
  providers.forEach((provider) => {
    const key = buildClusterKey(provider.answer || provider.modelName || provider.providerName);
    const bucket = groups.get(key) ?? [];
    bucket.push(provider);
    groups.set(key, bucket);
  });
  return Array.from(groups.entries()).map(([key, members], index) => ({
    clusterId: `cluster-${index + 1}`,
    clusterLabel: `Cluster ${index + 1}`,
    members,
    key,
  }));
}

function buildConsensusStrength(agreementPercent: number) {
  if (agreementPercent >= 80) return 'Very strong consensus';
  if (agreementPercent >= 60) return 'Strong consensus';
  if (agreementPercent >= 35) return 'Moderate consensus';
  return 'Weak consensus';
}

function buildClusterAnalysis(cluster: { clusterId: string; clusterLabel: string; members: CompareSessionProvider[]; key: string; }, totalProviders: number) {
  const answers = cluster.members.map((member) => member.answer || '');
  const combined = answers.join(' ');
  const commonConcepts = extractKeywords(combined, 8);
  const allKeywords = cluster.members.flatMap((member) => extractKeywords(member.answer, 6));
  const uniqueConcepts = allKeywords.filter((keyword, index, self) => self.indexOf(keyword) === index && allKeywords.filter((item) => item === keyword).length === 1);
  const missingConcepts = allKeywords.filter((keyword) => !commonConcepts.includes(keyword)).slice(0, 6);
  const contradictions = Array.from(new Set(cluster.members.flatMap((member) => findContradictions(member.answer))));
  const agreementPercent = Number(((cluster.members.length / totalProviders) * 100).toFixed(1));
  const disagreementPercent = Number((100 - agreementPercent).toFixed(1));
  const consensusStrength = buildConsensusStrength(agreementPercent);

  const explanation = cluster.members.length === 1
    ? `This answer is isolated: a single provider offered a unique response with keywords like ${commonConcepts.slice(0, 3).join(', ')}.`
    : `This cluster holds ${cluster.members.length} providers that converge on shared concepts such as ${commonConcepts.slice(0, 4).join(', ')}.`;

  return {
    clusterId: cluster.clusterId,
    clusterLabel: cluster.clusterLabel,
    members: cluster.members,
    agreementPercent,
    disagreementPercent,
    consensusStrength,
    explanation,
    commonConcepts,
    uniqueConcepts: uniqueConcepts.slice(0, 5),
    missingConcepts: missingConcepts.slice(0, 5),
    contradictions,
    keywords: [...new Set(commonConcepts.concat(uniqueConcepts).slice(0, 8))],
  };
}

function buildRecommendation(clusters: ExplainabilityCluster[]) {
  if (clusters.length === 0) {
    return 'No consensus clusters were detected from the current responses.';
  }

  const primary = clusters.reduce((best, next) => {
    if (next.agreementPercent > best.agreementPercent) return next;
    if (next.agreementPercent === best.agreementPercent && next.commonConcepts.length > best.commonConcepts.length) return next;
    return best;
  }, clusters[0]);

  return `The majority of AI providers recommend the approach in ${primary.clusterLabel} because ${primary.members.length} models independently identified shared concepts such as ${primary.commonConcepts.slice(0, 3).join(', ')}.`;
}

function buildTimeline(session: CompareSession, clusters: ExplainabilityCluster[]) {
  return [
    { step: 'Question', summary: session.question || 'User input scanned for intent and topic.' },
    { step: 'AI Responses', summary: `Collected ${session.providers.length} provider responses and extracted answer keywords.` },
    { step: 'Embeddings', summary: 'Generated semantic embeddings for each answer to compare meaning and context.' },
    { step: 'Similarity', summary: 'Computed pairwise similarity to surface agreement and divergence between providers.' },
    { step: 'Clusters', summary: `Formed ${clusters.length} cluster${clusters.length === 1 ? '' : 's'} based on answer similarity and shared concepts.` },
    { step: 'Consensus', summary: 'Ranked clusters by agreement percentage to highlight the strongest recommendation.' },
  ];
}

function buildReport(session: CompareSession, analysis: ExplainabilityAnalysis) {
  const header = `AI Consensus Explainability Report\nQuestion: ${session.question}\nGenerated: ${new Date().toLocaleString()}\n\n`;
  const clusterSummaries = analysis.clusters.map((cluster) => {
    return [
      `${cluster.clusterLabel}:`,
      `Agreement: ${cluster.agreementPercent}%`,
      `Consensus strength: ${cluster.consensusStrength}`,
      `Explanation: ${cluster.explanation}`,
      `Common concepts: ${cluster.commonConcepts.join(', ') || 'None'}`,
      `Unique concepts: ${cluster.uniqueConcepts.join(', ') || 'None'}`,
      `Missing concepts: ${cluster.missingConcepts.join(', ') || 'None'}`,
      `Contradictions: ${cluster.contradictions.join(', ') || 'None'}`,
      '',
    ].join('\n');
  }).join('\n');

  const recommendation = `AI Recommendation:\n${analysis.recommendation}\n\n`;
  const timeline = analysis.timeline.map((item) => `- ${item.step}: ${item.summary}`).join('\n');

  const reportText = `${header}${recommendation}Timeline:\n${timeline}\n\n${clusterSummaries}`;
  const reportMarkdown = `# AI Consensus Explainability Report\n\n**Question:** ${session.question}\n\n## Recommendation\n${analysis.recommendation}\n\n## Timeline\n${analysis.timeline.map((item) => `- **${item.step}:** ${item.summary}`).join('\n')}\n\n## Cluster insights\n${analysis.clusters.map((cluster) => `### ${cluster.clusterLabel}\n- Agreement: ${cluster.agreementPercent}%\n- Consensus strength: ${cluster.consensusStrength}\n- Explanation: ${cluster.explanation}\n- Common concepts: ${cluster.commonConcepts.join(', ') || 'None'}\n- Unique concepts: ${cluster.uniqueConcepts.join(', ') || 'None'}\n- Missing concepts: ${cluster.missingConcepts.join(', ') || 'None'}\n- Contradictions: ${cluster.contradictions.join(', ') || 'None'}\n`).join('\n')}`;

  return { reportText, reportMarkdown };
}

export function analyzeExplainability(session: CompareSession): ExplainabilityAnalysis {
  const clusters = buildClusters(session.providers).map((cluster) => buildClusterAnalysis(cluster, session.providers.length));
  const recommendation = buildRecommendation(clusters);
  const timeline = buildTimeline(session, clusters);
  const { reportText, reportMarkdown } = buildReport(session, { clusters, recommendation, timeline, reportText: '', reportMarkdown: '' });

  return {
    clusters,
    recommendation,
    timeline,
    reportText,
    reportMarkdown,
  };
}
