// ============================================================
// MOVIE HANDLING
// ============================================================

let currentState = {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    keyword: '',
    list: 'phim-moi-cap-nhat',
    genre: '',
    country: '',
    homePriority: true,
    favorites: false
};

function mapMovieData(item) {
    const categories = Array.isArray(item.category) 
        ? item.category.map(c => c.name || c).filter(Boolean)
        : [];
    
    let type = 'Phim Lẻ';
    if (item.type === 'series' || item.episode_total > 1 || item.episode_current?.includes('Tập')) {
        type = 'Phim Bộ';
    }
    
    let status = 'Đang cập nhật';
    if (item.status === 'completed') status = 'Hoàn thành';
    else if (item.status === 'ongoing') status = 'Đang chiếu';
    else if (item.chieurap) status = 'Đang chiếu rạp';
    
    let ratingRaw = item.tmdb?.vote_average || item.imdb?.rating || item.rating || 0;
    ratingRaw = parseFloat(ratingRaw) || 0;
    const rating = ratingRaw > 0 ? ratingRaw.toFixed(1) : 'N/A';
    const imdbId = item.imdb?.id || null;
    const tmdbId = item.tmdb?.id || null;
    const tmdbType = item.tmdb?.type || 'movie';
    
    return {
        slug: item.slug || '',
        title: item.name || 'Không có tiêu đề',
        origin_name: item.origin_name || '',
        type: type,
        genre: categories,
        year: item.year || 'N/A',
        rating: rating,
        imdbId: imdbId,
        tmdbId: tmdbId,
        tmdbType: tmdbType,
        views: item.view || '0',
        status: status,
        poster: pickPoster(item) || 'https://placehold.co/300x400/1a1a1a/666?text=No+Image',
        thumb: pickPoster(item),
        summary: item.content || 'Chưa có tóm tắt',
        episodes: item.episodes || [],
        quality: item.quality || 'HD',
        lang: item.lang || 'Vietsub',
        episode_total: item.episode_total || 0,
        episode_current: item.episode_current || '',
        actors: item.actor || [],
        directors: item.director || [],
        trailer: item.trailer_url || ''
    };
}

async function loadMovies(params = {}) {
    const state = { ...currentState, ...params };
    currentState = state;
    
    const result = await fetchMovies(state.page, {
        keyword: state.keyword,
        list: state.list,
        genre: state.genre,
        country: state.country,
        homePriority: state.homePriority && !state.keyword && !state.genre && !state.country && !state.favorites
    });
    
    // Nếu là favorites, filter theo danh sách yêu thích
    let movies = result.movies;
    if (state.favorites) {
        const favs = getFavorites();
        movies = movies.filter(m => favs.includes(m.slug));
        result.totalPages = 1;
        result.totalItems = movies.length;
    }
    
    currentState.totalPages = result.totalPages;
    currentState.totalItems = result.totalItems;
    
    const mappedMovies = movies.map(mapMovieData);
    renderMovieGrid(mappedMovies);
    updatePagination(currentState.page, currentState.totalPages);
    updateMovieCount(mappedMovies.length, currentState.totalItems);
    
    return mappedMovies;
}

