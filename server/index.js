// Basketball Trainer API server.
//   npm run server   ->  http://localhost:3001
// Persistence lives in ./storage.js (JSON files today, a database later).
import express from 'express';
import * as storage from './storage.js';

const PORT = Number(process.env.PORT) || 3001;
const POSITIONS = ['PG', 'SG', 'SF', 'PF', 'C', 'Def'];
const TEAMS = ['offense', 'defense'];

const app = express();
app.use(express.json({ limit: '5mb' }));

// Allow the frontend to call the API from another origin (e.g. GitHub Pages).
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// ---------- Players ----------

app.get('/api/players', async (req, res) => {
  res.json(await storage.getPlayers());
});

app.post('/api/players', async (req, res) => {
  const { name, height, position, team } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || typeof height !== 'string' ||
      !POSITIONS.includes(position) || !TEAMS.includes(team)) {
    return res.status(400).json({ error: 'name, height, position and team are required' });
  }
  const { players, created } = await storage.addPlayer({ name: name.trim(), height, position, team });
  res.status(created ? 201 : 200).json(players);
});

// ---------- Drills ----------

app.get('/api/drills', async (req, res) => {
  res.json(await storage.getDrills());
});

app.post('/api/drills', async (req, res) => {
  const { name, description, frames, team } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || !Array.isArray(frames) || frames.length === 0) {
    return res.status(400).json({ error: 'name and at least one frame are required' });
  }
  const drill = await storage.addDrill({
    name: name.trim(),
    description: typeof description === 'string' ? description : '',
    team: Array.isArray(team) ? team : [],
    frames,
  });
  res.status(201).json(drill);
});

app.delete('/api/drills/:id', async (req, res) => {
  const deleted = await storage.deleteDrill(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'drill not found' });
  res.sendStatus(204);
});

// Any unexpected error -> JSON 500 instead of crashing the server.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

app.listen(PORT, () => {
  console.log(`🏀 Basketball Trainer API running on http://localhost:${PORT}`);
});
