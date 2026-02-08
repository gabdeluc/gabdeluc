import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";

const DB_PATH = "./data/app.sqlite";

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Add profile columns to users table if they don't exist
const userColumns = db.prepare("PRAGMA table_info(users)").all() as Array<{ name: string }>;
const userColumnNames = userColumns.map(col => col.name);

const profileColumns = [
  { name: "email", type: "TEXT" },
  { name: "nome", type: "TEXT" },
  { name: "cognome", type: "TEXT" },
  { name: "telefono", type: "TEXT" },
  { name: "indirizzo", type: "TEXT" },
];

for (const col of profileColumns) {
  if (!userColumnNames.includes(col.name)) {
    db.exec(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
  }
}

// Create Categories table
db.exec(`
  CREATE TABLE IF NOT EXISTS Categoria (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT UNIQUE NOT NULL,
    Slug TEXT UNIQUE NOT NULL,
    Descrizione TEXT,
    Icona TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Check if Prodotto table exists and get its columns
const tableInfo = db.prepare("PRAGMA table_info(Prodotto)").all() as Array<{ name: string }>;
const prodottoExists = tableInfo.length > 0;
const columnNames = tableInfo.map(col => col.name);

// Create or alter Prodotto table
if (!prodottoExists) {
  db.exec(`
    CREATE TABLE Prodotto (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Nome TEXT NOT NULL,
      Descrizione TEXT,
      Foto BLOB,
      Prezzo REAL NOT NULL,
      Categoria_ID INTEGER,
      Stock INTEGER DEFAULT 0,
      Featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (Categoria_ID) REFERENCES Categoria(ID) ON DELETE SET NULL
    )
  `);
} else {
  // Add new columns if they don't exist
  if (!columnNames.includes("Categoria_ID")) {
    db.exec("ALTER TABLE Prodotto ADD COLUMN Categoria_ID INTEGER REFERENCES Categoria(ID) ON DELETE SET NULL");
  }
  if (!columnNames.includes("Stock")) {
    db.exec("ALTER TABLE Prodotto ADD COLUMN Stock INTEGER DEFAULT 0");
  }
  if (!columnNames.includes("Featured")) {
    db.exec("ALTER TABLE Prodotto ADD COLUMN Featured INTEGER DEFAULT 0");
  }
  if (!columnNames.includes("created_at")) {
    // SQLite doesn't support CURRENT_TIMESTAMP in ALTER TABLE, so we use NULL default
    db.exec("ALTER TABLE Prodotto ADD COLUMN created_at DATETIME DEFAULT NULL");
  }
}

// Create Product_Images table
db.exec(`
  CREATE TABLE IF NOT EXISTS Product_Images (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Prodotto_ID INTEGER NOT NULL,
    Immagine BLOB NOT NULL,
    Ordine INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Prodotto_ID) REFERENCES Prodotto(ID) ON DELETE CASCADE
  )
`);

// Create Cart table
db.exec(`
  CREATE TABLE IF NOT EXISTS Cart (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create Cart_Items table
db.exec(`
  CREATE TABLE IF NOT EXISTS Cart_Items (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Cart_ID INTEGER NOT NULL,
    Prodotto_ID INTEGER NOT NULL,
    Quantita INTEGER NOT NULL DEFAULT 1,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Cart_ID) REFERENCES Cart(ID) ON DELETE CASCADE,
    FOREIGN KEY (Prodotto_ID) REFERENCES Prodotto(ID) ON DELETE CASCADE,
    UNIQUE(Cart_ID, Prodotto_ID)
  )
`);

// Create Orders table
db.exec(`
  CREATE TABLE IF NOT EXISTS Orders (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    User_ID INTEGER NOT NULL,
    Totale REAL NOT NULL,
    Stato TEXT DEFAULT 'pending' CHECK(Stato IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    Indirizzo_Spedizione TEXT,
    Note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Create Order_Items table
db.exec(`
  CREATE TABLE IF NOT EXISTS Order_Items (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Order_ID INTEGER NOT NULL,
    Prodotto_ID INTEGER,
    Nome_Prodotto TEXT NOT NULL,
    Quantita INTEGER NOT NULL,
    Prezzo_Unitario REAL NOT NULL,
    Subtotale REAL NOT NULL,
    FOREIGN KEY (Order_ID) REFERENCES Orders(ID) ON DELETE CASCADE,
    FOREIGN KEY (Prodotto_ID) REFERENCES Prodotto(ID) ON DELETE SET NULL
  )
`);

// Create indexes for better performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_prodotto_categoria ON Prodotto(Categoria_ID);
  CREATE INDEX IF NOT EXISTS idx_prodotto_featured ON Prodotto(Featured);
  CREATE INDEX IF NOT EXISTS idx_cart_user ON Cart(User_ID);
  CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON Cart_Items(Cart_ID);
  CREATE INDEX IF NOT EXISTS idx_cart_items_prodotto ON Cart_Items(Prodotto_ID);
  CREATE INDEX IF NOT EXISTS idx_orders_user ON Orders(User_ID);
  CREATE INDEX IF NOT EXISTS idx_orders_stato ON Orders(Stato);
  CREATE INDEX IF NOT EXISTS idx_order_items_order ON Order_Items(Order_ID);
  CREATE INDEX IF NOT EXISTS idx_product_images_prodotto ON Product_Images(Prodotto_ID);
`);

// Seed categories
const categoryCount = db.prepare("SELECT COUNT(*) as cnt FROM Categoria").get() as { cnt: number };
if (categoryCount.cnt === 0) {
  const insertCategory = db.prepare(
    "INSERT INTO Categoria (Nome, Slug, Descrizione, Icona) VALUES (?, ?, ?, ?)"
  );

  const categories = [
    { nome: "Elettronica", slug: "elettronica", descrizione: "Dispositivi elettronici e gadget tecnologici", icona: "Laptop" },
    { nome: "Computer", slug: "computer", descrizione: "Laptop, desktop e accessori per computer", icona: "Monitor" },
    { nome: "Smartphone", slug: "smartphone", descrizione: "Telefoni cellulari e accessori", icona: "Smartphone" },
    { nome: "Audio", slug: "audio", descrizione: "Cuffie, speaker e dispositivi audio", icona: "Headphones" },
    { nome: "Gaming", slug: "gaming", descrizione: "Console, giochi e accessori gaming", icona: "Gamepad2" },
    { nome: "Accessori", slug: "accessori", descrizione: "Mouse, tastiere e altri accessori", icona: "Mouse" },
    { nome: "Wearable", slug: "wearable", descrizione: "Smartwatch e dispositivi indossabili", icona: "Watch" },
    { nome: "E-reader", slug: "e-reader", descrizione: "Lettori di libri elettronici", icona: "BookOpen" },
  ];

  const insertMany = db.transaction((items: typeof categories) => {
    for (const cat of items) {
      insertCategory.run(cat.nome, cat.slug, cat.descrizione, cat.icona);
    }
  });

  insertMany(categories);
}

// Seed products if empty
const count = db.prepare("SELECT COUNT(*) as cnt FROM Prodotto").get() as { cnt: number };
if (count.cnt === 0) {
  const insertProduct = db.prepare(
    "INSERT INTO Prodotto (Nome, Descrizione, Prezzo, Categoria_ID, Stock, Featured) VALUES (?, ?, ?, ?, ?, ?)"
  );

  const getCategoryId = db.prepare("SELECT ID FROM Categoria WHERE Nome = ?");

  const products = [
    { nome: 'MacBook Pro 16"', descrizione: "Laptop professionale Apple con chip M3 Pro, display Liquid Retina XDR, 18GB di RAM unificata e 512GB SSD.", prezzo: 2999.0, categoria: "Computer", stock: 15, featured: 1 },
    { nome: "iPhone 15 Pro", descrizione: "Smartphone Apple con chip A17 Pro, fotocamera da 48MP, corpo in titanio e display Super Retina XDR da 6.1 pollici.", prezzo: 1239.0, categoria: "Smartphone", stock: 25, featured: 1 },
    { nome: "Sony WH-1000XM5", descrizione: "Cuffie over-ear wireless con cancellazione del rumore leader nel settore, 30 ore di autonomia e audio ad alta risoluzione.", prezzo: 349.99, categoria: "Audio", stock: 30, featured: 0 },
    { nome: "Samsung Galaxy S24 Ultra", descrizione: "Smartphone Android flagship con S Pen integrata, fotocamera da 200MP e display Dynamic AMOLED 2X da 6.8 pollici.", prezzo: 1479.0, categoria: "Smartphone", stock: 20, featured: 1 },
    { nome: "iPad Air M2", descrizione: "Tablet Apple con chip M2, display Liquid Retina da 11 pollici, supporto Apple Pencil Pro e Magic Keyboard.", prezzo: 799.0, categoria: "Elettronica", stock: 18, featured: 0 },
    { nome: "Dell XPS 15", descrizione: "Laptop Windows premium con processore Intel Core i7 di 13a generazione, display OLED 3.5K, 16GB RAM e 512GB SSD.", prezzo: 1599.0, categoria: "Computer", stock: 12, featured: 0 },
    { nome: "AirPods Pro 2", descrizione: "Auricolari wireless Apple con cancellazione attiva del rumore, audio adattivo, custodia con speaker e USB-C.", prezzo: 279.0, categoria: "Audio", stock: 40, featured: 0 },
    { nome: "Nintendo Switch OLED", descrizione: "Console da gioco ibrida con schermo OLED da 7 pollici, dock con porta LAN, 64GB di memoria interna.", prezzo: 349.99, categoria: "Gaming", stock: 22, featured: 1 },
    { nome: "Logitech MX Master 3S", descrizione: "Mouse wireless ergonomico per produttivita con scorrimento MagSpeed, sensore 8K DPI e ricarica USB-C.", prezzo: 109.99, categoria: "Accessori", stock: 35, featured: 0 },
    { nome: 'Samsung 4K Monitor 32"', descrizione: "Monitor UHD 4K da 32 pollici con pannello IPS, HDR10, 99% sRGB e USB-C con Power Delivery 65W.", prezzo: 449.0, categoria: "Computer", stock: 10, featured: 0 },
    { nome: "Kindle Paperwhite", descrizione: "E-reader Amazon con schermo da 6.8 pollici anti-riflesso, 16GB di memoria e resistente all'acqua IPX8.", prezzo: 149.99, categoria: "E-reader", stock: 28, featured: 0 },
    { nome: "Sony PlayStation 5", descrizione: "Console da gioco di nuova generazione con SSD ultra-veloce, ray tracing e controller DualSense con feedback aptico.", prezzo: 549.99, categoria: "Gaming", stock: 8, featured: 1 },
    { nome: "Apple Watch Ultra 2", descrizione: "Smartwatch robusto con GPS a doppia frequenza, cassa in titanio da 49mm e display sempre attivo da 3000 nit.", prezzo: 909.0, categoria: "Wearable", stock: 14, featured: 0 },
    { nome: "Bose SoundLink Max", descrizione: "Speaker Bluetooth portatile con suono stereo potente, resistenza all'acqua IP67 e 20 ore di autonomia.", prezzo: 399.0, categoria: "Audio", stock: 16, featured: 0 },
    { nome: "Razer BlackWidow V4", descrizione: "Tastiera meccanica da gaming con switch green tattili, illuminazione RGB Chroma e poggiapolsi magnetico.", prezzo: 179.99, categoria: "Accessori", stock: 24, featured: 0 },
  ];

  const insertMany = db.transaction((items: typeof products) => {
    for (const p of items) {
      const category = getCategoryId.get(p.categoria) as { ID: number } | undefined;
      insertProduct.run(p.nome, p.descrizione, p.prezzo, category?.ID || null, p.stock, p.featured);
    }
  });

  insertMany(products);
} else {
  // Update existing products with categories and stock if they don't have them
  const needsUpdate = db.prepare("SELECT COUNT(*) as cnt FROM Prodotto WHERE Categoria_ID IS NULL").get() as { cnt: number };

  if (needsUpdate.cnt > 0) {
    const updateProduct = db.prepare(
      "UPDATE Prodotto SET Categoria_ID = ?, Stock = ?, Featured = ? WHERE Nome = ?"
    );
    const getCategoryId = db.prepare("SELECT ID FROM Categoria WHERE Nome = ?");

    const productUpdates = [
      { nome: 'MacBook Pro 16"', categoria: "Computer", stock: 15, featured: 1 },
      { nome: "iPhone 15 Pro", categoria: "Smartphone", stock: 25, featured: 1 },
      { nome: "Sony WH-1000XM5", categoria: "Audio", stock: 30, featured: 0 },
      { nome: "Samsung Galaxy S24 Ultra", categoria: "Smartphone", stock: 20, featured: 1 },
      { nome: "iPad Air M2", categoria: "Elettronica", stock: 18, featured: 0 },
      { nome: "Dell XPS 15", categoria: "Computer", stock: 12, featured: 0 },
      { nome: "AirPods Pro 2", categoria: "Audio", stock: 40, featured: 0 },
      { nome: "Nintendo Switch OLED", categoria: "Gaming", stock: 22, featured: 1 },
      { nome: "Logitech MX Master 3S", categoria: "Accessori", stock: 35, featured: 0 },
      { nome: 'Samsung 4K Monitor 32"', categoria: "Computer", stock: 10, featured: 0 },
      { nome: "Kindle Paperwhite", categoria: "E-reader", stock: 28, featured: 0 },
      { nome: "Sony PlayStation 5", categoria: "Gaming", stock: 8, featured: 1 },
      { nome: "Apple Watch Ultra 2", categoria: "Wearable", stock: 14, featured: 0 },
      { nome: "Bose SoundLink Max", categoria: "Audio", stock: 16, featured: 0 },
      { nome: "Razer BlackWidow V4", categoria: "Accessori", stock: 24, featured: 0 },
    ];

    const updateMany = db.transaction((items: typeof productUpdates) => {
      for (const p of items) {
        const category = getCategoryId.get(p.categoria) as { ID: number } | undefined;
        if (category) {
          updateProduct.run(category.ID, p.stock, p.featured, p.nome);
        }
      }
    });

    updateMany(productUpdates);
  }
}

export default db;
