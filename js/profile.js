// ============================================================
// PROFILE MANAGEMENT
// ============================================================

function getProfile() {
    return JSON.parse(localStorage.getItem('roflix-profile')) || {
        name: 'Người dùng',
        avatar: 'default',
        bio: 'Chào mừng đến với RoFlix! 🎬',
        banner: 'default',
        country: 'Việt Nam',
        favoriteMovie: '',
        birthday: '',
        joinDate: getToday()
    };
}

function saveProfile(data) {
    localStorage.setItem('roflix-profile', JSON.stringify(data));
}

function renderProfile() {
    const profile = getProfile();
    const levelData = getLevelData();
    const gems = getGem();
    const stats = getStats();
    const cards = getCards();
    const achievements = getAchievements();
    const favorites = getFavorites();
    
    const nameEl = document.getElementById('profile-display-name');
    if (nameEl) nameEl.textContent = profile.name || 'Người dùng';
    
    const levelBadge = document.getElementById('profile-level-badge');
    if (levelBadge) levelBadge.textContent = `Lv.${levelData.level}`;
    
    const bioEl = document.getElementById('profile-bio');
    if (bioEl) bioEl.textContent = profile.bio || 'Chưa có giới thiệu';
    
    const joinDateEl = document.getElementById('profile-join-date');
    if (joinDateEl) joinDateEl.textContent = profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('vi-VN') : '01/01/2026';
    
    const gemEl = document.getElementById('profile-gem');
    if (gemEl) gemEl.textContent = gems.toLocaleString();
    
    const expToNext = getExpToNextLevel(levelData.level);
    const expPercent = Math.min((levelData.exp / expToNext) * 100, 100);
    const expBar = document.getElementById('profile-exp-bar');
    if (expBar) expBar.style.width = expPercent + '%';
    
    const expText = document.getElementById('profile-exp-text');
    if (expText) expText.textContent = `${levelData.exp} / ${expToNext} EXP`;
    
    const statMovies = document.getElementById('stat-movies');
    if (statMovies) statMovies.textContent = stats.totalMoviesWatched || 0;
    
    const statEpisodes = document.getElementById('stat-episodes');
    if (statEpisodes) statEpisodes.textContent = stats.totalEpisodesWatched || 0;
    
    const statGem = document.getElementById('stat-gem');
    if (statGem) statGem.textContent = gems.toLocaleString();
    
    const statFavorites = document.getElementById('stat-favorites');
    if (statFavorites) statFavorites.textContent = favorites.length || 0;
    
    const statComments = document.getElementById('stat-comments');
    if (statComments) statComments.textContent = stats.totalComments || 0;
    
    const statAchievements = document.getElementById('stat-achievements');
    if (statAchievements) statAchievements.textContent = achievements.length || 0;
    
    const avatarImg = document.getElementById('profile-avatar');
    if (avatarImg) {
        if (profile.avatar && profile.avatar !== 'default') {
            avatarImg.src = profile.avatar;
        } else {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=f59e0b&color=000&size=120`;
        }
    }
    
    const bannerImg = document.getElementById('banner-img');
    const bannerPlaceholder = document.getElementById('banner-placeholder');
    if (bannerImg && bannerPlaceholder) {
        if (profile.banner && profile.banner !== 'default' && profile.banner.startsWith('http')) {
            bannerImg.src = profile.banner;
            bannerImg.style.display = 'block';
            bannerPlaceholder.style.display = 'none';
        } else {
            bannerImg.style.display = 'none';
            bannerPlaceholder.style.display = 'flex';
        }
    }
    
    const movieCount = document.getElementById('profile-movie-count');
    if (movieCount) movieCount.textContent = stats.totalMoviesWatched || 0;
    
    const gachaGemCount = document.getElementById('gacha-gem-count');
    if (gachaGemCount) gachaGemCount.textContent = gems;
    
    updateDailyQuest();
    renderCollection();
    renderAchievements();
    renderFavoritesTab();
    renderHistoryTab();
    renderLeaderboard();
}

function updateProfileUI() {
    renderProfile();
}

function initProfile() {
    if (!localStorage.getItem('roflix-profile')) {
        const profile = {
            name: 'Người dùng',
            avatar: 'default',
            bio: 'Chào mừng đến với RoFlix! 🎬',
            banner: 'default',
            country: 'Việt Nam',
            favoriteMovie: '',
            birthday: '',
            joinDate: getToday()
        };
        saveProfile(profile);
    }
}

function navigateToProfile() {
    renderProfile();
    navigateTo('profile');
}

function openEditProfile() {
    const profile = getProfile();
    const nameEl = document.getElementById('edit-name');
    const bioEl = document.getElementById('edit-bio');
    const countryEl = document.getElementById('edit-country');
    const favMovieEl = document.getElementById('edit-fav-movie');
    const birthdayEl = document.getElementById('edit-birthday');
    const bannerEl = document.getElementById('edit-banner');
    
    if (nameEl) nameEl.value = profile.name || '';
    if (bioEl) bioEl.value = profile.bio || '';
    if (countryEl) countryEl.value = profile.country || 'Việt Nam';
    if (favMovieEl) favMovieEl.value = profile.favoriteMovie || '';
    if (birthdayEl) birthdayEl.value = profile.birthday || '';
    if (bannerEl) bannerEl.value = profile.banner !== 'default' ? profile.banner : '';
    
    const modal = document.getElementById('edit-profile-modal');
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('open'), 10);
}

function closeEditProfile() {
    const modal = document.getElementById('edit-profile-modal');
    modal.classList.remove('open');
    setTimeout(() => modal.classList.add('hidden'), 400);
}

// Event listener cho form edit profile
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('edit-profile-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const profile = getProfile();
            
            const nameEl = document.getElementById('edit-name');
            const bioEl = document.getElementById('edit-bio');
            const countryEl = document.getElementById('edit-country');
            const favMovieEl = document.getElementById('edit-fav-movie');
            const birthdayEl = document.getElementById('edit-birthday');
            const bannerEl = document.getElementById('edit-banner');
            
            profile.name = nameEl ? nameEl.value.trim() || 'Người dùng' : 'Người dùng';
            profile.bio = bioEl ? bioEl.value.trim() || 'Chào mừng đến với RoFlix! 🎬' : 'Chào mừng đến với RoFlix! 🎬';
            profile.country = countryEl ? countryEl.value : 'Việt Nam';
            profile.favoriteMovie = favMovieEl ? favMovieEl.value.trim() : '';
            profile.birthday = birthdayEl ? birthdayEl.value : '';
            
            const bannerUrl = bannerEl ? bannerEl.value.trim() : '';
            if (bannerUrl && bannerUrl.startsWith('http')) {
                profile.banner = bannerUrl;
            } else {
                profile.banner = 'default';
            }
            
            saveProfile(profile);
            
            const user = getCurrentUser();
            if (user) {
                const users = getUsersFromStorage();
                const found = users.find(u => u.email === user.email);
                if (found) {
                    found.name = profile.name;
                    localStorage.setItem('roflix-users', JSON.stringify(users));
                    localStorage.setItem('roflix-current-user', JSON.stringify(found));
                    checkUserAuthStatus();
                }
            }
            
            closeEditProfile();
            renderProfile();
            showToast('success', '✅ Đã cập nhật!', 'Hồ sơ của bạn đã được lưu.');
        });
    }
});

function resetProfile() {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác!')) return;
    
    localStorage.removeItem('roflix-profile');
    localStorage.removeItem('roflix-level');
    localStorage.removeItem('roflix-gem');
    localStorage.removeItem('roflix-stats');
    localStorage.removeItem('roflix-achievements');
    localStorage.removeItem('roflix-cards');
    localStorage.removeItem('roflix-daily');
    localStorage.removeItem('roflix-ratings');
    localStorage.removeItem('roflix-favs');
    localStorage.removeItem('roflix-comments');
    localStorage.removeItem('roflix-watch-history');
    
    showToast('success', '🗑️ Đã xóa!', 'Toàn bộ dữ liệu đã được xóa.');
    setTimeout(() => window.location.reload(), 1000);
}
