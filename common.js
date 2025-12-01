// Common functions used across pages
console.log('common.js loaded');
// User helpers
window.getUsers = function() {
    try {
        return JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) { return []; }
};

window.saveUsers = function(users) {
    localStorage.setItem('users', JSON.stringify(users || []));
};

window.addUser = function(username, passHash) {
    const users = window.getUsers();
    if (users.find(u => u.username === username)) return false;
    users.push({ id: Date.now().toString(), username, passHash });
    window.saveUsers(users);
    return true;
};

window.getCurrentUser = function() {
    return localStorage.getItem('current_user') || null;
};

window.setCurrentUser = function(username) {
    if (!username) localStorage.removeItem('current_user');
    else localStorage.setItem('current_user', username);
};

window.logout = function() {
    console.log('DEBUG: window.logout invoked');
    try {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('admin_logged_in');
            window.setCurrentUser(null);
            window.location.href = 'index.html';
        }
    } catch (e) {
        console.error('Logout failed', e);
    }
};

window.displayLoggedInUser = function() {
    try {
        const username = window.getCurrentUser() || 'Admin';
        const userElement = document.getElementById('loggedInUser');
        if (userElement) userElement.textContent = username;
        // Also update sidebar username placeholders if present
        const sidebarName = document.querySelector('.sidebar-username');
        if (sidebarName) sidebarName.textContent = username;
    } catch (e) {
        // ignore
    }
};

window.updateDate = function() {
    try {
        const d = new Date();
        const formatted = d.toLocaleDateString();
        const dateEls = document.querySelectorAll('#currentDate');
        dateEls.forEach(el => el.textContent = formatted);
    } catch (e) {}
};

// Ensure logout buttons have a working handler even if onclick attributes fail
document.addEventListener('DOMContentLoaded', function () {
    try {
        // attach to any element with class 'btn-logout'
        document.querySelectorAll('.btn-logout').forEach(btn => {
            try {
                btn.removeEventListener('click', window.logout);
            } catch (er) {}
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                console.log('DEBUG: .btn-logout clicked (attached handler)', btn);
                window.logout();
            });
            console.log('DEBUG: attached logout handler to element', btn);
        });
    } catch (err) {
        console.error('Failed to attach logout handlers', err);
    }
});

// Fallback: use event delegation so dynamically added logout buttons still work
document.addEventListener('click', function (e) {
    const btn = e.target.closest && e.target.closest('.btn-logout');
    if (btn) {
        e.preventDefault();
        console.log('DEBUG: delegated logout click detected', btn);
        // guard in case window.logout replaced
        if (typeof window.logout === 'function') {
            window.logout();
        } else {
            console.warn('logout() not defined');
        }
    }
});
