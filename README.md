# basketTrainer

## Running with the server

Run in two terminals:

```bash
npm run server   # API on http://localhost:3001 (players + saved drills)
npm run dev      # frontend; /api is proxied to the server
```

Data is stored as JSON in `server/data/` (`players.json`, `drills.json`). On first run the
players file is seeded from `public/players.json`. All file access is in `server/storage.js`,
so moving to a database means re-implementing that file only.

API: `GET/POST /api/players`, `GET/POST /api/drills`, `DELETE /api/drills/:id`.
For a deployed frontend, set `VITE_API_URL` to the server's URL at build time.
