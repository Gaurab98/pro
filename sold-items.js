// Sold Items JavaScript

let soldItems = [];

function currentUser() {
    return (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
}

function productsKeyForUser() { return `products_${currentUser()}`; }
function cartKeyForUser() { return `cart_${currentUser()}`; }
function getProductsForUser() {
    const key = productsKeyForUser();
    const perUser = JSON.parse(localStorage.getItem(key)) || [];
    console.log('getProductsForUser: key=', key, 'perUserCount=', perUser.length);
    if (perUser && perUser.length > 0) return perUser;
    // Fallback to legacy 'products' key for compatibility
    try {
        const legacy = JSON.parse(localStorage.getItem('products')) || [];
        console.log('getProductsForUser: legacyCount=', legacy.length);
        return legacy;
    } catch (e) { return []; }
}
function saveProductsForUser(items) { localStorage.setItem(productsKeyForUser(), JSON.stringify(items || [])); }
function getCartForUser() { return JSON.parse(localStorage.getItem(cartKeyForUser())) || []; }
function saveCartForUser(cart) { localStorage.setItem(cartKeyForUser(), JSON.stringify(cart || [])); }

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

// Load sold items from localStorage
function loadSoldItems() {
    soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
    displaySoldItems(soldItems);
}

// Calculate warranty status
function getWarrantyStatus(item) {
    const soldDate = new Date(item.dateSold);
    const warrantyEnd = new Date(soldDate);
    warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(item.warrantyMonths));
    
    const now = new Date();
    const daysLeft = Math.ceil((warrantyEnd - now) / (1000 * 60 * 60 * 24));
    
    if (item.status === 'returned') return 'returned';
    if (daysLeft < 0) return 'expired';
    if (daysLeft <= 7) return 'soon';
    return 'active';
}

// Display sold items in table
function displaySoldItems(itemsToDisplay) {
    const tbody = document.getElementById('soldItemsTableBody');
    
    if (itemsToDisplay.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #95a5a6;">No sold items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = itemsToDisplay.map(item => {
        // Render sold item in columns matching the inventory table header
        const expiry = item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A';
        return `
            <tr>
                <td>${item.productName || ''}</td>
                <td>${item.category || 'N/A'}</td>
                <td>Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
                <td>${item.quantity || 1}</td>
                <td>${item.supplier || 'N/A'}</td>
                <td>${expiry}</td>
            </tr>
        `;
    }).join('');
}

