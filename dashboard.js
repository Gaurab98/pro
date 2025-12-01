// Dashboard JavaScript

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

// Load dashboard statistics
function loadDashboardStats() {
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const prodKey = `products_${user}`;
    const products = JSON.parse(localStorage.getItem(prodKey)) || [];
    const soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
    
    // Total products
    document.getElementById('totalProducts').textContent = products.length;
    
    // Total sold items
    document.getElementById('totalSoldItems').textContent = soldItems.length;
    
    // Active warranties
    const activeWarranties = soldItems.filter(item => {
        const warrantyEnd = new Date(item.dateSold);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(item.warrantyMonths));
        return warrantyEnd > new Date() && item.status === 'active';
    });
    document.getElementById('warrantyItems').textContent = activeWarranties.length;
    
    // Expiring soon (within 7 days)
    const expiringSoon = soldItems.filter(item => {
        const warrantyEnd = new Date(item.dateSold);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(item.warrantyMonths));
        const daysUntilExpiry = Math.ceil((warrantyEnd - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 7 && item.status === 'active';
    });
    document.getElementById('expiringSoon').textContent = expiringSoon.length;
    
    // Low stock alert
    loadLowStockAlert(products);
    
    // Warranty expiring alert
    loadWarrantyExpiringAlert(expiringSoon);
}

// Load low stock alert
function loadLowStockAlert(products) {
    const lowStockList = document.getElementById('lowStockList');
    const lowStockProducts = products.filter(p => p.quantity < 10);
    
    if (lowStockProducts.length === 0) {
        lowStockList.innerHTML = '<div class="no-alerts">No low stock items</div>';
    } else {
        lowStockList.innerHTML = lowStockProducts.map(p => 
            `<div class="alert-item">
                <strong>${p.name}</strong> - Only ${p.quantity} left
            </div>`
        ).join('');
    }
}

// Load warranty expiring alert
function loadWarrantyExpiringAlert(items) {
    const warrantyList = document.getElementById('warrantyExpiringList');
    
    if (items.length === 0) {
        warrantyList.innerHTML = '<div class="no-alerts">No warranties expiring soon</div>';
    } else {
        warrantyList.innerHTML = items.map(item => {
            const warrantyEnd = new Date(item.dateSold);
            warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(item.warrantyMonths));
            const daysLeft = Math.ceil((warrantyEnd - new Date()) / (1000 * 60 * 60 * 24));
            
            return `<div class="alert-item">
                <strong>${item.productName}</strong> - ${daysLeft} days left
            </div>`;
        }).join('');
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

// Initialize dashboard
window.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    updateDate();
    displayLoggedInUser();
    loadDashboardStats();
});
