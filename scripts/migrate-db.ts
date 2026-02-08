import Database from "better-sqlite3";
import { existsSync } from "fs";

const DB_PATH = "./data/app.sqlite";

if (!existsSync(DB_PATH)) {
    console.error("Database file not found. Please run the app first to create the database.");
    process.exit(1);
}

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

console.log("Starting database migration...\n");

try {
    // Start transaction
    db.exec("BEGIN TRANSACTION");

    // 1. Create Categories table
    console.log("Creating Categories table...");
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

    // 2. Create Product_Images table
    console.log("Creating Product_Images table...");
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

    // 3. Create Cart table
    console.log("Creating Cart table...");
    db.exec(`
    CREATE TABLE IF NOT EXISTS Cart (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      User_ID INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (User_ID) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    // 4. Create Cart_Items table
    console.log("Creating Cart_Items table...");
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

    // 5. Create Orders table
    console.log("Creating Orders table...");
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

    // 6. Create Order_Items table
    console.log("Creating Order_Items table...");
    db.exec(`
    CREATE TABLE IF NOT EXISTS Order_Items (
      ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Order_ID INTEGER NOT NULL,
      Prodotto_ID INTEGER NOT NULL,
      Nome_Prodotto TEXT NOT NULL,
      Quantita INTEGER NOT NULL,
      Prezzo_Unitario REAL NOT NULL,
      Subtotale REAL NOT NULL,
      FOREIGN KEY (Order_ID) REFERENCES Orders(ID) ON DELETE CASCADE,
      FOREIGN KEY (Prodotto_ID) REFERENCES Prodotto(ID) ON DELETE SET NULL
    )
  `);

    // 7. Check if columns already exist in Prodotto table
    const tableInfo = db.prepare("PRAGMA table_info(Prodotto)").all() as Array<{ name: string }>;
    const columnNames = tableInfo.map(col => col.name);

    // Add new columns to Prodotto table if they don't exist
    if (!columnNames.includes("Categoria_ID")) {
        console.log("Adding Categoria_ID column to Prodotto table...");
        db.exec("ALTER TABLE Prodotto ADD COLUMN Categoria_ID INTEGER REFERENCES Categoria(ID) ON DELETE SET NULL");
    }

    if (!columnNames.includes("Stock")) {
        console.log("Adding Stock column to Prodotto table...");
        db.exec("ALTER TABLE Prodotto ADD COLUMN Stock INTEGER DEFAULT 0");
    }

    if (!columnNames.includes("Featured")) {
        console.log("Adding Featured column to Prodotto table...");
        db.exec("ALTER TABLE Prodotto ADD COLUMN Featured INTEGER DEFAULT 0");
    }

    if (!columnNames.includes("created_at")) {
        console.log("Adding created_at column to Prodotto table...");
        db.exec("ALTER TABLE Prodotto ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
    }

    // 8. Seed categories
    console.log("\nSeeding categories...");
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
        console.log(`  ✓ Inserted ${categories.length} categories`);
    } else {
        console.log(`  ✓ Categories already exist (${categoryCount.cnt} found)`);
    }

    // 9. Update existing products with categories and stock
    console.log("\nUpdating existing products with categories and stock...");

    const updateProduct = db.prepare(
        "UPDATE Prodotto SET Categoria_ID = ?, Stock = ?, Featured = ? WHERE Nome = ?"
    );

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

    const getCategoryId = db.prepare("SELECT ID FROM Categoria WHERE Nome = ?");

    const updateMany = db.transaction((items: typeof productUpdates) => {
        for (const p of items) {
            const category = getCategoryId.get(p.categoria) as { ID: number } | undefined;
            if (category) {
                updateProduct.run(category.ID, p.stock, p.featured, p.nome);
            }
        }
    });

    updateMany(productUpdates);
    console.log(`  ✓ Updated ${productUpdates.length} products with categories and stock`);

    // 10. Create indexes for better performance
    console.log("\nCreating indexes...");
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
    console.log("  ✓ Indexes created");

    // Commit transaction
    db.exec("COMMIT");

    console.log("\n✅ Migration completed successfully!");
    console.log("\nNew tables created:");
    console.log("  - Categoria (product categories)");
    console.log("  - Product_Images (product image storage)");
    console.log("  - Cart (shopping carts)");
    console.log("  - Cart_Items (cart line items)");
    console.log("  - Orders (customer orders)");
    console.log("  - Order_Items (order line items)");
    console.log("\nProdotto table enhanced with:");
    console.log("  - Categoria_ID (category reference)");
    console.log("  - Stock (inventory tracking)");
    console.log("  - Featured (featured products flag)");
    console.log("  - created_at (timestamp)");

} catch (error) {
    db.exec("ROLLBACK");
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
} finally {
    db.close();
}
