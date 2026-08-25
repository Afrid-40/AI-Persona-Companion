import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface MarkdownMessageProps {
  content: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split by code blocks ```lang ... ```
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed break-words font-sans">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const language = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() : '';
          const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);

          return (
            <div key={index} className="my-3 rounded-xl overflow-hidden border border-border/80 bg-[#12141a] shadow-lg">
              <div className="flex items-center justify-between px-4 py-1.5 bg-[#1a1d26] border-b border-border/50 text-xs text-text-secondary font-mono">
                <span className="flex items-center gap-1.5 uppercase font-semibold tracking-wider text-text-primary/70">
                  <Code className="w-3.5 h-3.5 text-primary" />
                  {language || 'code'}
                </span>
                <button
                  onClick={() => handleCopy(code, index)}
                  className="flex items-center gap-1 hover:text-text-primary transition-colors py-1 px-2 rounded hover:bg-surface"
                  title="Copy code"
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 text-sm font-mono overflow-x-auto text-emerald-300 leading-normal custom-scrollbar bg-[#0f1117]">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render formatted text lines
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) {
                return <div key={lineIdx} className="h-1.5" />;
              }

              // Headers
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={lineIdx} className="text-base font-bold text-text-primary mt-3 mb-1">
                    {formatInline(trimmed.slice(4))}
                  </h3>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={lineIdx} className="text-lg font-bold text-text-primary mt-4 mb-1.5 border-b border-border/40 pb-1">
                    {formatInline(trimmed.slice(3))}
                  </h2>
                );
              }
              if (trimmed.startsWith('# ')) {
                return (
                  <h1 key={lineIdx} className="text-xl font-extrabold text-text-primary mt-4 mb-2">
                    {formatInline(trimmed.slice(2))}
                  </h1>
                );
              }

              // Bullet points
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 ml-2 my-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-text-primary">{formatInline(trimmed.slice(2))}</span>
                  </div>
                );
              }

              // Numbered lists
              const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 ml-2 my-0.5">
                    <span className="font-semibold text-primary flex-shrink-0 text-sm">{numMatch[1]}.</span>
                    <span className="text-text-primary">{formatInline(numMatch[2])}</span>
                  </div>
                );
              }

              // Blockquotes
              if (trimmed.startsWith('> ')) {
                return (
                  <blockquote key={lineIdx} className="border-l-4 border-primary/60 pl-3.5 py-1 italic my-2 text-text-secondary bg-surface/30 rounded-r-lg">
                    {formatInline(trimmed.slice(2))}
                  </blockquote>
                );
              }

              // Normal paragraph
              return (
                <p key={lineIdx} className="text-text-primary leading-relaxed">
                  {formatInline(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper for inline bold, italic, and inline code formatting
function formatInline(text: string): React.ReactNode[] {
  // Regex to split by inline code `...`, bold **...**, italic *...*
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 mx-0.5 text-xs font-mono bg-surface-hover border border-border text-pink-400 rounded-md">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return (
        <em key={i} className="italic text-text-secondary">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}
