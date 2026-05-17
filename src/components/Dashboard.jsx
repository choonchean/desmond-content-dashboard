import { useState, useEffect } from 'react';
import { fetchAllScripts, updateScriptStatus } from '../api';
import Calendar from './Calendar';
import ScriptViewer from './ScriptViewer';
import StatusBadge from './StatusBadge';

export default function Dashboard({ role }) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewingScript, setViewingScript] = useState(null);

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllScripts();
      setScripts(data);
    } catch (err) {
      console.error('Failed to load scripts:', err);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id, newStatus) => {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (viewingScript && viewingScript.id === id) {
      setViewingScript(prev => ({ ...prev, status: newStatus }));
    }
    await updateScriptStatus(id, newStatus);
  };

  const dayScripts = scripts.filter(s => s.date === selectedDate);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-6 py-4" style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
              <span style={{ color: 'var(--green)' }}>D</span>esmond · Content
            </h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
              {role === 'admin' ? '🔑 Admin' : '🎬 Talent'} · @realdesmondong
            </p>
          </div>
          <button
            onClick={loadScripts}
            className="px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <Calendar
          scripts={scripts}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          weekOffset={weekOffset}
          onWeekChange={setWeekOffset}
        />

        {/* Day Scripts */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {dayScripts.length} script{dayScripts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-dim)' }}>Loading...</div>
        ) : dayScripts.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-lg mb-1" style={{ color: 'var(--text-dim)' }}>No scripts for this day</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {role === 'admin' ? 'Push approved scripts from Claude' : 'Check back soon — Jun is cooking'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayScripts.map(script => (
              <div
                key={script.id}
                className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                onClick={() => setViewingScript(script)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-dim)' }}>
                      {script.angle}
                    </p>
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {script.hook}
                    </p>
                  </div>
                  <StatusBadge
                    status={script.status}
                    role={role}
                    onUpdate={(s) => {
                      event.stopPropagation();
                      handleStatusUpdate(script.id, s);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Script Viewer Modal */}
      {viewingScript && (
        <ScriptViewer
          script={viewingScript}
          role={role}
          onStatusUpdate={handleStatusUpdate}
          onClose={() => setViewingScript(null)}
        />
      )}
    </div>
  );
}
