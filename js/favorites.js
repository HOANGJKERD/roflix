// ============================================================
// FAVORITES SYSTEM
// ============================================================

function getFavorites() {
    return JSON.parse(localStorage.getItem('roflix-favs') || '[]');
}

function isFavorite(slug) {
    return getFavorites().includes(slug);
}

function toggleFavorite(slug) {
    let favs = getFavorites();
    if (favs.includes(slug)) {
        favs = favs.filter(id => id !== slug);
        showToast('info', 'Đã xóa', 'Đã xóa khỏi danh sách yêu thích');
    } else {
        favs.push(slug);
        showToast('success', 'Đã thêm', 'Đã thêm vào danh sách yêu thích! +2 RoGem');
        addGem(2, true);
        addExp(2);
        updateDailyQuestProgress('favorite');
    }
    localStorage.setItem('roflix-favs', JSON.stringify(favs));
    
    const stats = getStats();
    stats.totalFavorites = favs.length;
    saveStats(stats);
    
    // Cập nhật lại giao diện
    loadMovies(currentState);
}

function showFavorites() {
    currentState.keyword = '';
    currentState.genre = '';
    currentState.country = '';
    currentState.homePriority = false;
    currentState.favorites = true;
    currentState.list = 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = '📚 Phim Yêu Thích';
    
    const searchInput = document.getElementById('search-input');
    const searchMobile = document.getElementById('search-input-mobile');
    if (searchInput) searchInput.value = '';
    if (searchMobile) searchMobile.value = '';
    
    navigateTo('home');
    loadMovies(currentState);
}

function renderFavoritesTab() {
    const container = document.getElementById('favorites-grid');
    if (!container) return;
    
    const favIds = getFavorites();
    if (favIds.length === 0) {
        container.innerHTML = `
            <div class="col-span-full empty-state" style="padding:40px;">
                <div class="empty-icon"><i class="fa-regular fa-heart"></i></div>
                <h3>Chưa có phim yêu thích</h3>
                <p>Hãy thêm phim vào danh sách yêu thích của bạn!</p>
            </div>
        `;
        return;
    }
    
    // Lấy danh sách phim yêu thích từ API
    fetchMovies(1).then(result => {
        const favMovies = result.movies.filter(m => favIds.includes(m.slug));
        if (favMovies.length === 0) {
            container.innerHTML = `
                <div class="col-span-full empty-state" style="padding:40px;">
                    <div class="empty-icon"><i class="fa-regular fa-heart"></i></div>
                    <h3>Không tìm thấy phim yêu thích</h3>
                    <p>Có thể phim đã bị xóa hoặc thay đổi.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = favMovies.map(m => {
            const poster = m.poster_url || m.thumb_url || 'https://placehold.co/300x400';
            return `
                <div onclick="viewMovieDetail('${m.slug}')" class="glass-panel rounded-2xl overflow-hidden cursor-pointer card-hover-effect">
                    <div class="relative aspect-[2/3]">
                        <img src="${poster}" class="w-full h-full object-cover" alt="${escapeHtml(m.name)}" loading="lazy">
                    </div>
                    <div class="p-3">
                        <h4 class="font-bold text-sm truncate text-white">${escapeHtml(m.name)}</h4>
                    </div>
                </div>
            `;
        }).join('');
    });
}
