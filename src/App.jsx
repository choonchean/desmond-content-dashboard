import { useState, useEffect } from 'react';
import PinGate from './components/PinGate';
import Dashboard from './components/Dashboard';

export default function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_role');
    if (saved) setRole(saved);
  }, []);

  const handleAuth = (r) => {
    setRole(r);
    localStorage.setItem('dashboard_role', r);
  };

  if (!role) return <PinGate onAuth={handleAuth} />;
  return <Dashboard role={role} />;
}
