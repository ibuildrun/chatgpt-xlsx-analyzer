import { Database } from 'bun:sqlite';
import { SCHEMA, DROP_SCHEMA } from './schema';

export function runMigrations(db: Database): void {
  console.log('[DB] Running migrations...');
  db.exec(SCHEMA);
  console.log('[DB] Migrations complete.');
}

export function resetDatabase(db: Database): void {
  console.log('[DB] Resetting database...');
  db.exec(DROP_SCHEMA);
  db.exec(SCHEMA);
  console.log('[DB] Database reset complete.');
}

// CLI entry point for migrations
if (import.meta.main) {
  const args = process.argv.slice(2);
  const dbPath = args[0] || 'data/chat.db';
  const action = args[1] || 'migrate';
  
  const db = new Database(dbPath, { create: true });
  
  if (action === 'reset') {
    resetDatabase(db);
  } else {
    runMigrations(db);
  }
  
  db.close();
}
