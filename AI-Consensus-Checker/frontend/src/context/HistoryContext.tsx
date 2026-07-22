import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { buildHistoryEntry, clearHistory as clearStorage, deleteHistoryEntry, loadHistory } from '../utils/historyStorage';
import type { QuestionResponse } from '../types';

export interface HistoryEntry {
  id: string;
  question: string;
  submittedAt: string;
  modelsUsed: string[];
  consensusAvailable: boolean;
  responseCount: number;
  averageResponseTime: number;
}

interface HistoryContextValue {
  historyEntries: HistoryEntry[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  addEntry: (question: string, response: QuestionResponse) => void;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
  filteredEntries: HistoryEntry[];
}

const HistoryContext = createContext<HistoryContextValue | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setHistoryEntries(loadHistory());
  }, []);

  const addEntry = (question: string, response: QuestionResponse) => {
    const entry = buildHistoryEntry(question, response);
    setHistoryEntries((current) => {
      const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 20);
      localStorage.setItem('ai-consensus-checker-history', JSON.stringify(next));
      return next;
    });
  };

  const deleteEntryById = (id: string) => {
    const next = deleteHistoryEntry(id);
    setHistoryEntries(next);
  };

  const clearAll = () => {
    setHistoryEntries(clearStorage());
  };

  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return historyEntries;

    const lower = searchTerm.trim().toLowerCase();
    return historyEntries.filter(
      (entry) =>
        entry.question.toLowerCase().includes(lower) ||
        entry.modelsUsed.some((model) => model.toLowerCase().includes(lower)),
    );
  }, [historyEntries, searchTerm]);

  return (
    <HistoryContext.Provider
      value={{ historyEntries, searchTerm, setSearchTerm, addEntry, deleteEntry: deleteEntryById, clearAll, filteredEntries }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryContext() {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used inside HistoryProvider');
  }
  return context;
}
