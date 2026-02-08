import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname } from 'path';

const DB_PATH = './data/app.sqlite';

// Ensure data directory exists
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create Prodotto table
db.exec(`
  CREATE TABLE IF NOT EXISTS Prodotto (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT(40) NOT NULL,
    Descrizione TEXT(1000),
    Foto BLOB,
    Prezzo REAL NOT NULL
  )
`);

// Check if products already exist
const count = db.prepare('SELECT COUNT(*) as cnt FROM Prodotto').get();
if (count.cnt === 0) {
  const insertProduct = db.prepare(
    'INSERT INTO Prodotto (Nome, Descrizione, Prezzo) VALUES (?, ?, ?)'
  );

  const products = [
    { nome: 'MacBook Pro 16"', descrizione: 'Laptop professionale Apple con chip M3 Pro, display Liquid Retina XDR, 18GB di RAM unificata e 512GB SSD. Perfetto per sviluppatori e creativi.', prezzo: 2999.00 },
    { nome: 'iPhone 15 Pro', descrizione: 'Smartphone Apple con chip A17 Pro, fotocamera da 48MP, corpo in titanio, display Super Retina XDR da 6.1 pollici e USB-C.', prezzo: 1239.00 },
    { nome: 'Sony WH-1000XM5', descrizione: 'Cuffie over-ear wireless con cancellazione del rumore leader nel settore, 30 ore di autonomia e audio ad alta risoluzione.', prezzo: 349.99 },
    { nome: 'Samsung Galaxy S24 Ultra', descrizione: 'Smartphone Android flagship con S Pen integrata, fotocamera da 200MP, display Dynamic AMOLED 2X da 6.8 pollici e Galaxy AI.', prezzo: 1479.00 },
    { nome: 'iPad Air M2', descrizione: 'Tablet Apple con chip M2, display Liquid Retina da 11 pollici, supporto Apple Pencil Pro e Magic Keyboard.', prezzo: 799.00 },
    { nome: 'Dell XPS 15', descrizione: 'Laptop Windows premium con processore Intel Core i7 di 13a generazione, display OLED 3.5K, 16GB RAM e 512GB SSD.', prezzo: 1599.00 },
    { nome: 'AirPods Pro 2', descrizione: 'Auricolari wireless Apple con cancellazione attiva del rumore, audio adattivo, custodia con speaker e USB-C.', prezzo: 279.00 },
    { nome: 'Nintendo Switch OLED', descrizione: 'Console da gioco ibrida con schermo OLED da 7 pollici, dock con porta LAN, 64GB di memoria interna e audio migliorato.', prezzo: 349.99 },
    { nome: 'Logitech MX Master 3S', descrizione: 'Mouse wireless ergonomico per produttività con scorrimento MagSpeed, sensore 8K DPI, ricarica USB-C e connessione multi-dispositivo.', prezzo: 109.99 },
    { nome: 'Samsung 4K Monitor 32"', descrizione: 'Monitor UHD 4K da 32 pollici con pannello IPS, HDR10, 99% sRGB, USB-C con Power Delivery 65W per professionisti.', prezzo: 449.00 },
    { nome: 'Kindle Paperwhite', descrizione: 'E-reader Amazon con schermo da 6.8 pollici anti-riflesso, 16GB di memoria, resistente all\'acqua IPX8 e luce calda regolabile.', prezzo: 149.99 },
    { nome: 'Sony PlayStation 5', descrizione: 'Console da gioco di nuova generazione con SSD ultra-veloce, ray tracing, audio 3D Tempest e controller DualSense con feedback aptico.', prezzo: 549.99 },
    { nome: 'Apple Watch Ultra 2', descrizione: 'Smartwatch robusto con GPS a doppia frequenza, cassa in titanio da 49mm, display sempre attivo da 3000 nit e 36 ore di batteria.', prezzo: 909.00 },
    { nome: 'Bose SoundLink Max', descrizione: 'Speaker Bluetooth portatile con suono stereo potente, resistenza all\'acqua IP67, 20 ore di autonomia e ricarica USB-C.', prezzo: 399.00 },
    { nome: 'Razer BlackWidow V4', descrizione: 'Tastiera meccanica da gaming con switch green tattili, illuminazione RGB Chroma, poggiapolsi magnetico e rotella multimediale.', prezzo: 179.99 },
  ];

  const insertMany = db.transaction((products) => {
    for (const p of products) {
      insertProduct.run(p.nome, p.descrizione, p.prezzo);
    }
  });

  insertMany(products);
  console.log('Inserted 15 products into Prodotto table.');
}

console.log('Database setup complete at', DB_PATH);
db.close();
