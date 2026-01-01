import Database from 'better-sqlite3'

const dbPath = process.env.SQLITE_PATH || './wgs.sqlite'
export const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS watchlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT,
    address TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS payments (
    signature TEXT PRIMARY KEY,
    sender TEXT NOT NULL,
    recipient TEXT NOT NULL,
    amount_sol REAL NOT NULL,
    memo TEXT,
    is_donation BOOLEAN NOT NULL,
    user_id TEXT,
    service_name TEXT,
    duration TEXT,
    timestamp INTEGER NOT NULL,
    status TEXT NOT NULL
  );
`)

export function listWatchlist() {
  const rows = db.prepare('SELECT label, address FROM watchlist ORDER BY id DESC').all()
  return rows as { label: string | null; address: string }[]
}

export function addToWatchlist(address: string, label?: string) {
  db.prepare('INSERT OR IGNORE INTO watchlist (address, label) VALUES (?, ?)').run(address, label || null)
}

export function removeFromWatchlist(address: string) {
  db.prepare('DELETE FROM watchlist WHERE address = ?').run(address)
}





