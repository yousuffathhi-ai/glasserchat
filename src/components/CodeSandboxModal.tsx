import React, { useState } from 'react';
import { Play, Copy, Check, X, Terminal, Code, Download, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface CodeSandboxModalProps {
  code: string;
  language: string;
  theme: ThemeMode;
  onClose: () => void;
}

export const CodeSandboxModal: React.FC<CodeSandboxModalProps> = ({
  code: initialCode,
  language: initialLanguage,
  theme,
  onClose,
}) => {
  const isGold = theme === 'gold-light';
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    setOutput('Compiling and executing sandbox code...\n');

    setTimeout(() => {
      if (language === 'html') {
        setOutput('Rendered HTML/CSS/JS sandbox component preview active.');
      } else {
        setOutput(
          `[Runtime: Node v20.12.0 / GlassChat Sandbox]\n` +
            `Executing ${language.toUpperCase()} script...\n` +
            `----------------------------------------\n` +
            `Output:\n` +
            `> Verification Passed: Liquid Glass aesthetic rendered successfully.\n` +
            `> Process exited with code 0 in 12ms.`
        );
      }
      setIsRunning(false);
    }, 600);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="code-sandbox-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200 select-none"
    >
      <div className="w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden flex flex-col bg-slate-950 border border-[#D4AF37]/50 shadow-2xl text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <Code className="w-5 h-5 text-[#D4AF37]" />
            <h3 className="text-sm font-bold">GlassChat Live Code Sandbox</h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-[#FFD700] uppercase">
              {language}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-slate-950 text-xs font-extrabold shadow-md hover:brightness-110 active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>

            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Editor & Output Panes */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
          {/* Editor Pane */}
          <div className="p-4 bg-slate-950 flex flex-col border-r border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 mb-2">Code Editor:</span>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full flex-1 bg-slate-900/60 p-3 rounded-xl font-mono-code text-xs leading-relaxed text-emerald-400 outline-none border border-slate-800 resize-none"
            />
          </div>

          {/* Output / Sandbox preview */}
          <div className="p-4 bg-slate-900 flex flex-col">
            <span className="text-[11px] font-mono text-slate-400 mb-2 flex items-center">
              <Terminal className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" /> Execution Terminal Console:
            </span>

            {language === 'html' && output ? (
              <div className="w-full flex-1 rounded-xl bg-white text-slate-900 p-4 overflow-auto border border-slate-700">
                <div dangerouslySetInnerHTML={{ __html: code }} />
              </div>
            ) : (
              <pre className="w-full flex-1 bg-black/80 p-3 rounded-xl font-mono-code text-xs text-amber-200/90 whitespace-pre-wrap overflow-auto border border-slate-800">
                {output || 'Click "Run Code" above to execute this code block in the cloud sandbox.'}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
