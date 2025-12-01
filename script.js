// ===== LOCALSTORAGE KEYS =====
const PRODUCTS_KEY = 'pasal_products';
const SOLD_ITEMS_KEY = 'pasal_sold_items';

// ===== UTILITY FUNCTIONS =====

// Save data to localStorage
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Load data from localStorage
function loadData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Format date for display
function formatDisplayDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ===== WARRANTY CALCULATION =====

// Calculate warranty expiry date
function calculateWarrantyExpiry(soldDate, months) {
    const date = new Date(soldDate);
    date.setMonth(date.getMonth() + parseInt(months));
    return date;
}

// Get warranty status
function getWarrantyStatus(soldDate, warrantyMonths) {
    const expiryDate = calculateWarrantyExpiry(soldDate, warrantyMonths);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    let status = 'active';
    if (daysLeft < 0) {
        status = 'expired';
    } else if (daysLeft <= 7) {
        status = 'soon';
    }
    
    return { status, daysLeft, expiryDate };
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    document.getElementById('currentDate').textContent = formatDisplayDate(new Date());
    
    // Initialize navigation
    initNavigation();
    
    // Load dashboard
    renderDashboard();
    
    // Set today's date as default for sold item form
    document.getElementById('soldDate').value = formatDate(new Date());
    
    // Add sample data if empty
    addSampleDataIfEmpty();
});

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const page = this.getAttribute('data-page');
            document.getElementById(page).classList.add('active');
            
            if (page === 'dashboard') renderDashboard();
            if (page === 'products') renderProducts();
            if (page === 'sold-items') renderSoldItems();
            if (page === 'warranty') renderWarrantyForecast();
        });
    });
}

// ===== DASHBOARD FUNCTIONS =====

function renderDashboard() {
    const products = loadData(PRODUCTS_KEY);
    const soldItems = loadData(SOLD_ITEMS_KEY);
    
    // Update stats
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalSoldItems').textContent = soldItems.length;
    
    // Calculate warranty stats
    let activeWarranties = 0;
    let expiringSoon = 0;
    const expiringList = [];
    
    soldItems.forEach(item => {
        if (item.status !== 'returned') {
            const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
            if (warranty.status === 'active') activeWarranties++;
            if (warranty.status === 'soon') {
                expiringSoon++;
                expiringList.push(item);
            }
        }
    });
    
    document.getElementById('warrantyItems').textContent = activeWarranties;
    document.getElementById('expiringSoon').textContent = expiringSoon;
    
    // Low stock alert
    const lowStockProducts = products.filter(p => p.quantity < 10);
    const lowStockList = document.getElementById('lowStockList');
    
    if (lowStockProducts.length === 0) {
        lowStockList.innerHTML = '<p style="color: #10b981;">✅ All products well stocked!</p>';
    } else {
        lowStockList.innerHTML = lowStockProducts.map(p => 
            `<div class="alert-item low-stock"><strong>${p.name}</strong> - Only ${p.quantity} left</div>`
        ).join('');
    }
    
    // Warranty expiring soon
    const warrantyExpiringList = document.getElementById('warrantyExpiringList');
    
    if (expiringList.length === 0) {
        warrantyExpiringList.innerHTML = '<p style="color: #10b981;">✅ No warranties expiring soon!</p>';
    } else {
        warrantyExpiringList.innerHTML = expiringList.map(item => {
            const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
            return `<div class="alert-item expiring">
                <strong>${item.productName}</strong> - ${item.customerName}<br>
                <small>Expires in ${warranty.daysLeft} days</small>
            </div>`;
        }).join('');
    }
}

// ===== PRODUCT MANAGEMENT =====

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    
    form.reset();
    
    if (productId) {
        title.textContent = 'Edit Product';
        const products = loadData(PRODUCTS_KEY);
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productQuantity').value = product.quantity;
            document.getElementById('productSupplier').value = product.supplier || '';
        }
    } else {
        title.textContent = 'Add Product';
        document.getElementById('productId').value = '';
    }
    
    modal.classList.add('active');
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

