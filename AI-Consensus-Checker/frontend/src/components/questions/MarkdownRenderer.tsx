import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="my-4 scroll-mt-6 text-2xl font-semibold text-slate-100">{children}</h1>,
        h2: ({ children }) => <h2 className="my-3 text-xl font-semibold text-slate-100">{children}</h2>,
        h3: ({ children }) => <h3 className="my-2 text-lg font-semibold text-slate-100">{children}</h3>,
        p: ({ children }) => <p className="mb-3 text-sm leading-6 text-slate-300">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 ml-5 list-disc space-y-1 text-sm text-slate-300">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm text-slate-300">{children}</ol>,
        li: ({ children }) => <li className="text-sm leading-6 text-slate-300">{children}</li>,
        table: ({ children }) => <table className="mb-4 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 text-sm">{children}</table>,
        thead: ({ children }) => <thead className="bg-slate-900 text-slate-200">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-slate-800">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => <th className="border-slate-800 px-3 py-2 text-left text-xs uppercase tracking-wide text-slate-300">{children}</th>,
        td: ({ children }) => <td className="border-slate-800 px-3 py-2 text-sm text-slate-300">{children}</td>,
        code: ({ inline, children }: any) => (
          <code
            className={`rounded-xl border border-slate-700 px-2 py-1 font-mono text-sm ${inline ? 'bg-slate-950 text-slate-100' : 'block bg-slate-900 p-3 text-slate-100'}`}
          >
            {children}
          </code>
        ),
        pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{children}</pre>,
        em: ({ children }) => <em className="italic text-slate-200">{children}</em>,
        strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default memo(MarkdownRenderer);
