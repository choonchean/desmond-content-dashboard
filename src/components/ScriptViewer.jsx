import { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function ScriptViewer({ script, role, onStatusUpdate, onClose }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const fullText = `${script.hook}\n\n${script.full_script}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = fullText;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="w-full max-w-2xl rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {/* Header */}
        <div className="p-6 flex justify-between items-start" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{script.angle}</p>
            <h2 className="text-lg font-medium" style={{ color: 'var(--green)' }}>{script.topic}</h2>
            <div className="mt-3">
              <StatusBadge status={script.status} role={role} onUpdate={(s) => onStatusUpdate(script.id, s)} />
            </div>
          </div>
          <button onClick={onClose} className="text-2xl cursor-pointer ml-4" style={{ color: 'var(--text-muted)' }}>✕</button>
        </div>

        {/* Hook */}
        <div className="mx-6 mt-6 p-4 rounded-lg" style={{ background: 'var(--bg)', borderLeft: '3px solid var(--green)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>Hook</p>
          <p className="italic text-base" style={{ color: 'var(--text)' }}>{script.hook}</p>
        </div>

        {/* Full Script */}
        <div className="p-6">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-dim)' }}>Full Script</p>
          <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
            {script.full_script}
          </div>
        </div>

        {/* Copy Button */}
        <div className="p-6 flex justify-end" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleCopy}
            className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
            style={{
              background: copied ? 'var(--green)' : 'var(--bg)',
              color: copied ? 'var(--bg)' : 'var(--text-muted)',
              border: copied ? '1px solid var(--green)' : '1px solid var(--border)',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy Script'}
          </button>
        </div>
      </div>
    </div>
  );
}
