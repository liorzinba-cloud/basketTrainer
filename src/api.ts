import { TeamPlayerProfile, PlaybookDrill } from './types';

export type RosterPlayer = Omit<TeamPlayerProfile, 'id'>;
export type NewDrill = Pick<PlaybookDrill, 'name' | 'description' | 'frames' | 'team'>;

// Empty = same origin (in dev, Vite proxies /api to the Express server).
// For a deployed frontend set VITE_API_URL, e.g. https://my-server.example.com
const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  getPlayers: () => request<RosterPlayer[]>('/api/players'),
  addPlayer: (player: RosterPlayer) =>
    request<RosterPlayer[]>('/api/players', { method: 'POST', body: JSON.stringify(player) }),

  getDrills: () => request<PlaybookDrill[]>('/api/drills'),
  addDrill: (drill: NewDrill) =>
    request<PlaybookDrill>('/api/drills', { method: 'POST', body: JSON.stringify(drill) }),
  deleteDrill: (id: string) =>
    request<void>(`/api/drills/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
