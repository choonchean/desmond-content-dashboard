import { useState, useEffect } from 'react';
import { fetchAllScripts, updateScriptStatus } from '../api';
import Calendar from './Calendar';
import ScriptViewer from './ScriptViewer';

export default function Dashboard({ role }) {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewingGroup, setViewingGroup] = useState(null); // array of scripts for one topic

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
    if (viewingGroup) {
      setViewingGroup(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
    }
    await updateScriptStatus(id, newStatus);
  };

  const dayScripts = scripts.filter(s => s.date === selectedDate);

  // Group by topic
  const topicGroups = dayScripts.reduce((acc, script) => {
    if (!acc[script.topic]) acc[script.topic] = [];
    acc[script.topic].push(script);
    return acc;
  }, {});
  const groupedList = Object.entries(topicGroups); // [[topic, [scripts...]], ...]

  const STATUS_ORDER = ['Scripted', 'Filmed', 'Edited', 'Posted'];

  const getGroupStatus = (scripts) => {
    // Show the lowest status across all angles (bottleneck)
    const minIdx = Math.min(...scripts.map(s => STATUS_ORDER.indexOf(s.status)));
    return STATUS_ORDER[minIdx] || 'Scripted';
  };

  const STATUS_COLORS = {
    Scripted: '#5ed3f3',
    Filmed: '#ff9f43',
    Edited: '#b794f4',
    Posted: '#c8f55a',
  };

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

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', month: 'short', day: 'numeric' })}
          </h2>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {groupedList.length} topic{groupedList.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-dim)' }}>Loading...</div>
        ) : groupedList.length === 0 ? (
          <div className="text-center py-12 rounded-xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-lg mb-1" style={{ color: 'var(--text-dim)' }}>No scripts for this day</p>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {role === 'admin' ? 'Push approved scripts from Claude' : 'Check back soon — Jun is cooking'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedList.map(([topic, angleScripts]) => {
              return (
                <div
                  key={topic}
                  className="p-5 rounded-xl"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  {/* Topic header */}
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{topic}</p>
                    <button
                      onClick={() => setViewingGroup(angleScripts)}
                      className="text-xs px-3 py-1 rounded-lg cursor-pointer shrink-0"
                      style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                    >
                      Read →
                    </button>
                  </div>

                  {/* Per-angle status rows */}
                  <div className="space-y-2">
                    {angleScripts.map((s) => {
                      const currentIdx = STATUS_ORDER.indexOf(s.status);
                      const sColor = STATUS_COLORS[s.status];
                      const canAdvance = s.status !== 'Posted' && (role === 'admin' || (role === 'talent' && s.status === 'Scripted'));
                      const canGoBack = currentIdx > 0 && (role === 'admin' || (role === 'talent' && s.status === 'Filmed'));
                      return (
                        <div key={s.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: sColor }} />
                          <span className="text-xs flex-1" style={{ color: 'var(--text-dim)' }}>{s.angle}</span>
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            {canGoBack && (
                              <button
                                onClick={() => handleStatusUpdate(s.id, STATUS_ORDER[currentIdx - 1])}
                                className="px-2 py-0.5 rounded text-xs cursor-pointer"
                                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                              >
                                ←
                              </button>
                            )}
                            <span
                              className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider"
                              style={{ background: `${sColor}22`, border: `1px solid ${sColor}55`, color: sColor }}
                            >
                              {s.status}
                            </span>
                            {canAdvance && (
                              <button
                                onClick={() => handleStatusUpdate(s.id, STATUS_ORDER[currentIdx + 1])}
                                className="px-2 py-0.5 rounded text-xs cursor-pointer"
                                style={{ background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
                              >
                                →
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {viewingGroup && (
        <ScriptViewer
          scripts={viewingGroup}
          role={role}
          onStatusUpdate={handleStatusUpdate}
          onClose={() => setViewingGroup(null)}
        />
      )}
    </div>
  );
}