function renderMovieGrid(movies) {
    const container = document.getElementById('movie-grid-container');
    if (!container) return;
    
    if (!movies || movies.length === 0) {
        container.innerHTML = getEmptyStateHTML();
        return;
    }
    
    container.innerHTML = movies.map((m, index) => `
        <div onclick="viewMovieDetail('${m.slug}')" class="movie-card-premium">
            <div class="card-poster">
                <img src="${m.poster}" alt="${escapeHtml(m.title)}" loading="lazy"
                     onerror="this.src='https://placehold.co/300x400/1a1a1a/666?text=No+Image'">
                <div class="card-overlay">
                    <button class="watch-btn btn-ripple" onclick="event.stopPropagation(); playMovie('${m.slug}')">
                        <i class="fa-solid fa-play"></i> Xem Ngay
                    </button>
                    <div class="card-actions">
                        <button onclick="event.stopPropagation(); toggleFavorite('${m.slug}')" title="Yêu thích">
                            <i class="fa-${isFavorite(m.slug) ? 'solid' : 'regular'} fa-heart"></i>
                        </button>
                        <button onclick="event.stopPropagation(); viewMovieDetail('${m.slug}')" title="Chi tiết">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                    </div>
                </div>
                <div class="card-badges">
                    ${parseFloat(m.rating) >= 8 ? '<span class="badge hot">🔥 Hot</span>' : ''}
                    ${m.episode_total > 1 ? `<span class="badge eps">${m.episode_total} Tập</span>` : '<span class="badge eps">HD</span>'}
                    ${m.status === 'Hoàn thành' ? '<span class="badge" style="background: #10b981; color: white;">✅ Full</span>' : ''}
                </div>
            </div>
            <div class="card-info">
                <div class="card-title">${escapeHtml(m.title)}</div>
                <div class="card-meta">
                    <span class="rating"><i class="fa-solid fa-star"></i> ${m.rating || 'N/A'}</span>
                    <span>${m.year}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getEmptyStateHTML() {
    const msg = currentState.keyword 
        ? `Không có kết quả cho "${currentState.keyword}"`
        : currentState.favorites 
            ? 'Bạn chưa có phim yêu thích nào'
            : 'Chưa có phim mới';
    return `
        <div class="col-span-full">
            <div class="empty-state">
                <div class="empty-icon"><i class="fa-solid fa-film"></i></div>
                <h3>${currentState.keyword ? 'Không tìm thấy phim' : currentState.favorites ? 'Chưa có phim yêu thích' : 'Chưa có phim mới'}</h3>
                <p>${msg}</p>
                ${currentState.keyword ? `<button onclick="clearSearch()" class="empty-btn">Xem tất cả</button>` : ''}
                ${currentState.favorites ? `<button onclick="showAllMovies()" class="empty-btn">Xem phim mới</button>` : ''}
            </div>
        </div>
    `;
}

function updatePagination(currentPage, totalPages) {
    const container = document.getElementById('pagination-container');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = `<div class="flex items-center justify-center gap-2 flex-wrap">`;
    if (currentPage > 1) {
        html += `<button onclick="goToPage(${currentPage - 1})" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm transition">‹</button>`;
    }
    
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<button onclick="goToPage(1)" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm transition">1</button>`;
        if (startPage > 2) html += `<span class="px-2 text-gray-500">...</span>`;
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `<button onclick="goToPage(${i})" class="px-4 py-2 rounded-xl ${i === currentPage ? 'bg-amber-500 text-black font-bold' : 'bg-gray-800 hover:bg-gray-700 text-white'} text-sm transition">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="px-2 text-gray-500">...</span>`;
        html += `<button onclick="goToPage(${totalPages})" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm transition">${totalPages}</button>`;
    }
    
    if (currentPage < totalPages) {
        html += `<button onclick="goToPage(${currentPage + 1})" class="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm transition">›</button>`;
    }
    html += `</div>`;
    container.innerHTML = html;
}

function updateMovieCount(count, total) {
    const el = document.getElementById('movie-count');
    if (el) {
        el.textContent = total > 0 ? `${count} / ${formatNumber(total)}` : String(count);
    }
}

async function goToPage(page) {
    if (page < 1 || page > currentState.totalPages || page === currentState.page) return;
    currentState.page = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    await loadMovies(currentState);
}

function showAllMovies() {
    currentState.keyword = '';
    currentState.genre = '';
    currentState.country = '';
    currentState.homePriority = true;
    currentState.favorites = false;
    currentState.list = 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = 'Phim Âu Mỹ & Hàn nổi bật';
    
    const searchInput = document.getElementById('search-input');
    const searchMobile = document.getElementById('search-input-mobile');
    if (searchInput) searchInput.value = '';
    if (searchMobile) searchMobile.value = '';
    
    navigateTo('home');
    loadMovies(currentState);
}

