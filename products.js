// Products JavaScript

let products = [];

// Update current date
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Load products from localStorage
function loadProducts() {
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const key = `products_${user}`;
    products = JSON.parse(localStorage.getItem(key)) || [];
    // If there are no per-user products but legacy 'products' exists, migrate or show legacy data
    if ((!products || products.length === 0) && localStorage.getItem('products')) {
        try {
            const legacy = JSON.parse(localStorage.getItem('products')) || [];
            if (legacy && legacy.length > 0) {
                // copy legacy to user's key so they see existing products
                products = legacy.slice();
                localStorage.setItem(key, JSON.stringify(products));
            }
        } catch (e) { /* ignore parse errors */ }
    }
    displayProducts(products);
}

// Display products in table
function displayProducts(productsToDisplay) {
    const tbody = document.getElementById('productsTableBody');
    
    if (productsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #95a5a6;">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = productsToDisplay.map(product => {
        const expiry = product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A';
        return `
        <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>Rs. ${parseFloat(product.price).toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>${expiry}</td>
            <td>${product.supplier || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        </tr>
    `}).join('');
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    let filtered = products;
    
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm) ||
            (p.supplier && p.supplier.toLowerCase().includes(searchTerm))
        );
    }
    
    if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
    }
    
    displayProducts(filtered);
}

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const title = document.getElementById('productModalTitle');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        title.textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productQuantity').value = product.quantity;
        document.getElementById('productSupplier').value = product.supplier || '';
        document.getElementById('productExpireDate').value = product.expiryDate || '';
    } else {
        title.textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Save product
function saveProduct(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const productData = {
        id: productId || Date.now().toString(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: document.getElementById('productPrice').value,
        quantity: document.getElementById('productQuantity').value,
        supplier: document.getElementById('productSupplier').value
        , expiryDate: document.getElementById('productExpireDate').value || ''
    };
    
    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        products[index] = productData;
    } else {
        products.push(productData);
    }
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const key = `products_${user}`;
    localStorage.setItem(key, JSON.stringify(products));
    // Notify other pages that products changed (helps live-update other tabs/pages)
    localStorage.setItem('last_products_update', Date.now().toString());
    loadProducts();
    closeProductModal();
}

// Edit product
function editProduct(productId) {
    openProductModal(productId);
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
        const key = `products_${user}`;
        localStorage.setItem(key, JSON.stringify(products));
        loadProducts();
    }
}

// Display logged-in user
function displayLoggedInUser() {
    const username = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'Admin';
    const userElement = document.getElementById('loggedInUser');
    if (userElement) {
        userElement.textContent = username;
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('admin_logged_in');
        window.location.href = 'index.html';
    }
}

// Check if user is logged in
function checkAuth() {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (isLoggedIn !== 'yes') {
        window.location.href = 'index.html';
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateDate();
    displayLoggedInUser();
    loadProducts();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('productModal');
    if (event.target === modal) {
        closeProductModal();
    }
};
