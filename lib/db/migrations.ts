import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const THREADS_FILE = path.join(DATA_DIR, 'threads.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

export function runMigrations(): void {
  console.log('[DB] Running migrations...');
  
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(THREADS_FILE)) {
    fs.writeFileSync(THREADS_FILE, '[]');
  }
  
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, '[]');
  }
  
  console.log('[DB] Migrations complete.');
}

export function resetDatabase(): void {
  console.log('[DB] Resetting database...');
  
  if (fs.existsSync(THREADS_FILE)) {
    fs.unlinkSync(THREADS_FILE);
  }
  
  if (fs.existsSync(MESSAGES_FILE)) {
    fs.unlinkSync(MESSAGES_FILE);
  }
  
  runMigrations();
  console.log('[DB] Database reset complete.');
}

// CLI entry point for migrations
const args = process.argv.slice(2);
if (args.length > 0) {
  const action = args[0] || 'migrate';
  
  if (action === 'reset') {
    resetDatabase();
  } else {
    runMigrations();
  }
}
