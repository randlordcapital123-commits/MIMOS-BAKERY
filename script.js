let products = [];
let cart = [];
let adminPasswordToken = sessionStorage.getItem('adminToken') || null;
const WHATSAPP_PHONE = "27824876140";

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    fetchSettings();
    setupDragAndDrop();
    setupAuthListeners();
});

// Fetch & Display Products
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        renderProducts(products);
        if (adminPasswordToken) renderAdminProducts(products);
    } catch (err) {
        console.error('Error fetching products:', err);
    }
}

// Fetch Logo and Configuration
async function fetchSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        if (settings.logo_path) {
            const logoImg = document.getElementById('siteLogo');
            logoImg.src = settings.logo_path;
            logoImg.classList.remove('hidden');
        }
    } catch (err) {
        console.error('Error fetching settings:', err);
    }
}

// Render Uncropped Menu Cards
function renderProducts(items) {
    const grid = document.getElementById('productGrid');
    grid.innerHTML = items.map(p => `
        <div class="card">
            <div class="card-img-wrap">
                <img src="${p.image_url || 'https://via.placeholder.com/300'}" alt="${p.name}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${p.name}</h3>
                <p class="card-desc">${p.description || ''}</p>
                <div class="card-footer">
                    <span class="card-price">R ${parseFloat(p.price).toFixed(2)}</span>
                    <button class="btn btn-gold" onclick="addToCart(${p.id})">Add to Order</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Category Filter
function filterCategory(cat) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    if (cat === 'all') renderProducts(products);
    else renderProducts(products.filter(p => p.category === cat));
}

// Cart System
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const existing = cart.find(c => c.id === id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ ...item, qty: 1 });
    }
    updateCartUI();
    toggleCart(true);
}

function updateCartUI() {
    const cartBody = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCount');

    let total = 0;
    let totalItems = 0;

    cartBody.innerHTML = cart.map(item => {
        total += item.price * item.qty;
        totalItems += item.qty;
        return `
            <div class="cart-item">
                <div>
                    <h4>${item.name}</h4>
                    <small>R ${item.price.toFixed(2)} x ${item.qty}</small>
                </div>
                <div>
                    <strong>R ${(item.price * item.qty).toFixed(2)}</strong>
                </div>
            </div>
        `;
    }).join('');

    totalEl.innerText = `R ${total.toFixed(2)}`;
    countEl.innerText = totalItems;
}

function toggleCart(forceOpen = false) {
    const drawer = document.getElementById('cartDrawer');
    if (forceOpen) drawer.classList.add('open');
    else drawer.classList.toggle('open');
}

// Direct Sales via WhatsApp Integration
function sendWhatsAppOrder() {
    if (cart.length === 0) return alert('Your cart is empty!');

    let message = `Hello Mimos Bakery! I would like to place an order:\n\n`;
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        message += `${index + 1}. *${item.name}* (x${item.qty}) - R ${itemTotal.toFixed(2)}\n`;
    });

    message += `\n*Total Amount:* R ${total.toFixed(2)}\n\nPlease confirm order availability and payment details.`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`, '_blank');
}

// Admin Panel & Authentication Handlers
function toggleAdminPanel() {
    const modal = document.getElementById('adminModal');
    modal.classList.toggle('open');
    if (modal.classList.contains('open')) {
        checkAdminAuthState();
    }
}

function checkAdminAuthState() {
    const loginView = document.getElementById('adminLoginView');
    const dashboardView = document.getElementById('adminDashboardView');

    if (adminPasswordToken) {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        renderAdminProducts(products);
    } else {
        loginView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
}

function setupAuthListeners() {
    document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const pwd = document.getElementById('adminPasswordInput').value;
        const errorEl = document.getElementById('loginError');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pwd })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                adminPasswordToken = pwd;
                sessionStorage.setItem('adminToken', pwd);
                errorEl.classList.add('hidden');
                document.getElementById('adminPasswordInput').value = '';
                checkAdminAuthState();
            } else {
                errorEl.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Auth check failed:', err);
        }
    });
}

function adminLogout() {
    adminPasswordToken = null;
    sessionStorage.removeItem('adminToken');
    checkAdminAuthState();
}

// Render Admin Inventory List
function renderAdminProducts(items) {
    const list = document.getElementById('adminProductList');
    list.innerHTML = items.map(p => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #332d27;">
            <div>
                <strong>${p.name}</strong> - R ${parseFloat(p.price).toFixed(2)} (${p.category})
            </div>
            <div>
                <button class="btn btn-outline" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-outline" style="color:red; border-color:red;" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Drag & Drop Handling
function setupDragAndDrop() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('prodImage');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.classList.add('dragover');
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        fileInput.files = files;
        previewImage(files[0]);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) previewImage(fileInput.files[0]);
    });
}

function previewImage(file) {
    const preview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" style="max-height:100px; max-width:100%; margin-top:10px; border-radius:4px; object-fit:contain;">`;
    };
    reader.readAsDataURL(file);
}

// Submit Product (Add or Edit with Admin Password Header)
document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const formData = new FormData();
    formData.append('name', document.getElementById('prodName').value);
    formData.append('category', document.getElementById('prodCategory').value);
    formData.append('price', document.getElementById('prodPrice').value);
    formData.append('description', document.getElementById('prodDesc').value);

    const fileInput = document.getElementById('prodImage');
    if (fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
    }

    const url = id ? `/api/products/${id}` : '/api/products';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, { 
        method, 
        headers: { 'x-admin-password': adminPasswordToken },
        body: formData 
    });

    if (res.status === 401) {
        alert("Session expired or invalid password. Please log in again.");
        adminLogout();
        return;
    }

    resetForm();
    fetchProducts();
});

function editProduct(id) {
    const p = products.find(prod => prod.id === id);
    document.getElementById('prodId').value = p.id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodDesc').value = p.description;
    document.getElementById('formTitle').innerText = "Edit Product";
}

async function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        const res = await fetch(`/api/products/${id}`, { 
            method: 'DELETE',
            headers: { 'x-admin-password': adminPasswordToken }
        });
        if (res.status === 401) {
            alert("Unauthorized. Please log in again.");
            adminLogout();
            return;
        }
        fetchProducts();
    }
}

function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('formTitle').innerText = "Add New Product";
}

// Upload Logo Handler
document.getElementById('logoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('logo', document.getElementById('logoInput').files[0]);

    const res = await fetch('/api/settings/logo', { 
        method: 'POST', 
        headers: { 'x-admin-password': adminPasswordToken },
        body: formData 
    });

    if (res.status === 401) {
        alert("Unauthorized. Please log in again.");
        adminLogout();
        return;
    }

    fetchSettings();
});