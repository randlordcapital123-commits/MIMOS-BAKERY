// ==============================================================
//  MIMOS BAKERY – Full Client-Side Admin & Product Management
//  Uses localStorage as the database.
// ==============================================================

// ========== CONFIG ==========
const ADMIN_PASSWORD = 'admin123';  // Change this to your own password
const STORAGE_KEY = 'mimos_bakery_data';

// ========== DEFAULT DATA ==========
const defaultProducts = [
  {
    id: 1,
    name: 'Chocolate Fudge Cake',
    price: 49.99,
    desc: 'Rich, moist chocolate cake layered with velvety fudge ganache.',
    image: 'https://images.unsplash.com/photo-1603532648955-039310d9a75b?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: 'Vanilla Cupcake Set',
    price: 24.99,
    desc: 'Classic vanilla cupcakes with buttercream swirl – set of 6.',
    image: 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: 'Fresh Fruit Tart',
    price: 32.50,
    desc: 'Buttery pastry filled with vanilla custard and fresh seasonal berries.',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: 'Red Velvet Cheesecake',
    price: 44.00,
    desc: 'Creamy cheesecake with a red velvet swirl and cream cheese frosting.',
    image: 'https://images.unsplash.com/photo-1524351199670-2c1a77fd8eb2?w=400&h=300&fit=crop'
  }
];

// ========== STATE ==========
let products = [];
let logoDataUrl = '';  // base64 or URL

// ========== DOM REFS ==========
const productGrid = document.getElementById('productGrid');
const adminModal = document.getElementById('adminModal');
const adminLogin = document.getElementById('adminLogin');
const adminDashboard = document.getElementById('adminDashboard');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPassword = document.getElementById('adminPassword');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');
const adminModalClose = document.getElementById('adminModalClose');
const adminTrigger = document.getElementById('adminTrigger');
const footerAdminTrigger = document.getElementById('footerAdminTrigger');

const addProductForm = document.getElementById('addProductForm');
const productName = document.getElementById('productName');
const productPrice = document.getElementById('productPrice');
const productDesc = document.getElementById('productDesc');
const productFileInput = document.getElementById('productFileInput');
const productImagePreview = document.getElementById('productImagePreview');
const productUploadArea = document.getElementById('productUploadArea');

const logoFileInput = document.getElementById('logoFileInput');
const logoUploadArea = document.getElementById('logoUploadArea');
const saveLogoBtn = document.getElementById('saveLogoBtn');
const adminLogoImg = document.getElementById('adminLogoImg');
const siteLogo = document.getElementById('siteLogo');
const footerLogo = document.getElementById('footerLogo');

const adminProductList = document.getElementById('adminProductList');

// ========== UTILITY FUNCTIONS ==========
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored);
    products = data.products || [];
    logoDataUrl = data.logo || '';
  } else {
    // seed defaults
    products = defaultProducts;
    logoDataUrl = '';
    saveData();
  }
  applyLogo();
  renderProducts();
  renderAdminProductList();
}

function saveData() {
  const data = { products, logo: logoDataUrl };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function applyLogo() {
  const src = logoDataUrl || 'https://via.placeholder.com/180x60/C9A96E/FFFFFF?text=MIMOS';
  siteLogo.src = src;
  footerLogo.src = src;
  adminLogoImg.src = src;
}

// ========== RENDER PRODUCTS (PUBLIC) ==========
function renderProducts() {
  if (!productGrid) return;
  if (products.length === 0) {
    productGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#888;">No products yet. Check back soon!</p>`;
    return;
  }
  productGrid.innerHTML = products.map(p => `
    <div class="product-card">
      <img class="product-image" src="${p.image || 'https://via.placeholder.com/400x300/E8D5B5/2C2A28?text=Delicious'}" alt="${p.name}" />
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">R ${p.price.toFixed(2)}</div>
        <p class="product-desc">${p.desc || ''}</p>
        <div class="product-actions">
          <a href="https://wa.me/27824876140?text=Hi%20Mimos%2C%20I'd%20like%20to%20order%20${encodeURIComponent(p.name)}" target="_blank" class="btn btn-whatsapp" style="padding:0.4rem 1rem;font-size:0.85rem;">
            <i class="fab fa-whatsapp"></i> Order
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

// ========== RENDER ADMIN PRODUCT LIST ==========
function renderAdminProductList() {
  if (!adminProductList) return;
  if (products.length === 0) {
    adminProductList.innerHTML = `<p style="color:#888;">No products added yet.</p>`;
    return;
  }
  adminProductList.innerHTML = products.map(p => `
    <div class="admin-product-item" data-id="${p.id}">
      <div class="info">
        <img src="${p.image || 'https://via.placeholder.com/50/E8D5B5/2C2A28?text=Yum'}" alt="${p.name}" />
        <span class="name">${p.name}</span>
        <span class="price">R ${p.price.toFixed(2)}</span>
      </div>
      <div class="actions">
        <button class="edit-btn" data-id="${p.id}" title="Edit price"><i class="fas fa-edit"></i></button>
        <button class="delete-btn" data-id="${p.id}" title="Delete product"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');

  // Attach event listeners for edit and delete
  adminProductList.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      const product = products.find(p => p.id === id);
      if (!product) return;
      const newPrice = prompt(`Edit price for "${product.name}":`, product.price);
      if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
        product.price = parseFloat(newPrice);
        saveData();
        renderProducts();
        renderAdminProductList();
      }
    });
  });

  adminProductList.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(btn.dataset.id);
      if (confirm(`Delete "${products.find(p=>p.id===id).name}"?`)) {
        products = products.filter(p => p.id !== id);
        saveData();
        renderProducts();
        renderAdminProductList();
      }
    });
  });
}

