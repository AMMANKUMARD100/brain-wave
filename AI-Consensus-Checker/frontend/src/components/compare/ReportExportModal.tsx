import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileText, Printer, Save, Share2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { CompareSession } from '../../types';
import {
  buildComparisonReport,
  generateMarkdownReport,
  generateReportFilename,
  generateShareJson,
  generateTxtReport,
  ComparisonReport,
} from '../../utils/reportGenerator';
import { deleteExportedReport, loadExportedReports, saveExportedReport } from '../../utils/reportStorage';

interface ReportExportModalProps {
  session: CompareSession;
  visible: boolean;
  onClose: () => void;
  onImportSession: (session: CompareSession) => void;
}

const textExportLabelMap = {
  txt: 'TXT',
  md: 'Markdown',
  pdf: 'PDF',
} as const;

export default function ReportExportModal({ session, visible, onClose, onImportSession }: ReportExportModalProps) {
  const [exporting, setExporting] = useState(false);
  const [selectedExport, setSelectedExport] = useState<'txt' | 'md' | 'pdf'>('txt');
  const [savedReports, setSavedReports] = useState<ComparisonReport[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const report = useMemo(() => buildComparisonReport(session), [session]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      let content: string;
      let filename: string;
      let blob: Blob;

      if (selectedExport === 'txt') {
        content = generateTxtReport(report);
        filename = generateReportFilename('ai-consensus-report', 'txt');
        blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      } else if (selectedExport === 'md') {
        content = generateMarkdownReport(report);
        filename = generateReportFilename('ai-consensus-report', 'md');
        blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      } else {
        const markdown = generateMarkdownReport(report);
        const printWindow = window.open('', '_blank', 'width=900,height=700');
        if (!printWindow) {
          throw new Error('Unable to open preview window.');
        }
        printWindow.document.write(`<!DOCTYPE html><html><head><title>${report.question}</title><style>body{font-family:system-ui, sans-serif;line-height:1.6;padding:24px;color:#111}h1,h2,h3{color:#111}pre{background:#f4f4f5;padding:16px;border-radius:12px;overflow:auto;}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:12px;border:1px solid #ddd;text-align:left}thead{background:#fafafa}</style></head><body><h1>AI Consensus Comparison Report</h1><pre>${markdown.replace(/</g, '&lt;')}</pre></body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
        setExporting(false);
        toast.success('PDF preview opened in a new window. Use print-to-PDF to export.');
        return;
      }

      downloadBlob(blob, filename);
      setSavedReports(saveExportedReport(report));
      toast.success(`${textExportLabelMap[selectedExport]} report exported successfully.`);
    } catch (error) {
      toast.error('Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  const handleShareJson = () => {
    const json = generateShareJson(report, session);
    const filename = generateReportFilename('ai-consensus-share', 'json');
    downloadBlob(new Blob([json], { type: 'application/json;charset=utf-8' }), filename);
    toast.success('Shareable JSON exported. You can import this file later.');
  };

  const handleLoadSavedReports = () => {
    setSavedReports(loadExportedReports());
  };

  const handleDeleteSavedReport = (reportId: string) => {
    setSavedReports(deleteExportedReport(reportId));
    toast.success('Saved report deleted.');
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const payload = JSON.parse(text) as { type: string; session?: unknown };
      if (payload.type !== 'ai-consensus-compare-report' || !payload.session) {
        throw new Error('Invalid report file.');
      }
      onImportSession(payload.session as CompareSession);
      toast.success('Comparison session imported successfully.');
    } catch (error) {
      toast.error('Unable to import report JSON.');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateTxtReport(report));
      toast.success('Entire report copied to clipboard.');
    } catch {
      toast.error('Unable to copy report.');
    }
  };

  useEffect(() => {
    if (visible) {
      handleLoadSavedReports();
    }
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 shadow-[0_40px_120px_rgba(0,0,0,0.55)]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">Report export</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Save and share comparison results</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-white/10 bg-slate-900/80 p-3 text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_auto]">
          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Export options</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(['txt', 'md', 'pdf'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedExport(option)}
                    className={`rounded-3xl border px-4 py-3 text-sm font-semibold uppercase tracking-[0.24em] transition ${selectedExport === option ? 'border-cyan-400 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-slate-950/90 text-slate-300 hover:border-cyan-400/30'}`}
                  >
                    {textExportLabelMap[option]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Copy features</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(session.providers[0]?.answer ?? '');
                    toast.success('Single AI answer copied.');
                  }}
                  className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40"
                >
                  Copy first AI answer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(buildComparisonReport(session).consensusAnswer);
                    toast.success('Consensus answer copied.');
                  }}
                  className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40"
                >
                  Copy consensus answer
                </button>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-200 hover:border-cyan-400/40"
                >
                  Copy entire report
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Share & restore</p>
              <p className="mt-3 text-sm text-slate-300">Export a JSON snapshot of the complete comparison session. Import it later to restore the report and results.</p>
              <button
                type="button"
                onClick={handleShareJson}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <Share2 className="h-4 w-4" />
                Export shareable JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={handleImportFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <FileText className="h-4 w-4" />
                Import JSON report
              </button>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Print support</p>
              <p className="mt-3 text-sm text-slate-300">Use the system print dialog to generate a clean PDF version of the report.</p>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-4 py-3 text-sm font-semibold text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <Printer className="h-4 w-4" />
                Print report
              </button>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Saved reports</p>
                  <p className="mt-2 text-sm text-slate-300">Stored locally in your browser for later download or deletion.</p>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSavedReports}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200 hover:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <Save className="h-4 w-4" />
                  Refresh
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {savedReports.length === 0 ? (
                  <p className="text-sm text-slate-400">No saved reports yet. Export a report to save it locally.</p>
                ) : (
                  savedReports.slice(0, 5).map((saved) => (
                    <div key={saved.id} className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-sm text-slate-200">
                      <div>
                        <p className="font-semibold text-white">{new Date(saved.createdAt).toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{saved.question}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedReport(saved.id)}
                        className="rounded-full border border-white/10 bg-rose-500/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-rose-200 hover:bg-rose-500/20 focus:outline-none focus:ring-2 focus:ring-rose-400"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-6 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Report summary</p>
              <p className="mt-2 text-sm text-slate-300">This export includes the original question, provider answers, consensus analysis, cluster summaries, and provider metrics.</p>
            </div>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting…' : `Export ${textExportLabelMap[selectedExport]}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
