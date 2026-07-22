import type { ComparisonReport } from './reportGenerator';

const STORAGE_KEY = 'ai-consensus-checker-exported-reports';

export function loadExportedReports(): ComparisonReport[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as ComparisonReport[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveExportedReport(report: ComparisonReport): ComparisonReport[] {
  const reports = loadExportedReports();
  const next = [report, ...reports].slice(0, 20);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteExportedReport(reportId: string): ComparisonReport[] {
  const reports = loadExportedReports();
  const next = reports.filter((report) => report.id !== reportId);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
