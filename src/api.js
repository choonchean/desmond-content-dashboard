const API_URL = import.meta.env.VITE_API_URL;

function normalizeDate(raw) {
  if (!raw) return '';
  // Google Sheets returns dates as ISO timestamps — extract local YYYY-MM-DD
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw; // already a plain string or unparseable
  return d.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
}

export async function fetchAllScripts() {
  const res = await fetch(`${API_URL}?action=getAll`);
  const data = await res.json();
  return (data.scripts || []).map(s => ({ ...s, date: normalizeDate(s.date) }));
}

export async function updateScriptStatus(id, status) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateStatus', id, status }),
  });
  return res.json();
}

export async function addScripts(scripts) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'addScripts', scripts }),
  });
  return res.json();
}
