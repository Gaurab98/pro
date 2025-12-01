// Cart page script
function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try { return new Date(dateStr).toLocaleDateString(); } catch (e) { return dateStr; }
}

function loadCart() {
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const cartKey = `cart_${user}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    const tbody = document.getElementById('cartTableBody');
    if (!tbody) return;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:40px; color:#95a5a6;">Cart is empty</td></tr>';
        return;
    }

    tbody.innerHTML = cart.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>Rs. ${parseFloat(item.price || 0).toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>${formatDate(item.expiryDate)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart('${item.id}')">Remove</button>
            </td>
        </tr>
    `).join('');
}

function removeFromCart(id) {
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const cartKey = `cart_${user}`;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem(cartKey, JSON.stringify(cart));
    loadCart();
}

function clearCart() {
    if (!confirm('Clear all items from cart?')) return;
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const cartKey = `cart_${user}`;
    localStorage.removeItem(cartKey);
    loadCart();
}

function checkout() {
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    const cartKey = `cart_${user}`;
    const cart = JSON.parse(localStorage.getItem(cartKey)) || [];
    if (cart.length === 0) { alert('Cart is empty'); return; }

    const prodKey = `products_${user}`;
    let products = JSON.parse(localStorage.getItem(prodKey)) || [];
    let soldItems = JSON.parse(localStorage.getItem('soldItems')) || [];

    // Attempt to process each cart item
    for (const item of cart) {
        const prod = products.find(p => p.id === item.id);
        if (!prod) {
            alert(`Product ${item.name} not found in inventory. Checkout cancelled.`);
            return;
        }
        if ((parseInt(prod.quantity) || 0) < (parseInt(item.quantity) || 0)) {
            alert(`Not enough stock for ${item.name}. Checkout cancelled.`);
            return;
        }
    }

    // All good — decrement inventory and create sold records
    for (const item of cart) {
        const prod = products.find(p => p.id === item.id);
        prod.quantity = (parseInt(prod.quantity) || 0) - (parseInt(item.quantity) || 0);

        // create sold item records (single unit per cart entry by default)
        const sold = {
            id: Date.now().toString() + Math.floor(Math.random()*1000),
            productName: item.name,
            customerName: 'Walk-in',
            invoiceNumber: 'CART-'+Date.now().toString().slice(-6),
            imei: '',
            dateSold: new Date().toISOString().split('T')[0],
            warrantyMonths: 0,
            status: 'active'
        };
        soldItems.push(sold);
    }

    localStorage.setItem(prodKey, JSON.stringify(products));
    localStorage.setItem('soldItems', JSON.stringify(soldItems));
    localStorage.removeItem(cartKey);
    alert('Checkout successful');
    loadCart();
}

window.addEventListener('DOMContentLoaded', function() {
    loadCart();
    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearBtn = document.getElementById('clearCartBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    if (clearBtn) clearBtn.addEventListener('click', clearCart);
});

// Refresh cart if updated elsewhere
window.addEventListener('storage', function(e) {
    if (!e.key) return;
    const user = (window.getCurrentUser && window.getCurrentUser()) || localStorage.getItem('current_user') || 'default';
    if (e.key === 'last_cart_update' || e.key === `cart_${user}`) {
        loadCart();
    }
});
