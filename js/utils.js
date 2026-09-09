// ============================================================
// UTILITY FUNCTIONS
// ============================================================

// Escape HTML để tránh XSS
function escapeHtml(text) {
    if (!text) return '';
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
}

// Kiểm tra URL poster hợp lệ
function isValidPosterUrl(url) {
    return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

// Lấy poster từ nhiều trường khác nhau
function pickPoster(item) {
    const candidates = [item.poster_url, item.thumb_url, item.poster, item.thumb];
    for (const c of candidates) {
        if (isValidPosterUrl(c)) return c.trim();
    }
    return '';
}

// Debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Lấy current user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('roflix-current-user') || 'null');
}

// Strip HTML tags
function stripHtml(html) {
    const d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
}

// Format số
function formatNumber(num) {
    return num.toLocaleString('vi-VN');
}

// Format thời gian
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleDateString('vi-VN');
}

// Lấy ngày hôm nay
function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Generate random ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Truncate text
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}

// Kiểm tra object rỗng
function isEmpty(obj) {
    return !obj || Object.keys(obj).length === 0;
}

// Deep clone object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
