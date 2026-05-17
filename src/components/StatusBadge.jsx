const STATUS_STYLES = {
  Scripted: { bg: 'rgba(94,211,243,0.15)', border: 'rgba(94,211,243,0.3)', color: '#5ed3f3' },
  Filmed: { bg: 'rgba(255,159,67,0.15)', border: 'rgba(255,159,67,0.3)', color: '#ff9f43' },
  Edited: { bg: 'rgba(183,148,244,0.15)', border: 'rgba(183,148,244,0.3)', color: '#b794f4' },
  Posted: { bg: 'rgba(200,245,90,0.15)', border: 'rgba(200,245,90,0.3)', color: '#c8f55a' },
};

const STATUS_ORDER = ['Scripted', 'Filmed', 'Edited', 'Posted'];

export default function StatusBadge({ status, role, onUpdate }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Scripted;
  const currentIdx = STATUS_ORDER.indexOf(status);

  const canAdvance = () => {
    if (status === 'Posted') return false;
    if (role === 'talent' && status === 'Scripted') return true;
    if (role === 'admin') return true;
    return false;
  };

  const nextStatus = STATUS_ORDER[currentIdx + 1];

  return (
    <div className="flex items-center gap-2">
      <span
        className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.color }}
      >
        {status}
      </span>
      {canAdvance() && nextStatus && (
        <button
          onClick={() => onUpdate(nextStatus)}
          className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider cursor-pointer transition-opacity hover:opacity-80"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          → {nextStatus}
        </button>
      )}
    </div>
  );
}
