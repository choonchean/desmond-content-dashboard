const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(offset = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) + offset * 7);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function isToday(d) {
  return formatDate(d) === formatDate(new Date());
}

export default function Calendar({ scripts, selectedDate, onSelectDate, weekOffset, onWeekChange }) {
  const dates = getWeekDates(weekOffset);

  const getScriptCount = (date) => {
    const dateStr = formatDate(date);
    return scripts.filter(s => s.date === dateStr).length;
  };

  const getStatusColor = (date) => {
    const dateStr = formatDate(date);
    const dayScripts = scripts.filter(s => s.date === dateStr);
    if (dayScripts.length === 0) return null;
    const allPosted = dayScripts.every(s => s.status === 'Posted');
    const anyFilmed = dayScripts.some(s => s.status === 'Filmed' || s.status === 'Edited');
    if (allPosted) return 'var(--green)';
    if (anyFilmed) return 'var(--orange)';
    return 'var(--cyan)';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          className="px-3 py-1 rounded text-sm cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          ← Prev
        </button>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
          {dates[0].toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })} — {dates[6].toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="px-3 py-1 rounded text-sm cursor-pointer"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((date, i) => {
          const count = getScriptCount(date);
          const statusColor = getStatusColor(date);
          const selected = selectedDate === formatDate(date);
          const today = isToday(date);

          return (
            <button
              key={i}
              onClick={() => onSelectDate(formatDate(date))}
              className="flex flex-col items-center py-3 rounded-lg cursor-pointer transition-all"
              style={{
                background: selected ? 'var(--green)' : 'var(--surface)',
                border: today && !selected ? '2px solid var(--green)' : '1px solid var(--border)',
                color: selected ? 'var(--bg)' : 'var(--text)',
              }}
            >
              <span className="text-xs font-semibold uppercase" style={{ color: selected ? 'var(--bg)' : 'var(--text-muted)' }}>
                {DAYS[i]}
              </span>
              <span className="text-lg font-bold mt-1">{date.getDate()}</span>
              {count > 0 && (
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: Math.min(count, 4) }, (_, j) => (
                    <div
                      key={j}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: selected ? 'var(--bg)' : statusColor }}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
