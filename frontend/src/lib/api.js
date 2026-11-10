import { API_URL } from './util.js';

export async function api(caminho, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(API_URL + caminho, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw new Error('Sem ligação à API.');
  }
  if (!res.ok) {
    let msg = `Erro ${res.status}.`;
    try { msg = (await res.json()).erro || msg; } catch { /* resposta sem JSON */ }
    throw new Error(msg);
  }
  return res.json();
}
