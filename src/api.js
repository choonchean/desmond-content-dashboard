const API_URL = import.meta.env.VITE_API_URL;

export async function fetchAllScripts() {
  const res = await fetch(`${API_URL}?action=getAll`);
  const data = await res.json();
  return data.scripts || [];
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
