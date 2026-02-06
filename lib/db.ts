import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from "bcrypt";


// Path del database
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'app.db');

// Assicurati che la directory esista
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Inizializza database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Schema del database
function initializeDatabase() {
  // Tabella utenti
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Tabella prodotti
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL CHECK(price >= 0),
      stock INTEGER NOT NULL CHECK(stock >= 0),
      category TEXT NOT NULL,
      image BLOB,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Tabella sessioni
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Indici per performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
  `);

  // Seed data iniziale (solo se le tabelle sono vuote)
  seedInitialData();
}

function seedInitialData() {

  // Controlla se ci sono già utenti
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    // Crea utenti di default
    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
    const hashedUserPassword = bcrypt.hashSync('user123', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (username, password, email, role)
      VALUES (?, ?, ?, ?)
    `);

    insertUser.run('admin', hashedAdminPassword, 'admin@demo.it', 'admin');
    insertUser.run('user', hashedUserPassword, 'user@demo.it', 'user');

    console.log('✅ Utenti di default creati');
  }

  // Controlla se ci sono già prodotti
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, price, stock, category)
      VALUES (?, ?, ?, ?)
    `);

    insertProduct.run('Laptop Dell XPS 15', 1299.99, 15, 'Electronics');
    insertProduct.run('Mouse Logitech MX Master 3', 89.99, 45, 'Accessories');
    insertProduct.run('Tastiera Meccanica Keychron K2', 159.99, 23, 'Accessories');
    insertProduct.run('Monitor LG UltraWide 34"', 599.99, 8, 'Electronics');
    insertProduct.run('Webcam Logitech C920', 79.99, 32, 'Accessories');
    insertProduct.run('Cuffie Sony WH-1000XM5', 349.99, 12, 'Audio');
    insertProduct.run('SSD Samsung 1TB', 129.99, 67, 'Storage');
    insertProduct.run('Hub USB-C Anker', 49.99, 89, 'Accessories');

    console.log('✅ Prodotti di esempio creati');
  }
}

// Inizializza il database all'avvio
initializeDatabase();

// Utility per cleanup sessioni scadute
export function cleanupExpiredSessions() {
  const stmt = db.prepare('DELETE FROM sessions WHERE datetime(expires_at) < datetime("now")');
  const result = stmt.run();
  return result.changes;
}

// Esporta il database
export default db;