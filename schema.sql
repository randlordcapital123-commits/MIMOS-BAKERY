-- Database structure for Mimosa Bakery & Confectionery

CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    whatsapp_number TEXT NOT NULL DEFAULT '27824876140',
    logo_path TEXT DEFAULT 'logo.png'
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial shop configuration
INSERT OR IGNORE INTO settings (id, whatsapp_number, logo_path) 
VALUES (1, '27824876140', '');

-- Insert sample luxury products
INSERT INTO products (name, category, price, description, image_url, display_order) VALUES
('Signature Velvet Gateau', 'Cakes', 450.00, 'Rich red velvet layers filled with luxury Madagascar vanilla cream cheese.', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=600&q=80', 1),
('Artisanal Croissant Platter', 'Pastries', 280.00, 'Flaky, French butter croissants served with house gourmet spreads.', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80', 2),
('Gold-Dust Macaron Selection', 'Confections', 320.00, 'Box of 12 hand-decorated macarons infused with dark chocolate and gold dust.', 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80', 3);