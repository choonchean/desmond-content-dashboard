import { useState } from 'react';

const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN;
const TALENT_PIN = import.meta.env.VITE_TALENT_PIN;

export default function PinGate({ onAuth }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onAuth('admin');
    } else if (pin === TALENT_PIN) {
      onAuth('talent');
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--green)' }}>
          Content Dashboard
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>@realdesmondong · IG Reels</p>
        <div>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="px-6 py-3 rounded-lg text-center text-lg font-mono tracking-widest outline-none"
            style={{
              background: 'var(--surface)',
              border: error ? '2px solid var(--red)' : '2px solid var(--border)',
              color: 'var(--text)',
              width: '240px',
            }}
            autoFocus
          />
          <button
            onClick={handleSubmit}
            className="block mx-auto mt-4 px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider cursor-pointer"
            style={{ background: 'var(--green)', color: 'var(--bg)' }}
          >
            Enter
          </button>
        </div>
        {error && <p className="mt-4 text-sm" style={{ color: 'var(--red)' }}>Wrong PIN</p>}
      </div>
    </div>
  );
}
