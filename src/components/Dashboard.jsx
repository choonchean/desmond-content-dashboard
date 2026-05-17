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
              const groupStatus = getGroupStatus(angleScripts);
              const statusColor = STATUS_COLORS[groupStatus];
              return (
                <div
                  key={topic}
                  className="p-5 rounded-xl cursor-pointer transition-all hover:scale-[1.01]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                  onClick={() => setViewingGroup(angleScripts)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{topic}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {angleScripts.map((s, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ background: STATUS_COLORS[s.status] }}
                            />
                            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{s.angle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shrink-0"
                      style={{
                        background: `${statusColor}22`,
                        border: `1px solid ${statusColor}55`,
                        color: statusColor,
                      }}
                    >
                      {groupStatus}
                    </span>
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
