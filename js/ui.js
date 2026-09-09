// ============================================================
// UI HELPERS
// ============================================================

// ===== THEME =====
function toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    document.documentElement.classList.toggle('dark', !isLight);
    localStorage.setItem('roflix-theme', isLight ? 'light' : 'dark');
    updateThemeIcon(isLight);
}

function updateThemeIcon(isLight) {
    const icon = document.getElementById('theme-icon');
    if (icon) {
        icon.className = isLight
            ? 'fa-solid fa-sun text-sm text-yellow-500'
            : 'fa-solid fa-moon text-sm text-yellow-400';
    }
}

// ===== TOAST =====
function showToast(type, title, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast-ios show`;
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="toast-icon ${type}">
                <i class="fa-solid ${icons[type] || icons.info}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <h4 class="text-sm font-bold text-white">${escapeHtml(title)}</h4>
                <p class="text-xs text-gray-400 mt-0.5">${escapeHtml(message)}</p>
            </div>
            <button onclick="this.closest('.toast-ios').remove()" class="text-gray-500 hover:text-white transition flex-shrink-0">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// ===== GEM FLY =====
function showGemFly(amount) {
    const container = document.getElementById('gem-fly-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'gem-fly';
    el.textContent = `+${amount} 💎`;
    el.style.left = (window.innerWidth / 2 - 50) + 'px';
    el.style.top = (window.innerHeight / 2) + 'px';
    el.style.fontSize = '2.5rem';
    el.style.fontWeight = '900';
    el.style.color = '#f59e0b';
    el.style.textShadow = '0 0 40px rgba(245,158,11,0.5)';
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// ===== NAVIGATION =====
function navigateTo(page, params = {}) {
    const pageMap = {
        'home': 'view-main-site',
        'detail': 'view-detail-page',
        'player': 'view-play-page',
        'profile': 'view-profile-page',
        'landing': 'view-landing-page'
    };
    
    const targetId = pageMap[page];
    if (!targetId) return;
    
    const targetView = document.getElementById(targetId);
    if (!targetView) return;
    
    // Ẩn tất cả views
    document.querySelectorAll('.page-view').forEach(el => {
        el.classList.add('hidden-view');
    });
    
    // Hiện view đích
    targetView.classList.remove('hidden-view');
    
    // Cuộn lên đầu
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.add('hidden');
}

// ===== PARTICLES =====
// Particles đã được khởi tạo trong app.js