// Save product (Add or Edit)
function saveProduct(event) {
    event.preventDefault();
    
    const products = loadData(PRODUCTS_KEY);
    const productId = document.getElementById('productId').value;
    
    const productData = {
        id: productId || generateId(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        supplier: document.getElementById('productSupplier').value
    };
    
    if (productId) {
        const index = products.findIndex(p => p.id === productId);
        products[index] = productData;
    } else {
        products.push(productData);
    }
    
    saveData(PRODUCTS_KEY, products);
    closeProductModal();
    renderProducts();
    renderDashboard();
}

// Delete product
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = loadData(PRODUCTS_KEY);
        products = products.filter(p => p.id !== productId);
        saveData(PRODUCTS_KEY, products);
        renderProducts();
        renderDashboard();
    }
}

// Render products table
function renderProducts() {
    const products = loadData(PRODUCTS_KEY);
    const tbody = document.getElementById('productsTableBody');
    
    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No products found. Click "Add Product" to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = products.map(product => {
        const lowStock = product.quantity < 10 ? 'low-stock-row' : '';
        return `
            <tr class="${lowStock}">
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td>Rs. ${product.price.toFixed(2)}</td>
                <td>${product.quantity} ${product.quantity < 10 ? '⚠️' : ''}</td>
                <td>${product.supplier || '-'}</td>
                <td>
                    <button class="btn btn-edit" onclick="openProductModal('${product.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter products
function filterProducts() {
    const searchTerm = document.getElementById('productSearch').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    
    const products = loadData(PRODUCTS_KEY);
    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.supplier && product.supplier.toLowerCase().includes(searchTerm));
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    const tbody = document.getElementById('productsTableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No products match your search.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(product => {
        const lowStock = product.quantity < 10 ? 'low-stock-row' : '';
        return `
            <tr class="${lowStock}">
                <td><strong>${product.name}</strong></td>
                <td>${product.category}</td>
                <td>Rs. ${product.price.toFixed(2)}</td>
                <td>${product.quantity} ${product.quantity < 10 ? '⚠️' : ''}</td>
                <td>${product.supplier || '-'}</td>
                <td>
                    <button class="btn btn-edit" onclick="openProductModal('${product.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== SOLD ITEMS MANAGEMENT =====

// Open sold item modal
function openSoldItemModal(itemId = null) {
    const modal = document.getElementById('soldItemModal');
    const form = document.getElementById('soldItemForm');
    const title = document.getElementById('soldItemModalTitle');
    
    form.reset();
    document.getElementById('soldDate').value = formatDate(new Date());
    
    if (itemId) {
        title.textContent = 'Edit Sold Item';
        const soldItems = loadData(SOLD_ITEMS_KEY);
        const item = soldItems.find(i => i.id === itemId);
        
        if (item) {
            document.getElementById('soldItemId').value = item.id;
            document.getElementById('soldProductName').value = item.productName;
            document.getElementById('soldCustomerName').value = item.customerName;
            document.getElementById('soldInvoiceNumber').value = item.invoiceNumber;
            document.getElementById('soldImei').value = item.imei;
            document.getElementById('soldDate').value = item.dateSold;
            document.getElementById('soldWarrantyMonths').value = item.warrantyMonths;
            document.getElementById('soldStatus').value = item.status;
        }
    } else {
        title.textContent = 'Add Sold Item';
        document.getElementById('soldItemId').value = '';
    }
    
    modal.classList.add('active');
}

// Close sold item modal
function closeSoldItemModal() {
    document.getElementById('soldItemModal').classList.remove('active');
}

// Save sold item
function saveSoldItem(event) {
    event.preventDefault();
    
    const soldItems = loadData(SOLD_ITEMS_KEY);
    const itemId = document.getElementById('soldItemId').value;
    
    const itemData = {
        id: itemId || generateId(),
        productName: document.getElementById('soldProductName').value,
        customerName: document.getElementById('soldCustomerName').value,
        invoiceNumber: document.getElementById('soldInvoiceNumber').value,
        imei: document.getElementById('soldImei').value,
        dateSold: document.getElementById('soldDate').value,
        warrantyMonths: parseInt(document.getElementById('soldWarrantyMonths').value),
        status: document.getElementById('soldStatus').value
    };
    
    if (itemId) {
        const index = soldItems.findIndex(i => i.id === itemId);
        soldItems[index] = itemData;
    } else {
        soldItems.push(itemData);
    }
    
    saveData(SOLD_ITEMS_KEY, soldItems);
    closeSoldItemModal();
    renderSoldItems();
    renderDashboard();
}

// Delete sold item
function deleteSoldItem(itemId) {
    if (confirm('Are you sure you want to delete this sold item?')) {
        let soldItems = loadData(SOLD_ITEMS_KEY);
        soldItems = soldItems.filter(i => i.id !== itemId);
        saveData(SOLD_ITEMS_KEY, soldItems);
        renderSoldItems();
        renderDashboard();
    }
}

// Render sold items table
function renderSoldItems() {
    const soldItems = loadData(SOLD_ITEMS_KEY);
    const tbody = document.getElementById('soldItemsTableBody');
    
    if (soldItems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No sold items found. Click "Add Sold Item" to get started.</td></tr>';
        return;
    }
    
    tbody.innerHTML = soldItems.map(item => {
        const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
        const displayStatus = item.status === 'returned' ? 'returned' : warranty.status;
        
        return `
            <tr>
                <td><strong>${item.productName}</strong></td>
                <td>${item.customerName}</td>
                <td>${item.invoiceNumber}</td>
                <td>${item.imei}</td>
                <td>${formatDisplayDate(item.dateSold)}</td>
                <td>${item.warrantyMonths} months<br><small>Expires: ${formatDisplayDate(warranty.expiryDate)}</small></td>
                <td><span class="status-badge status-${displayStatus}">${displayStatus.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="openSoldItemModal('${item.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteSoldItem('${item.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter sold items
function filterSoldItems() {
    const searchTerm = document.getElementById('soldItemSearch').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    const soldItems = loadData(SOLD_ITEMS_KEY);
    const filtered = soldItems.filter(item => {
        const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
        const displayStatus = item.status === 'returned' ? 'returned' : warranty.status;
        
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm) ||
                            item.customerName.toLowerCase().includes(searchTerm) ||
                            item.invoiceNumber.toLowerCase().includes(searchTerm) ||
                            item.imei.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || displayStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });
    
    const tbody = document.getElementById('soldItemsTableBody');
    
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No sold items match your search.</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(item => {
        const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
        const displayStatus = item.status === 'returned' ? 'returned' : warranty.status;
        
        return `
            <tr>
                <td><strong>${item.productName}</strong></td>
                <td>${item.customerName}</td>
                <td>${item.invoiceNumber}</td>
                <td>${item.imei}</td>
                <td>${formatDisplayDate(item.dateSold)}</td>
                <td>${item.warrantyMonths} months<br><small>Expires: ${formatDisplayDate(warranty.expiryDate)}</small></td>
                <td><span class="status-badge status-${displayStatus}">${displayStatus.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-edit" onclick="openSoldItemModal('${item.id}')">Edit</button>
                    <button class="btn btn-danger" onclick="deleteSoldItem('${item.id}')">Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// ===== WARRANTY FORECAST =====

function renderWarrantyForecast() {
    const soldItems = loadData(SOLD_ITEMS_KEY);
    
    const active = [];
    const expiring = [];
    const expired = [];
    const today = [];
    
    soldItems.forEach(item => {
        if (item.status !== 'returned') {
            const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
            
            if (warranty.status === 'active') {
                active.push({ ...item, warranty });
            } else if (warranty.status === 'soon') {
                expiring.push({ ...item, warranty });
                if (warranty.daysLeft === 0) {
                    today.push({ ...item, warranty });
                }
            } else if (warranty.status === 'expired') {
                expired.push({ ...item, warranty });
            }
        }
    });
    
    // Update counts
    document.getElementById('activeWarrantyCount').textContent = active.length;
    document.getElementById('weekWarrantyCount').textContent = expiring.length;
    document.getElementById('expiredWarrantyCount').textContent = expired.length;
    
    // Render lists
    renderForecastList('activeWarrantyList', active);
    renderForecastList('weekWarrantyList', expiring);
    renderForecastList('expiredWarrantyList', expired);
    renderForecastList('todayExpiringList', today, true);
}

function renderForecastList(elementId, items, isToday = false) {
    const element = document.getElementById(elementId);
    
    if (items.length === 0) {
        element.innerHTML = isToday ? 
            '<p style="color: #10b981;">✅ No items expiring today!</p>' :
            '<p style="color: #9ca3af;">No items in this category.</p>';
        return;
    }
    
    element.innerHTML = items.map(item => `
        <div class="forecast-item">
            <strong>${item.productName}</strong><br>
            Customer: ${item.customerName}<br>
            IMEI: ${item.imei}<br>
            Expires: ${formatDisplayDate(item.warranty.expiryDate)} 
            ${item.warranty.daysLeft >= 0 ? `(${item.warranty.daysLeft} days left)` : `(${Math.abs(item.warranty.daysLeft)} days ago)`}
        </div>
    `).join('');
}

// ===== REPORTS =====

function generateDailyReport() {
    const soldItems = loadData(SOLD_ITEMS_KEY);
    const today = formatDate(new Date());
    
    const todaySales = soldItems.filter(item => item.dateSold === today);
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <h3>📅 Daily Sales Report - ${formatDisplayDate(today)}</h3>
        <p><strong>Total Items Sold Today:</strong> ${todaySales.length}</p>
        
        ${todaySales.length > 0 ? `
            <table style="width: 100%; margin-top: 20px;">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Invoice #</th>
                        <th>IMEI</th>
                        <th>Warranty</th>
                    </tr>
                </thead>
                <tbody>
                    ${todaySales.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.customerName}</td>
                            <td>${item.invoiceNumber}</td>
                            <td>${item.imei}</td>
                            <td>${item.warrantyMonths} months</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="text-align: center; color: #9ca3af; padding: 40px;">No sales recorded today.</p>'}
    `;
}

function generateMonthlyReport() {
    const soldItems = loadData(SOLD_ITEMS_KEY);
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const monthlySales = soldItems.filter(item => {
        const itemDate = new Date(item.dateSold);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    });
    
    const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <h3>📊 Monthly Sales Report - ${monthName}</h3>
        <p><strong>Total Items Sold This Month:</strong> ${monthlySales.length}</p>
        
        ${monthlySales.length > 0 ? `
            <table style="width: 100%; margin-top: 20px;">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>Invoice #</th>
                        <th>IMEI</th>
                    </tr>
                </thead>
                <tbody>
                    ${monthlySales.map(item => `
                        <tr>
                            <td>${formatDisplayDate(item.dateSold)}</td>
                            <td>${item.productName}</td>
                            <td>${item.customerName}</td>
                            <td>${item.invoiceNumber}</td>
                            <td>${item.imei}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="text-align: center; color: #9ca3af; padding: 40px;">No sales recorded this month.</p>'}
    `;
}

function generateWarrantyReport() {
    const soldItems = loadData(SOLD_ITEMS_KEY);
    
    const active = [];
    const expiring = [];
    const expired = [];
    
    soldItems.forEach(item => {
        if (item.status !== 'returned') {
            const warranty = getWarrantyStatus(item.dateSold, item.warrantyMonths);
            
            if (warranty.status === 'active') {
                active.push({ ...item, warranty });
            } else if (warranty.status === 'soon') {
                expiring.push({ ...item, warranty });
            } else if (warranty.status === 'expired') {
                expired.push({ ...item, warranty });
            }
        }
    });
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <h3>⏰ Warranty Status Report</h3>
        <p><strong>Active Warranties:</strong> ${active.length}</p>
        <p><strong>Expiring Soon (7 days):</strong> ${expiring.length}</p>
        <p><strong>Expired Warranties:</strong> ${expired.length}</p>
        
        <h4 style="margin-top: 30px; color: #f59e0b;">⚠️ Warranties Expiring Soon</h4>
        ${expiring.length > 0 ? `
            <table style="width: 100%; margin-top: 20px;">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Customer</th>
                        <th>IMEI</th>
                        <th>Expiry Date</th>
                        <th>Days Left</th>
                    </tr>
                </thead>
                <tbody>
                    ${expiring.map(item => `
                        <tr>
                            <td>${item.productName}</td>
                            <td>${item.customerName}</td>
                            <td>${item.imei}</td>
                            <td>${formatDisplayDate(item.warranty.expiryDate)}</td>
                            <td>${item.warranty.daysLeft} days</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p style="text-align: center; color: #9ca3af; padding: 20px;">No warranties expiring soon.</p>'}
    `;
}

// Export data to JSON
function exportData() {
    const data = {
        products: loadData(PRODUCTS_KEY),
        soldItems: loadData(SOLD_ITEMS_KEY),
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pasal-backup-${formatDate(new Date())}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('Data exported successfully!');
}

// Import data from JSON
function importData() {
    document.getElementById('importFileInput').click();
}

function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            if (data.products && data.soldItems) {
                if (confirm('This will replace all existing data. Are you sure?')) {
                    saveData(PRODUCTS_KEY, data.products);
                    saveData(SOLD_ITEMS_KEY, data.soldItems);
                    alert('Data imported successfully!');
                    location.reload();
                }
            } else {
                alert('Invalid data format!');
            }
        } catch (error) {
            alert('Error reading file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Print report
function printReport() {
    window.print();
}

// ===== SAMPLE DATA =====

function addSampleDataIfEmpty() {
    const products = loadData(PRODUCTS_KEY);
    const soldItems = loadData(SOLD_ITEMS_KEY);
    
    // Add sample products if none exist
    if (products.length === 0) {
        const sampleProducts = [
            {
                id: generateId(),
                name: 'Samsung Galaxy S23',
                category: 'Mobile',
                price: 85000,
                quantity: 15,
                supplier: 'Samsung Nepal'
            },
            {
                id: generateId(),
                name: 'iPhone 14 Pro',
                category: 'Mobile',
                price: 145000,
                quantity: 8,
                supplier: 'Apple Store'
            },
            {
                id: generateId(),
                name: 'Sony Headphones WH-1000XM5',
                category: 'Accessories',
                price: 35000,
                quantity: 20,
                supplier: 'Sony Electronics'
            },
            {
                id: generateId(),
                name: 'Dell Laptop Inspiron 15',
                category: 'Electronics',
                price: 75000,
                quantity: 5,
                supplier: 'Dell Nepal'
            },
            {
                id: generateId(),
                name: 'Wireless Mouse Logitech',
                category: 'Accessories',
                price: 1500,
                quantity: 50,
                supplier: 'Logitech'
            }
        ];
        
        saveData(PRODUCTS_KEY, sampleProducts);
    }
    
    // Add sample sold items if none exist
    if (soldItems.length === 0) {
        const sampleSoldItems = [
            {
                id: generateId(),
                productName: 'Samsung Galaxy S23',
                customerName: 'Ram Sharma',
                invoiceNumber: 'INV-001',
                imei: '123456789012345',
                dateSold: formatDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
                warrantyMonths: 12,
                status: 'active'
            },
            {
                id: generateId(),
                productName: 'iPhone 14 Pro',
                customerName: 'Sita Thapa',
                invoiceNumber: 'INV-002',
                imei: '987654321098765',
                dateSold: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
                warrantyMonths: 12,
                status: 'active'
            },
            {
                id: generateId(),
                productName: 'Sony Headphones WH-1000XM5',
                customerName: 'Hari Bahadur',
                invoiceNumber: 'INV-003',
                imei: 'SN-ABC123456',
                dateSold: formatDate(new Date(Date.now() - 350 * 24 * 60 * 60 * 1000)),
                warrantyMonths: 12,
                status: 'active'
            }
        ];
        
        saveData(SOLD_ITEMS_KEY, sampleSoldItems);
    }
    
    // Refresh displays if sample data was added
    if (products.length === 0 || soldItems.length === 0) {
        renderDashboard();
        renderProducts();
        renderSoldItems();
        renderWarrantyForecast();
    }
}