async function clearSearch() {
    currentState.keyword = '';
    currentState.genre = '';
    currentState.country = '';
    currentState.homePriority = true;
    currentState.favorites = false;
    currentState.list = 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = 'Phim Âu Mỹ & Hàn nổi bật';
    
    const searchInput = document.getElementById('search-input');
    const searchMobile = document.getElementById('search-input-mobile');
    if (searchInput) searchInput.value = '';
    if (searchMobile) searchMobile.value = '';
    
    await loadMovies(currentState);
}

function filterByList(endpointKey, title) {
    currentState.keyword = '';
    currentState.genre = '';
    currentState.country = '';
    currentState.homePriority = false;
    currentState.favorites = false;
    currentState.list = ENDPOINTS[endpointKey] || endpointKey || 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = title || 'Danh sách phim';
    
    const searchInput = document.getElementById('search-input');
    const searchMobile = document.getElementById('search-input-mobile');
    if (searchInput) searchInput.value = '';
    if (searchMobile) searchMobile.value = '';
    
    navigateTo('home');
    loadMovies(currentState);
}

function filterByGenre(slug, title) {
    currentState.keyword = '';
    currentState.genre = slug;
    currentState.country = '';
    currentState.homePriority = false;
    currentState.favorites = false;
    currentState.list = 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = 'Thể Loại: ' + (title || slug);
    
    const searchInput = document.getElementById('search-input');
    const searchMobile = document.getElementById('search-input-mobile');
    if (searchInput) searchInput.value = '';
    if (searchMobile) searchMobile.value = '';
    
    navigateTo('home');
    loadMovies(currentState);
}

function filterByCountry(slug, title) {
    currentState.keyword = '';
    currentState.genre = '';
    currentState.country = slug;
    currentState.homePriority = false;
    currentState.favorites = false;
    currentState.list = 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = title || slug;
    
    const searchInput = document.getElementById('search-input');
    const searchMobile = document.getElementById('search-input-mobile');
    if (searchInput) searchInput.value = '';
    if (searchMobile) searchMobile.value = '';
    
    navigateTo('home');
    loadMovies(currentState);
}

function filterBy(key, value) {
    if (key === 'type') {
        if (value === 'Phim Lẻ') return filterByList('phim-le', 'Phim Lẻ');
        if (value === 'Phim Bộ') return filterByList('phim-bo', 'Phim Bộ');
    }
    if (key === 'list') {
        return filterByList(value, arguments[2] || value);
    }
    if (key === 'genre') {
        return filterByGenre(value, value);
    }
    if (key === 'country') {
        return filterByCountry(value, value);
    }
    if (key === 'rating') {
        // Rating filter - show high rated movies
        currentState.keyword = '';
        currentState.genre = '';
        currentState.country = '';
        currentState.homePriority = false;
        currentState.favorites = false;
        currentState.list = 'phim-moi-cap-nhat';
        currentState.page = 1;
        
        const titleEl = document.getElementById('list-title');
        if (titleEl) titleEl.textContent = '⭐ Đánh giá cao';
        
        // API doesn't support rating filter directly, so we filter on client side
        // For now, just load movies and let the user know
        showToast('info', 'BXH', 'Đang tải phim đánh giá cao...');
        loadMovies(currentState);
        return;
    }
    
    // Default: search by value
    currentState.keyword = String(value);
    currentState.genre = '';
    currentState.country = '';
    currentState.homePriority = false;
    currentState.favorites = false;
    currentState.list = 'phim-moi-cap-nhat';
    currentState.page = 1;
    
    const titleEl = document.getElementById('list-title');
    if (titleEl) titleEl.textContent = `Kết quả: "${value}"`;
    
    navigateTo('home');
    loadMovies(currentState);
}
