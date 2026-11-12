// Storage layer — currently JSON files under server/data/.
// To move to a database later, re-implement these functions with the same
// signatures (they are already async), and index.js does not need to change.
import fs from 'node:fs/promises';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const PLAYERS_FILE = path.join(DATA_DIR, 'players.json');
const DRILLS_FILE = path.join(DATA_DIR, 'drills.json');
const SEED_PLAYERS_FILE = path.join(__dirname, '..', 'public', 'players.json');

// First run: create the data folder and seed players from public/players.json.
mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(PLAYERS_FILE)) {
  writeFileSync(PLAYERS_FILE, existsSync(SEED_PLAYERS_FILE) ? readFileSync(SEED_PLAYERS_FILE, 'utf-8') : '[]\n');
}
if (!existsSync(DRILLS_FILE)) writeFileSync(DRILLS_FILE, '[]\n');

const readJson = async file => JSON.parse(await fs.readFile(file, 'utf-8'));

// Write to a temp file then rename, so a crash never leaves a half-written file.
const writeJson = async (file, data) => {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + '\n');
  await fs.rename(tmp, file);
};

// Serialize writes so two requests at once can't overwrite each other's changes.
let queue = Promise.resolve();
const withLock = fn => {
  const run = queue.then(fn);
  queue = run.catch(() => {});
  return run;
};

// ---------- Players ----------

export const getPlayers = () => readJson(PLAYERS_FILE);

/** Adds the player unless an identical one (name + position + team) exists. Returns the full list. */
export const addPlayer = player => withLock(async () => {
  const players = await readJson(PLAYERS_FILE);
  const exists = players.some(p =>
    p.name === player.name && p.position === player.position && p.team === player.team
  );
  if (!exists) {
    players.push(player);
    await writeJson(PLAYERS_FILE, players);
  }
  return { players, created: !exists };
});

// ---------- Drills ----------

export const getDrills = () => readJson(DRILLS_FILE);

/** Stores a drill and returns it with its generated id and timestamp. */
export const addDrill = drill => withLock(async () => {
  const saved = { id: `saved_${Date.now()}`, savedAt: new Date().toISOString(), ...drill };
  const drills = await readJson(DRILLS_FILE);
  drills.push(saved);
  await writeJson(DRILLS_FILE, drills);
  return saved;
});

/** Returns true if a drill was deleted. */
export const deleteDrill = id => withLock(async () => {
  const drills = await readJson(DRILLS_FILE);
  const remaining = drills.filter(d => d.id !== id);
  if (remaining.length === drills.length) return false;
  await writeJson(DRILLS_FILE, remaining);
  return true;
});
