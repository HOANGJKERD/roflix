// ============================================================
// API CALLS
// ============================================================

async function fetchMovies(page = 1, params = {}) {
    try {
        const { 
            keyword = '', 
            list = 'phim-moi-cap-nhat', 
            genre = '', 
            country = '',
            homePriority = false 
        } = params;

        let url;
        
        if (keyword) {
            url = `${CONFIG.API_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`;
        } else if (genre) {
            url = `${CONFIG.API_BASE}/the-loai/${genre}?page=${page}`;
        } else if (country) {
            url = `${CONFIG.API_BASE}/quoc-gia/${country}?page=${page}`;
        } else if (homePriority) {
            return await fetchHomePriorityMovies(page);
        } else {
            url = `${CONFIG.API_BASE}/danh-sach/${list}?page=${page}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        const movies = data.items || data.data || data.movies || [];
        const pagination = data.pagination || { 
            totalPages: data.last_page || data.total_pages || 1,
            totalItems: data.total || movies.length,
            currentPage: page
        };
        
        return {
            movies: movies.filter(m => pickPoster(m)),
            totalPages: pagination.totalPages || 1,
            totalItems: pagination.totalItems || movies.length,
            currentPage: pagination.currentPage || page
        };
    } catch (error) {
        console.error('Lỗi tải phim:', error);
        showToast('error', 'Lỗi kết nối', 'Không thể tải danh sách phim!');
        return { movies: [], totalPages: 1, totalItems: 0, currentPage: 1 };
    }
}

async function fetchHomePriorityMovies(page = 1) {
    try {
        const [auRes, krRes] = await Promise.all([
            fetch(`${CONFIG.API_BASE}/quoc-gia/au-my?page=${page}`),
            fetch(`${CONFIG.API_BASE}/quoc-gia/han-quoc?page=${page}`)
        ]);
        
        if (!auRes.ok && !krRes.ok) throw new Error('Home priority fetch failed');
        
        const auData = auRes.ok ? await auRes.json() : { items: [] };
        const krData = krRes.ok ? await krRes.json() : { items: [] };
        
        const au = (auData.items || []).filter(m => pickPoster(m));
        const kr = (krData.items || []).filter(m => pickPoster(m));
        
        // Xen kẽ 2 Âu Mỹ : 1 Hàn
        const merged = [];
        let i = 0, j = 0;
        while (i < au.length || j < kr.length) {
            if (i < au.length) merged.push(au[i++]);
            if (i < au.length) merged.push(au[i++]);
            if (j < kr.length) merged.push(kr[j++]);
        }
        
        const auTotal = auData.pagination?.totalItems || 0;
        const krTotal = krData.pagination?.totalItems || 0;
        
        return {
            movies: merged,
            totalPages: Math.max(auData.pagination?.totalPages || 1, krData.pagination?.totalPages || 1),
            totalItems: auTotal + krTotal,
            currentPage: page
        };
    } catch (error) {
        console.error('Lỗi tải home priority:', error);
        return { movies: [], totalPages: 1, totalItems: 0, currentPage: 1 };
    }
}

async function fetchMovieDetail(slug) {
    try {
        const response = await fetch(`${CONFIG.API_BASE}/phim/${slug}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const movie = data.movie || data.data || data;
        if (data.episodes && !movie.episodes) {
            movie.episodes = data.episodes;
        }
        return movie;
    } catch (error) {
        console.error('Lỗi tải chi tiết phim:', error);
        showToast('error', 'Lỗi', 'Không thể tải thông tin phim!');
        return null;
    }
}

async function searchMovies(keyword, page = 1) {
    return fetchMovies(page, { keyword });
}

async function fetchHeroMovies() {
    try {
        const res = await fetch(`${CONFIG.API_BASE}/quoc-gia/au-my?page=1`);
        if (!res.ok) throw new Error('hero fetch failed');
        const data = await res.json();
        let items = (data.items || []).filter(m => pickPoster(m)).slice(0, 8);
        
        if (items.length < 4) {
            const extra = await fetch(`${CONFIG.API_BASE}/tim-kiem?keyword=2024&page=1`);
            if (extra.ok) {
                const ed = await extra.json();
                const more = (ed.items || []).filter(m => pickPoster(m));
                items = [...items, ...more].slice(0, 8);
            }
        }
        
        return items;
    } catch (error) {
        console.error('Lỗi tải hero:', error);
        return [];
    }
}
