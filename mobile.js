// Mobile menu toggle for small devices
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    const isOpen = sidebar.classList.contains('open');
    if (isOpen) {
        closeSidebar();
        return;
    }

    // open
    sidebar.classList.add('open');

    // add backdrop
    let backdrop = document.getElementById('sidebarBack');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'sidebarBack';
        backdrop.className = 'sidebar-backdrop show';
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', closeSidebar);
    } else {
        backdrop.classList.add('show');
    }

    // prevent body scroll
    document.body.style.overflow = 'hidden';
    // sync topbar values into sidebar when opening on mobile
    if (typeof syncTopbarToSidebar === 'function') syncTopbarToSidebar();
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('open');
    const backdrop = document.getElementById('sidebarBack');
    if (backdrop) {
        backdrop.classList.remove('show');
        // remove from DOM after transition
        setTimeout(() => { if (backdrop.parentNode) backdrop.parentNode.removeChild(backdrop); }, 300);
    }
    document.body.style.overflow = 'auto';
}

// ensure sidebar closes on navigation link click (mobile)
document.addEventListener('click', function (e) {
    const link = e.target.closest('.nav-link');
    if (!link) return;
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    if (sidebar.classList.contains('open')) closeSidebar();
});

// Copy values from topbar elements into sidebar placeholders
function syncTopbarToSidebar() {
    const dateEl = document.getElementById('currentDate');
    const userEl = document.getElementById('loggedInUser');
    const sd = document.querySelectorAll('.sidebar-date span');
    const su = document.querySelectorAll('.sidebar-username');
    if (dateEl && sd.length) sd.forEach(el => el.textContent = dateEl.textContent);
    if (userEl && su.length) su.forEach(el => el.textContent = userEl.textContent);
}

// Run sync on load and resize to keep sidebar values up-to-date
document.addEventListener('DOMContentLoaded', syncTopbarToSidebar);
window.addEventListener('resize', syncTopbarToSidebar);
