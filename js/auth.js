// ============================================================
// AUTH SYSTEM
// ============================================================

function openAuthModal(mode = 'login') {
    switchAuthMode(mode);
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('open'), 10);
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('open');
    setTimeout(() => modal.classList.add('hidden'), 400);
}

function switchAuthMode(mode) {
    const loginBox = document.getElementById('login-form-box');
    const regBox = document.getElementById('register-form-box');
    if (mode === 'register') {
        loginBox.classList.add('hidden');
        regBox.classList.remove('hidden');
    } else {
        regBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    }
}

function getUsersFromStorage() {
    return JSON.parse(localStorage.getItem('roflix-users') || '[]');
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pwd = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm').value;

    if (pwd !== confirm) {
        showToast('error', 'Lỗi', 'Mật khẩu xác nhận không khớp!');
        return;
    }
    if (pwd.length < 6) {
        showToast('error', 'Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự!');
        return;
    }

    const users = getUsersFromStorage();
    if (users.find(u => u.email === email)) {
        showToast('error', 'Lỗi', 'Email này đã được sử dụng!');
        return;
    }

    const newUser = { name, email, password: pwd };
    users.push(newUser);
    localStorage.setItem('roflix-users', JSON.stringify(users));

    localStorage.setItem('roflix-current-user', JSON.stringify(newUser));
    checkUserAuthStatus();
    closeAuthModal();
    showToast('success', 'Đăng ký thành công!', `Chào mừng ${name} đến với RoFlix!`);
    
    const profile = getProfile();
    profile.name = name;
    saveProfile(profile);
}

function handleLogin(e) {
    e.preventDefault();
    const input = document.getElementById('login-email').value.trim();
    const pwd = document.getElementById('login-password').value;

    const users = getUsersFromStorage();
    const found = users.find(u => (u.email === input || u.name === input) && u.password === pwd);

    if (!found) {
        showToast('error', 'Lỗi', 'Email/Tên hoặc mật khẩu không chính xác!');
        return;
    }

    localStorage.setItem('roflix-current-user', JSON.stringify(found));
    checkUserAuthStatus();
    closeAuthModal();
    showToast('success', 'Đăng nhập thành công!', `Chào mừng ${found.name} trở lại!`);
}

function mockGoogleAuth() {
    const googleUser = { name: 'Google User', email: 'user@gmail.com' };
    localStorage.setItem('roflix-current-user', JSON.stringify(googleUser));
    checkUserAuthStatus();
    closeAuthModal();
    showToast('success', 'Đăng nhập thành công!', 'Chào mừng bạn đến với RoFlix!');
}

function handleLogout() {
    localStorage.removeItem('roflix-current-user');
    checkUserAuthStatus();
    showToast('info', 'Đã đăng xuất', 'Hẹn gặp lại bạn!');
}

function checkUserAuthStatus() {
    const user = getCurrentUser();
    const navContainer = document.getElementById('user-nav-container');

    if (user) {
        navContainer.innerHTML = `
            <div class="relative group">
                <button class="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-3.5 py-2 rounded-full text-xs flex items-center gap-2 shadow-md transition">
                    <i class="fa-solid fa-circle-user text-sm"></i>
                    <span class="max-w-[80px] truncate">${escapeHtml(user.name)}</span>
                    <i class="fa-solid fa-chevron-down text-[10px]"></i>
                </button>
                <div class="absolute right-0 mt-2 w-48 glass-premium p-2 flex flex-col gap-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <div class="px-3 py-2 border-b border-gray-800 text-[11px] text-gray-400 truncate">
                        ${escapeHtml(user.email || user.name)}
                    </div>
                    <a href="#" onclick="navigateToProfile(); return false;" class="text-xs py-2 px-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 flex items-center gap-2 text-gray-300 transition">
                        <i class="fa-solid fa-user"></i> Hồ sơ
                    </a>
                    <a href="#" onclick="showFavorites(); return false;" class="text-xs py-2 px-3 rounded-lg hover:bg-amber-500/10 hover:text-amber-500 flex items-center gap-2 text-gray-300 transition">
                        <i class="fa-solid fa-bookmark text-amber-500"></i> Yêu thích
                    </a>
                    <button onclick="handleLogout()" class="text-xs py-2 px-3 rounded-lg hover:bg-red-500/10 text-red-400 flex items-center gap-2 text-left w-full transition">
                        <i class="fa-solid fa-right-from-bracket"></i> Đăng xuất
                    </button>
                </div>
            </div>
        `;
    } else {
        navContainer.innerHTML = `
            <button onclick="openAuthModal('login')" class="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-gray-950 font-extrabold px-4 py-2 rounded-full text-xs flex items-center gap-2 shadow-md transition active:scale-95 btn-ripple">
                <i class="fa-solid fa-user"></i>
                <span class="hidden sm:inline">Thành viên</span>
            </button>
        `;
    }
}
