// Index Page JavaScript

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all feature cards and benefit items
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.feature-card, .benefit-item');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
});

// Add particle effect on hero section
function createParticle() {
    const hero = document.querySelector('.hero-section');
    const particle = document.createElement('div');
    particle.style.position = 'absolute';
    particle.style.width = '4px';
    particle.style.height = '4px';
    particle.style.background = 'rgba(255, 215, 0, 0.6)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.pointerEvents = 'none';
    particle.style.animation = 'twinkle 2s ease-in-out infinite';
    
    hero.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 2000);
}

// Add twinkle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0; transform: scale(0); }
        50% { opacity: 1; transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Create particles periodically
setInterval(createParticle, 500);

// ===== LOGIN FUNCTIONALITY =====

// Hash password function
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

// Show login modal
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('loginUsername').focus();
}

// Close login modal
function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').style.display = 'none';
}

// Show error message
function showLoginError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    // Find user in users list
    const users = window.getUsers ? window.getUsers() : (JSON.parse(localStorage.getItem('users')||'[]'));
    const user = users.find(u => u.username === username);
    if (!user) {
        showLoginError('No such user. Please sign up first.');
        return;
    }

    const enteredPasswordHash = await hashPassword(password);
    if (enteredPasswordHash === user.passHash) {
        // Login successful
        localStorage.setItem('admin_logged_in', 'yes');
        // Set current_user with fallback if common.js isn't loaded
        try {
            if (typeof window.setCurrentUser === 'function') window.setCurrentUser(username);
            else localStorage.setItem('current_user', username);
        } catch (e) {
            localStorage.setItem('current_user', username);
        }

        const errorDiv = document.getElementById('loginError');
        errorDiv.textContent = '✅ Login Successful! Redirecting...';
        errorDiv.style.display = 'block';
        errorDiv.style.background = '#d4edda';
        errorDiv.style.color = '#155724';
        console.log('Login succeeded for', username);

        setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);
    } else {
        console.log('Login failed for', username);
        showLoginError('❌ Invalid username or password!');
        document.getElementById('loginPassword').value = '';
    }
}

// Show setup info
function showSetupInfo() {
    alert('To setup an admin account:\n\n1. Open browser console (F12)\n2. Run these commands:\n\nlocalStorage.setItem("admin_user", "admin");\nlocalStorage.setItem("admin_pass", "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918");\n\nDefault credentials:\nUsername: admin\nPassword: admin\n\nYou can change these later.');
}

// Close modal when clicking outside
// ===== SIGNUP FUNCTIONALITY =====

// Show signup modal
function showSignupModal() {
    const modal = document.getElementById('signupModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('signupUsername').focus();
}

// Close signup modal
function closeSignupModal() {
    const modal = document.getElementById('signupModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    const form = document.getElementById('signupForm');
    if (form) form.reset();
    const err = document.getElementById('signupError');
    if (err) err.style.display = 'none';
}

// Show signup error
function showSignupError(message) {
    const errorDiv = document.getElementById('signupError');
    if (!errorDiv) return;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
}

// Handle signup
async function handleSignup(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirmPassword').value;

    if (!username) { showSignupError('Please enter a username'); return; }
    if (password.length < 4) { showSignupError('Password must be at least 4 characters'); return; }
    if (password !== confirm) { showSignupError('Passwords do not match'); return; }

    // Use users array
    const hashed = await hashPassword(password);
    const added = window.addUser ? window.addUser(username, hashed) : (function(){
        const users = JSON.parse(localStorage.getItem('users')||'[]');
        if (users.find(u=>u.username===username)) return false;
        users.push({ id: Date.now().toString(), username, passHash: hashed });
        localStorage.setItem('users', JSON.stringify(users));
        return true;
    })();

    if (!added) { showSignupError('Username already exists. Choose another.'); return; }

    const errorDiv = document.getElementById('signupError');
    errorDiv.textContent = '✅ Account created successfully! Please login.';
    errorDiv.style.display = 'block';
    errorDiv.style.background = '#d4edda';
    errorDiv.style.color = '#155724';

    setTimeout(() => { closeSignupModal(); showLoginModal(); }, 800);
}

// Close modal when clicking outside (handles both login and signup)
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    if (event.target === loginModal) closeLoginModal();
    if (signupModal && event.target === signupModal) closeSignupModal();
};
