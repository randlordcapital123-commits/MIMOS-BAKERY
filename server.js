const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mimos2026'; // Change as needed

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Database Connection
const db = new sqlite3.Database('./bakery.db', (err) => {
    if (err) console.error('Database connection error:', err.message);
    else console.log('Connected to SQLite database for Mimos Bakery.');
});

// Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Admin Password Auth Middleware
const requireAdmin = (req, res, next) => {
    const authHeader = req.headers['x-admin-password'];
    if (authHeader && authHeader === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }
};

// --- PUBLIC ROUTES ---

app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM products ORDER BY display_order ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.get('/api/settings', (req, res) => {
    db.get(`SELECT * FROM settings WHERE id = 1`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row || {});
    });
});

// Admin Login Check
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true, message: 'Authenticated successfully' });
    } else {
        res.status(401).json({ success: false, error: 'Incorrect password' });
    }
});

// --- PROTECTED ADMIN ROUTES ---

app.post('/api/products', requireAdmin, upload.single('image'), (req, res) => {
    const { name, category, price, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const sql = `INSERT INTO products (name, category, price, description, image_url) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, category, parseFloat(price), description, imageUrl], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, name, category, price, description, image_url: imageUrl });
    });
});

app.put('/api/products/:id', requireAdmin, upload.single('image'), (req, res) => {
    const { id } = req.params;
    const { name, category, price, description } = req.body;

    if (req.file) {
        const imageUrl = `/uploads/${req.file.filename}`;
        const sql = `UPDATE products SET name = ?, category = ?, price = ?, description = ?, image_url = ? WHERE id = ?`;
        db.run(sql, [name, category, parseFloat(price), description, imageUrl, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated successfully' });
        });
    } else {
        const sql = `UPDATE products SET name = ?, category = ?, price = ?, description = ? WHERE id = ?`;
        db.run(sql, [name, category, parseFloat(price), description, id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Product updated successfully' });
        });
    }
});

app.delete('/api/products/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM products WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Product deleted' });
    });
});

app.post('/api/settings/logo', requireAdmin, upload.single('logo'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No logo file provided' });
    const logoUrl = `/uploads/${req.file.filename}`;
    db.run(`UPDATE settings SET logo_path = ? WHERE id = 1`, [logoUrl], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ logo_path: logoUrl });
    });
});

app.listen(PORT, () => console.log(`Mimos Bakery server running on http://localhost:${PORT}`));