// ========== ADMIN LOGIN / LOGOUT ==========
function openAdmin() {
  adminModal.classList.add('open');
  adminLogin.style.display = 'block';
  adminDashboard.style.display = 'none';
  adminPassword.value = '';
}

function closeAdmin() {
  adminModal.classList.remove('open');
}

adminTrigger.addEventListener('click', (e) => {
  e.preventDefault();
  openAdmin();
});
footerAdminTrigger.addEventListener('click', openAdmin);
adminModalClose.addEventListener('click', closeAdmin);
adminModal.addEventListener('click', (e) => {
  if (e.target === adminModal) closeAdmin();
});

adminLoginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (adminPassword.value === ADMIN_PASSWORD) {
    adminLogin.style.display = 'none';
    adminDashboard.style.display = 'block';
    renderAdminProductList(); // refresh
  } else {
    alert('Incorrect password. Try admin123');
    adminPassword.value = '';
  }
});

adminLogoutBtn.addEventListener('click', () => {
  adminLogin.style.display = 'block';
  adminDashboard.style.display = 'none';
  closeAdmin();
});

// ========== LOGO UPLOAD ==========
logoUploadArea.addEventListener('click', () => logoFileInput.click());
logoFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    logoDataUrl = ev.target.result;
    adminLogoImg.src = logoDataUrl;
    // Preview only – save on button click
  };
  reader.readAsDataURL(file);
});

saveLogoBtn.addEventListener('click', () => {
  if (logoDataUrl) {
    saveData();
    applyLogo();
    alert('Logo saved successfully!');
  } else {
    alert('Please select a logo image first.');
  }
});

// ========== PRODUCT IMAGE UPLOAD (drag & drop) ==========
let productImageDataUrl = '';

productUploadArea.addEventListener('click', () => productFileInput.click());
productFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    productImageDataUrl = ev.target.result;
    productImagePreview.innerHTML = `<img src="${productImageDataUrl}" alt="Product preview" />`;
  };
  reader.readAsDataURL(file);
});

// Drag & drop for product image
productUploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  productUploadArea.style.borderColor = 'var(--gold)';
});
productUploadArea.addEventListener('dragleave', () => {
  productUploadArea.style.borderColor = '#ddd';
});
productUploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  productUploadArea.style.borderColor = '#ddd';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      productImageDataUrl = ev.target.result;
      productImagePreview.innerHTML = `<img src="${productImageDataUrl}" alt="Product preview" />`;
    };
    reader.readAsDataURL(file);
  }
});

// ========== ADD PRODUCT ==========
addProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = productName.value.trim();
  const price = parseFloat(productPrice.value);
  const desc = productDesc.value.trim();

  if (!name || isNaN(price) || price <= 0) {
    alert('Please fill in a valid name and price.');
    return;
  }

  const newProduct = {
    id: Date.now(), // simple unique ID
    name,
    price,
    desc: desc || '',
    image: productImageDataUrl || 'https://via.placeholder.com/400x300/E8D5B5/2C2A28?text=Delicious'
  };

  products.push(newProduct);
  saveData();
  renderProducts();
  renderAdminProductList();

  // Reset form
  addProductForm.reset();
  productImageDataUrl = '';
  productImagePreview.innerHTML = '';
  productFileInput.value = '';

  alert(`"${name}" added successfully!`);
});

// ========== NAV TOGGLE (Mobile) ==========
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Close nav on link click (mobile)
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
  });
});

// ========== INIT ==========
loadData();