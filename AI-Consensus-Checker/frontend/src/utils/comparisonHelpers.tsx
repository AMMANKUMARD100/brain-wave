import type { CompareSession, CompareSessionProvider } from '../types';
import type { ReactNode } from 'react';

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'that', 'this', 'with', 'from', 'into', 'have', 'been', 'are', 'was', 'were',
  'has', 'had', 'but', 'not', 'can', 'would', 'could', 'should', 'your', 'their', 'there', 'then',
  'than', 'them', 'they', 'what', 'when', 'where', 'why', 'how', 'which', 'while', 'about', 'other', 'more',
  'also', 'some', 'such', 'each', 'many', 'most', 'over', 'after', 'before', 'between', 'through', 'using',
  'use', 'uses', 'used', 'its', "it's", 'any', 'all', 'one', 'two', 'three', 'four', 'five', 'six', 'seven',
  'eight', 'nine', 'ten', 'because', 'recommend', 'recommendation', 'approach', 'strategy', 'model', 'answer',
  'response', 'responses', 'provider', 'providers', 'similarity', 'cluster', 'consensus', 'score', 'reasoning',
]);

export type ConfidenceLevel = 'Very Strong' | 'Strong' | 'Moderate' | 'Weak';
export type SortKey =
  | 'highestConsensus'
  | 'lowestConsensus'
  | 'fastestResponse'
  | 'longestAnswer'
  | 'shortestAnswer'
  | 'highestSimilarity'
  | 'providerName';
export type SortDirection = 'asc' | 'desc';

export interface FilterState {
  searchTerm: string;
  selectedProviders: string[];
  consensusRange: [number, number];
  responseTimeRange: [number, number];
  clusterSizeRange: [number, number];
  confidenceLevels: ConfidenceLevel[];
  status: 'all' | 'success' | 'error';
}

export interface ProviderCompareRow extends CompareSessionProvider {
  wordCount: number;
  charCount: number;
  answerLength: number;
  averageSimilarity: number;
  consensusScore: number;
  confidenceLabel: ConfidenceLevel;
  clusterId: string;
  clusterLabel: string;
  clusterSize: number;
  representativeAnswer: string;
  clusterMembers: string[];
}

export interface ComparisonSummary {
  totalQuestions: number;
  totalClusters: number;
  highestConsensus: number;
  averageSimilarity: number;
  averageResponseTime: number;
  failedProviders: number;
  questionMatchesSearch: boolean;
}

export interface ComparisonPairAnalysis {
  matchingConcepts: string[];
  leftOnly: string[];
  rightOnly: string[];
  contradictions: string[];
}

function normalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
    .replace(/[^a-z0-9'\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function answerSimilarity(a: string, b: string) {
  const aTokens = new Set(tokenize(a));
  const bTokens = new Set(tokenize(b));
  if (aTokens.size === 0 || bTokens.size === 0) {
    return 0;
  }

  const intersection = Array.from(aTokens).filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function areAnswersSimilar(a: string, b: string) {
  return answerSimilarity(a, b) >= 0.45;
}

function extractKeywords(text: string, limit = 10) {
  const tokens = tokenize(text);
  const counts = tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] ?? 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

function findContradictions(answer: string) {
  const normalized = normalizeText(answer);
  const negations = ['not', 'never', 'avoid', "don't", 'without', 'instead', 'unless'];
  const contradictions = new Set<string>();

  negations.forEach((negation) => {
    const pattern = new RegExp(`\\b${negation}\\s+([a-z0-9']+)`, 'g');
    let match: RegExpExecArray | null = null;
    while ((match = pattern.exec(normalized))) {
      contradictions.add(match[1]);
    }
  });

  return Array.from(contradictions);
}

export function highlightText(text: string, terms: string[]) {
  if (!terms.length) {
    return [text];
  }

  const pattern = new RegExp(terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
  const parts = text.split(pattern);
  const matches = text.match(pattern) || [];
  const output: ReactNode[] = [];

  parts.forEach((part, index) => {
    output.push(part);
    if (matches[index]) {
      output.push(
        <mark key={`${part}-${index}`} className="rounded-sm bg-cyan-400/20 px-1 text-cyan-200">
          {matches[index]}
        </mark>,
      );
    }
  });

  return output;
}

export function buildProviderRows(session: CompareSession) {
  const clusters: Array<{ clusterId: string; clusterLabel: string; members: CompareSessionProvider[]; representativeAnswer: string }> = [];

  session.providers.forEach((provider) => {
    const match = clusters.find((cluster) => areAnswersSimilar(cluster.representativeAnswer, provider.answer));
    if (match) {
      match.members.push(provider);
    } else {
      clusters.push({
        clusterId: `cluster-${clusters.length + 1}`,
        clusterLabel: `Cluster ${clusters.length + 1}`,
        representativeAnswer: provider.answer,
        members: [provider],
      });
    }
  });

  const totalProviders = session.providers.length;
  const rows: ProviderCompareRow[] = [];

  clusters.forEach((cluster) => {
    const clusterSize = cluster.members.length;
    const consensusScore = Math.round((clusterSize / totalProviders) * 100);
    const confidenceLabel: ConfidenceLevel =
      consensusScore >= 80 ? 'Very Strong' : consensusScore >= 60 ? 'Strong' : consensusScore >= 35 ? 'Moderate' : 'Weak';

    cluster.members.forEach((member) => {
      const wordCount = member.answer.trim().split(/\s+/).filter(Boolean).length;
      const charCount = member.answer.length;
      const answerLength = charCount;
      const similaritySum = cluster.members.reduce((sum, other) => sum + answerSimilarity(member.answer, other.answer), 0);
      const averageSimilarity = cluster.members.length > 1 ? Number(((similaritySum / cluster.members.length) * 100).toFixed(1)) : 0;

      rows.push({
        ...member,
        wordCount,
        charCount,
        answerLength,
        averageSimilarity,
        consensusScore,
        confidenceLabel,
        clusterId: cluster.clusterId,
        clusterLabel: cluster.clusterLabel,
        clusterSize,
        representativeAnswer: cluster.representativeAnswer,
        clusterMembers: cluster.members.map((item) => item.providerName),
      });
    });
  });

  return { rows, clusters };
}

export function filterProviderRows(
  rows: ProviderCompareRow[],
  filters: FilterState,
  question: string,
) {
  const search = filters.searchTerm.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesProvider = filters.selectedProviders.length === 0 || filters.selectedProviders.includes(row.providerName);
    if (!matchesProvider) {
      return false;
    }

    const matchesStatus = filters.status === 'all' || row.status === filters.status;
    if (!matchesStatus) {
      return false;
    }

    if (row.consensusScore < filters.consensusRange[0] || row.consensusScore > filters.consensusRange[1]) {
      return false;
    }

    if (row.responseTime < filters.responseTimeRange[0] || row.responseTime > filters.responseTimeRange[1]) {
      return false;
    }

    if (row.clusterSize < filters.clusterSizeRange[0] || row.clusterSize > filters.clusterSizeRange[1]) {
      return false;
    }

    if (filters.confidenceLevels.length > 0 && !filters.confidenceLevels.includes(row.confidenceLabel)) {
      return false;
    }

    if (!search) {
      return true;
    }

    const questionMatches = normalizeText(question).includes(search);
    if (questionMatches) {
      return true;
    }

    const haystack = [
      row.providerName,
      row.modelName,
      row.answer,
      row.representativeAnswer,
      row.clusterMembers.join(' '),
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortProviderRows(rows: ProviderCompareRow[], key: SortKey, direction: SortDirection) {
  const sorted = [...rows];
  sorted.sort((a, b) => {
    let comparison = 0;
    switch (key) {
      case 'highestConsensus':
        comparison = a.consensusScore - b.consensusScore;
        break;
      case 'lowestConsensus':
        comparison = b.consensusScore - a.consensusScore;
        break;
      case 'fastestResponse':
        comparison = b.responseTime - a.responseTime;
        break;
      case 'longestAnswer':
        comparison = a.answerLength - b.answerLength;
        break;
      case 'shortestAnswer':
        comparison = b.answerLength - a.answerLength;
        break;
      case 'highestSimilarity':
        comparison = a.averageSimilarity - b.averageSimilarity;
        break;
      case 'providerName':
        comparison = a.providerName.localeCompare(b.providerName);
        break;
      default:
        comparison = 0;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

export function buildComparisonSummary(
  session: CompareSession,
  rows: ProviderCompareRow[],
  questionSearch: string,
): ComparisonSummary {
  const questionMatchesSearch = questionSearch.trim().length > 0 && normalizeText(session.question).includes(questionSearch.trim().toLowerCase());
  const averageSimilarity = rows.length === 0 ? 0 : Number((rows.reduce((sum, row) => sum + row.averageSimilarity, 0) / rows.length).toFixed(1));
  const averageResponseTime = rows.length === 0 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.responseTime, 0) / rows.length);
  const highestConsensus = rows.length === 0 ? 0 : Math.max(...rows.map((row) => row.consensusScore));
  const failedProviders = rows.filter((row) => row.status === 'error').length;
  return {
    totalQuestions: 1,
    totalClusters: new Set(rows.map((row) => row.clusterId)).size,
    highestConsensus,
    averageSimilarity,
    averageResponseTime,
    failedProviders,
    questionMatchesSearch,
  };
}

export function compareAnswerPairs(left: ProviderCompareRow, right: ProviderCompareRow): ComparisonPairAnalysis {
  const leftConcepts = new Set(extractKeywords(left.answer, 12));
  const rightConcepts = new Set(extractKeywords(right.answer, 12));
  const matchingConcepts = Array.from(leftConcepts).filter((keyword) => rightConcepts.has(keyword));
  const leftOnly = Array.from(leftConcepts).filter((keyword) => !rightConcepts.has(keyword));
  const rightOnly = Array.from(rightConcepts).filter((keyword) => !leftConcepts.has(keyword));
  const contradictions = Array.from(new Set([...findContradictions(left.answer), ...findContradictions(right.answer)]));

  return {
    matchingConcepts: matchingConcepts.slice(0, 10),
    leftOnly: leftOnly.slice(0, 8),
    rightOnly: rightOnly.slice(0, 8),
    contradictions: contradictions.slice(0, 6),
  };
}
