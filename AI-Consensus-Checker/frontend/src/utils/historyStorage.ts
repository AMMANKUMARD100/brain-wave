import type { QuestionResponse } from '../types';
import { getAnswerMetrics } from './answerMetrics';

export interface HistoryEntry {
  id: string;
  question: string;
  submittedAt: string;
  modelsUsed: string[];
  consensusAvailable: boolean;
  responseCount: number;
  averageResponseTime: number;
}

const STORAGE_KEY = 'ai-consensus-checker-history';

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 20)));
}

export function buildHistoryEntry(question: string, response: QuestionResponse): HistoryEntry {
  const modelsUsed = response.responses.map((item) => item.model);
  const successfulResponses = response.responses.filter((item) => Boolean(item.answer.trim()));
  const averageResponseTime = successfulResponses.length
    ?
        successfulResponses
          .map((item) => getAnswerMetrics(item.answer).responseTime)
          .reduce((sum, time) => sum + time, 0) / successfulResponses.length
    : 0;

  return {
    id: `${Date.now()}-${question.slice(0, 16).replace(/[^a-zA-Z0-9]/g, '_')}`,
    question,
    submittedAt: new Date().toISOString(),
    modelsUsed,
    consensusAvailable: Boolean(response.consensus),
    responseCount: response.responses.length,
    averageResponseTime: Number(averageResponseTime.toFixed(2)),
  };
}

export function deleteHistoryEntry(id: string) {
  const entries = loadHistory().filter((entry) => entry.id !== id);
  saveHistory(entries);
  return entries;
}

export function clearHistory() {
  saveHistory([]);
  return [];
}
