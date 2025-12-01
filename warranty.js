// Warranty Forecast JavaScript

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

// Load warranty forecast
function loadWarrantyForecast() {
    const soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
    
    const active = [];
    const expiringSoon = [];
    const expired = [];
    const today = [];
    
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    soldItems.forEach(item => {
        const soldDate = new Date(item.dateSold);
        const warrantyEnd = new Date(soldDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(item.warrantyMonths));
        warrantyEnd.setHours(0, 0, 0, 0);
        
        const daysLeft = Math.ceil((warrantyEnd - now) / (1000 * 60 * 60 * 24));
        
        if (item.status === 'returned') return;
        
        if (daysLeft === 0) {
            today.push({ ...item, warrantyEnd, daysLeft });
        }
        
        if (daysLeft < 0) {
            expired.push({ ...item, warrantyEnd, daysLeft });
        } else if (daysLeft <= 7) {
            expiringSoon.push({ ...item, warrantyEnd, daysLeft });
        } else {
            active.push({ ...item, warrantyEnd, daysLeft });
        }
    });
    
    displayWarrantyCategory('activeWarrantyCount', 'activeWarrantyList', active);
    displayWarrantyCategory('weekWarrantyCount', 'weekWarrantyList', expiringSoon);
    displayWarrantyCategory('expiredWarrantyCount', 'expiredWarrantyList', expired);
    displayTodayExpiring(today);
}

// Display warranty category
function displayWarrantyCategory(countId, listId, items) {
    document.getElementById(countId).textContent = items.length;
    const listElement = document.getElementById(listId);
    
    if (items.length === 0) {
        listElement.innerHTML = '<div class="no-items">No items</div>';
        return;
    }
    
    listElement.innerHTML = items.slice(0, 5).map(item => `
        <div class="forecast-item">
            <strong>${item.productName}</strong><br>
            <small>Customer: ${item.customerName}</small><br>
            <small>IMEI: ${item.imei}</small><br>
            <small>${item.daysLeft >= 0 ? item.daysLeft + ' days left' : Math.abs(item.daysLeft) + ' days overdue'}</small>
        </div>
    `).join('');
    
    if (items.length > 5) {
        listElement.innerHTML += `<div class="more-items">+${items.length - 5} more items</div>`;
    }
}

// Display today's expiring items
function displayTodayExpiring(items) {
    const listElement = document.getElementById('todayExpiringList');
    
    if (items.length === 0) {
        listElement.innerHTML = '<div class="no-items">No warranties expiring today</div>';
        return;
    }
    
    listElement.innerHTML = items.map(item => `
        <div class="detail-item">
            <div class="detail-header">
                <strong>${item.productName}</strong>
                <span class="badge badge-warning">Expires Today</span>
            </div>
            <div class="detail-info">
                <span>Customer: ${item.customerName}</span>
                <span>Invoice: ${item.invoiceNumber}</span>
                <span>IMEI: ${item.imei}</span>
                <span>Warranty End: ${item.warrantyEnd.toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

// Display logged-in user
function displayLoggedInUser() {
    const username = localStorage.getItem('admin_user') || 'Admin';
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
    loadWarrantyForecast();
});