// Display products inventory on the Sold Items page (show all products we have)
function displayProductsInventory() {
    const tbody = document.getElementById('soldItemsTableBody');
    const products = getProductsForUser();

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #95a5a6;">No products found</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(p => {
        const expiry = p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'N/A';
        return `
            <tr>
                <td>${p.name || ''}</td>
                <td>${p.category || 'N/A'}</td>
                <td>Rs. ${parseFloat(p.price || 0).toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td>${p.supplier || 'N/A'}</td>
                <td>${expiry}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="addToCart('${p.id}')">Add to Cart</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Add a product to the cart (stored in localStorage)
function addToCart(productId) {
    const products = getProductsForUser();
    const prod = products.find(p => p.id === productId);
    if (!prod) {
        saveProductsForUser(products);
        return;
    }
    if ((parseInt(prod.quantity) || 0) <= 0) {
        alert('Product is out of stock.');
        return;
    }

    const cart = getCartForUser();

    // If product already in cart, increase quantity (but do not exceed stock)
    const existing = cart.find(c => c.id === productId);
    if (existing) {
        const currentInCart = parseInt(existing.quantity) || 0;
        if (currentInCart + 1 > (parseInt(prod.quantity) || 0)) {
            alert('Cannot add more than available stock to cart.');
            return;
        }
        existing.quantity = currentInCart + 1;
    } else {
        cart.push({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            expiryDate: prod.expiryDate || '',
            quantity: 1
        });
    }

    saveCartForUser(cart);
    // notify other pages/tabs that cart changed
    localStorage.setItem('last_cart_update', Date.now().toString());
    // if cart page is open in same tab, try to call its loader
    if (window.loadCart) try { window.loadCart(); } catch (e) {}
    alert('Added to cart');
}

// Filter sold items
function filterSoldItems() {
    const searchTerm = document.getElementById('soldItemSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = soldItems;
    
    if (searchTerm) {
        filtered = filtered.filter(item => 
            item.productName.toLowerCase().includes(searchTerm) ||
            item.customerName.toLowerCase().includes(searchTerm) ||
            item.invoiceNumber.toLowerCase().includes(searchTerm) ||
            item.imei.toLowerCase().includes(searchTerm)
        );
    }
    
    if (statusFilter) {
        filtered = filtered.filter(item => getWarrantyStatus(item) === statusFilter);
    }
    
    displaySoldItems(filtered);
}

// Open sold item modal
function openSoldItemModal(itemId = null) {
    const modal = document.getElementById('soldItemModal');
    const title = document.getElementById('soldItemModalTitle');
    
    if (itemId) {
        const item = soldItems.find(i => i.id === itemId);
        title.textContent = 'Edit Sold Item';
        document.getElementById('soldItemId').value = item.id;
        document.getElementById('soldProductName').value = item.productName;
        document.getElementById('soldCustomerName').value = item.customerName;
        document.getElementById('soldInvoiceNumber').value = item.invoiceNumber;
        document.getElementById('soldImei').value = item.imei;
        document.getElementById('soldDate').value = item.dateSold;
        document.getElementById('soldWarrantyMonths').value = item.warrantyMonths;
        document.getElementById('soldStatus').value = item.status;
    } else {
        title.textContent = 'Add Sold Item';
        document.getElementById('soldItemForm').reset();
        document.getElementById('soldItemId').value = '';
        document.getElementById('soldDate').value = new Date().toISOString().split('T')[0];
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close sold item modal
function closeSoldItemModal() {
    document.getElementById('soldItemModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Save sold item
function saveSoldItem(event) {
    event.preventDefault();
    
    const itemId = document.getElementById('soldItemId').value;
    const itemData = {
        id: itemId || Date.now().toString(),
        productName: document.getElementById('soldProductName').value,
        customerName: document.getElementById('soldCustomerName').value,
        invoiceNumber: document.getElementById('soldInvoiceNumber').value,
        imei: document.getElementById('soldImei').value,
        dateSold: document.getElementById('soldDate').value,
        warrantyMonths: document.getElementById('soldWarrantyMonths').value,
        status: document.getElementById('soldStatus').value
    };
    
    // Load products from storage to check availability
    const products = getProductsForUser();

    // helper to find product by name (case-insensitive)
    function findProductByName(name) {
        if (!name) return null;
        const n = name.trim().toLowerCase();
        return products.find(p => (p.name || '').toLowerCase() === n) || null;
    }

    if (itemId) {
        // Editing existing sold item
        const index = soldItems.findIndex(i => i.id === itemId);
        const oldItem = soldItems[index];

        // If product changed, restore old product quantity then decrement new product
        if (oldItem && oldItem.productName !== itemData.productName) {
            const oldProd = findProductByName(oldItem.productName);
            if (oldProd) {
                oldProd.quantity = (parseInt(oldProd.quantity) || 0) + 1;
            }

            const newProd = findProductByName(itemData.productName);
            if (!newProd) {
                alert('Product not found in inventory. Cannot assign sale to a non-existent product.');
                // revert quantity change to oldProd
                if (oldProd) {
                    oldProd.quantity = Math.max(0, (parseInt(oldProd.quantity) || 0) - 1);
                    saveProductsForUser(products);
                }
                return;
            }
            if ((parseInt(newProd.quantity) || 0) <= 0) {
                alert('Selected product is out of stock. Cannot complete sale.');
                // revert restored oldProd
                if (oldProd) {
                    oldProd.quantity = Math.max(0, (parseInt(oldProd.quantity) || 0) - 1);
                    saveProductsForUser(products);
                }
                return;
            }

            // decrement new product
            newProd.quantity = (parseInt(newProd.quantity) || 0) - 1;
            soldItems[index] = itemData;
            saveProductsForUser(products);
        } else {
            // same product — no inventory change
            soldItems[index] = itemData;
        }
    } else {
        // New sale — check product exists and is in stock
        const product = findProductByName(itemData.productName);
        if (!product) {
            alert('Product not found in inventory. Please add the product before selling.');
            return;
        }
        if ((parseInt(product.quantity) || 0) <= 0) {
            alert('Product is out of stock. Cannot complete sale.');
            return;
        }

        // decrement inventory and save
        product.quantity = (parseInt(product.quantity) || 0) - 1;
        saveProductsForUser(products);

        soldItems.push(itemData);
    }

    localStorage.setItem('soldItems', JSON.stringify(soldItems));
    loadSoldItems();
    closeSoldItemModal();
}

// Edit sold item
function editSoldItem(itemId) {
    openSoldItemModal(itemId);
}

// Delete sold item
function deleteSoldItem(itemId) {
    if (confirm('Are you sure you want to delete this sold item?')) {
        // restore product quantity when deleting a sold record
        const item = soldItems.find(i => i.id === itemId);
        if (item) {
            const products = getProductsForUser();
                const prod = products.find(p => (p.name || '').toLowerCase() === (item.productName || '').toLowerCase());
            if (prod) {
                prod.quantity = (parseInt(prod.quantity) || 0) + 1;
                saveProductsForUser(products);
            }
        }

        soldItems = soldItems.filter(i => i.id !== itemId);
        localStorage.setItem('soldItems', JSON.stringify(soldItems));
        loadSoldItems();
    }
}

// Display logged-in user
function displayLoggedInUser() {
    const username = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'Admin';
    const userElement = document.getElementById('loggedInUser');
    if (userElement) userElement.textContent = username;
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
    // Show product inventory on this page instead of sold items
    displayProductsInventory();
});

// Listen for product updates from other pages/tabs and refresh
window.addEventListener('storage', function(e) {
    if (!e.key) return;
    if (e.key === 'last_products_update' || e.key === productsKeyForUser()) {
        displayProductsInventory();
    }
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('soldItemModal');
    if (event.target === modal) {
        closeSoldItemModal();
    }
};
