// Reports JavaScript

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

// Generate daily report
function generateDailyReport() {
    const soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
    const today = new Date().toISOString().split('T')[0];
    const todaySales = soldItems.filter(item => item.dateSold === today);
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <div class="report-header">
            <h3>📅 Daily Sales Report</h3>
            <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div class="report-stats">
            <div class="report-stat">
                <h4>${todaySales.length}</h4>
                <p>Items Sold Today</p>
            </div>
        </div>
        <div class="report-table">
            ${todaySales.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Invoice</th>
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
            ` : '<p class="no-data">No sales recorded today</p>'}
        </div>
    `;
}

// Generate monthly report
function generateMonthlyReport() {
    const soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthlySales = soldItems.filter(item => {
        const saleDate = new Date(item.dateSold);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <div class="report-header">
            <h3>📊 Monthly Sales Report</h3>
            <p>Month: ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div class="report-stats">
            <div class="report-stat">
                <h4>${monthlySales.length}</h4>
                <p>Items Sold This Month</p>
            </div>
        </div>
        <div class="report-table">
            ${monthlySales.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>Invoice</th>
                            <th>IMEI</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${monthlySales.map(item => `
                            <tr>
                                <td>${new Date(item.dateSold).toLocaleDateString()}</td>
                                <td>${item.productName}</td>
                                <td>${item.customerName}</td>
                                <td>${item.invoiceNumber}</td>
                                <td>${item.imei}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-data">No sales recorded this month</p>'}
        </div>
    `;
}

// Generate warranty report
function generateWarrantyReport() {
    const soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];
    const now = new Date();
    
    const active = [];
    const expiring = [];
    const expired = [];
    
    soldItems.forEach(item => {
        const soldDate = new Date(item.dateSold);
        const warrantyEnd = new Date(soldDate);
        warrantyEnd.setMonth(warrantyEnd.getMonth() + parseInt(item.warrantyMonths));
        
        const daysLeft = Math.ceil((warrantyEnd - now) / (1000 * 60 * 60 * 24));
        
        if (item.status === 'returned') return;
        
        if (daysLeft < 0) {
            expired.push({ ...item, daysLeft: Math.abs(daysLeft) });
        } else if (daysLeft <= 30) {
            expiring.push({ ...item, daysLeft });
        } else {
            active.push({ ...item, daysLeft });
        }
    });
    
    const reportContent = document.getElementById('reportContent');
    reportContent.innerHTML = `
        <div class="report-header">
            <h3>⏰ Warranty Status Report</h3>
            <p>Generated: ${now.toLocaleDateString()}</p>
        </div>
        <div class="report-stats">
            <div class="report-stat">
                <h4>${active.length}</h4>
                <p>Active Warranties</p>
            </div>
            <div class="report-stat">
                <h4>${expiring.length}</h4>
                <p>Expiring Soon (30 days)</p>
            </div>
            <div class="report-stat">
                <h4>${expired.length}</h4>
                <p>Expired Warranties</p>
            </div>
        </div>
        <div class="report-section">
            <h4>⚠️ Expiring Soon (Within 30 Days)</h4>
            ${expiring.length > 0 ? `
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Customer</th>
                            <th>IMEI</th>
                            <th>Days Left</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${expiring.map(item => `
                            <tr>
                                <td>${item.productName}</td>
                                <td>${item.customerName}</td>
                                <td>${item.imei}</td>
                                <td>${item.daysLeft} days</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-data">No warranties expiring soon</p>'}
        </div>
    `;
}

// Export/Import removed — feature deprecated per request

// Print report
function printReport() {
    window.print();
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
});
