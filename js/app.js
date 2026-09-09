// ============================================================
// APP INITIALIZATION
// ============================================================

// Biến toàn cục
let currentSlug = '';
let currentEpisodeList = [];
let currentMovieTitle = '';

// ===== PARTICLES =====
(function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    if (prefersReduce) { canvas.style.display = 'none'; return; }

    const ctx = canvas.getContext('2d', { alpha: true });
    let particles = [];
    let w = 0, h = 0;
    let running = true;
    let last = 0;
    const COUNT = isMobile ? 12 : 24;
    const TARGET_FPS = isMobile ? 20 : 30;
    const FRAME_MS = 1000 / TARGET_FPS;

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    });
    resize();

    for (let i = 0; i < COUNT; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.6 + 0.4,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            opacity: Math.random() * 0.35 + 0.08,
            color: Math.random() > 0.5 ? '#f59e0b' : '#8b5cf6'
        });
    }

    function tick(ts) {
        if (!running) return;
        requestAnimationFrame(tick);
        if (ts - last < FRAME_MS) return;
        last = ts;
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
    requestAnimationFrame(tick);

    document.addEventListener('visibilitychange', () => {
        running = document.visibilityState === 'visible';
        if (running) {
            last = 0;
            requestAnimationFrame(tick);
        }
    });
})();

// ===== HERO SLIDER =====
let heroSlides = [];
let heroIndex = 0;
let heroTimer = null;

async function initHeroSlider() {
    try {
        const items = await fetchHeroMovies();
        heroSlides = items
            .map(mapMovieData)
            .filter(m => m.slug && isValidPosterUrl(m.poster))
            .slice(0, 8);
        
        if (!heroSlides.length) return;
        
        renderHeroDots();
        showHeroSlide(0, false);
        startHeroAutoplay();
        
        const section = document.getElementById('hero-section');
        if (section) {
            section.addEventListener('mouseenter', stopHeroAutoplay);
            section.addEventListener('mouseleave', startHeroAutoplay);
        }
    } catch (e) {
        console.error('Hero slider error:', e);
    }
}

function renderHeroDots() {
    const dots = document.getElementById('hero-dots');
    if (!dots) return;
    dots.innerHTML = heroSlides.map((_, i) =>
        `<button type="button" class="dot ${i === heroIndex ? 'active' : ''}" onclick="heroGoTo(${i})" aria-label="Slide ${i + 1}"></button>`
    ).join('');
}

function showHeroSlide(index, animate = true) {
    if (!heroSlides.length) return;
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    const m = heroSlides[heroIndex];
    const box = document.getElementById('hero-content-box');
    const bg = document.getElementById('hero-background');
    const ratingEl = document.getElementById('hero-rating');
    const hotEl = document.getElementById('hero-hot');
    const mainEl = document.getElementById('hero-title-main');
    const subEl = document.getElementById('hero-title-sub');
    const descEl = document.getElementById('hero-desc');
    const btnDetail = document.getElementById('hero-btn-detail');
    const btnPlay = document.getElementById('hero-btn-play');

    const apply = () => {
        const poster = m.thumb || m.poster;
        if (bg && poster) {
            bg.style.backgroundImage = `
                linear-gradient(135deg, rgba(9,10,15,0.92) 0%, rgba(18,20,29,0.72) 45%, rgba(9,10,15,0.92) 100%),
                url('${poster}')`;
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
        }
        if (ratingEl) ratingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${m.rating || 'N/A'}`;
        if (hotEl) {
            const hot = parseFloat(m.rating) >= 7.5;
            hotEl.style.display = hot ? '' : 'none';
        }
        const title = m.title || 'Phim nổi bật';
        const parts = title.split(/\s[-–—]\s/);
        if (parts.length > 1) {
            if (mainEl) mainEl.textContent = parts[0];
            if (subEl) subEl.textContent = ' - ' + parts.slice(1).join(' - ');
        } else {
            if (mainEl) mainEl.textContent = title;
            if (subEl) subEl.textContent = m.year && m.year !== 'N/A' ? ` (${m.year})` : '';
        }
        if (descEl) {
            let desc = stripHtml(m.summary || m.origin_name || '');
            if (!desc || desc === 'Chưa có tóm tắt') {
                desc = m.origin_name
                    ? `${m.origin_name}${m.year && m.year !== 'N/A' ? ' · ' + m.year : ''} · ${m.type || 'Phim'}`
                    : 'Phim nổi bật đang được cập nhật trên RoFlix.';
            }
            if (desc.length > 180) desc = desc.slice(0, 177) + '...';
            descEl.textContent = desc;
        }
        if (btnDetail) btnDetail.setAttribute('onclick', `viewMovieDetail('${m.slug}')`);
        if (btnPlay) btnPlay.setAttribute('onclick', `playMovie('${m.slug}')`);
        renderHeroDots();
        if (box) {
            box.classList.remove('is-fading');
            box.classList.add('is-visible');
        }
    };

    if (animate && box) {
        box.classList.add('is-fading');
        box.classList.remove('is-visible');
        setTimeout(apply, 280);
    } else {
        apply();
    }
}

function heroNext() {
    showHeroSlide(heroIndex + 1);
    startHeroAutoplay();
}

function heroPrev() {
    showHeroSlide(heroIndex - 1);
    startHeroAutoplay();
}

function heroGoTo(i) {
    showHeroSlide(i);
    startHeroAutoplay();
}

function startHeroAutoplay() {
    stopHeroAutoplay();
    if (heroSlides.length < 2) return;
    heroTimer = setInterval(() => showHeroSlide(heroIndex + 1), CONFIG.HERO_INTERVAL || 7000);
}

function stopHeroAutoplay() {
    if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
    }
}

// ===== SEARCH =====
let searchTimeout = null;

function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const input = document.getElementById('search-input');
        const val = (input ? input.value : '').trim();
        if (typeof currentState !== 'undefined') {
            currentState.keyword = val;
            currentState.genre = '';
            currentState.country = '';
            currentState.homePriority = !val;
            currentState.favorites = false;
            currentState.list = 'phim-moi-cap-nhat';
            currentState.page = 1;
            const titleEl = document.getElementById('list-title');
            if (titleEl) titleEl.textContent = val ? `Kết quả: "${val}"` : 'Phim mới cập nhật';
            navigateTo('home');
            loadMovies(currentState);
        }
    }, 400);
}

function handleSearchMobile() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const input = document.getElementById('search-input-mobile');
        const val = (input ? input.value : '').trim();
        if (typeof currentState !== 'undefined') {
            currentState.keyword = val;
            currentState.genre = '';
            currentState.country = '';
            currentState.homePriority = !val;
            currentState.favorites = false;
            currentState.list = 'phim-moi-cap-nhat';
            currentState.page = 1;
            const titleEl = document.getElementById('list-title');
            if (titleEl) titleEl.textContent = val ? `Kết quả: "${val}"` : 'Phim mới cập nhật';
            closeMobileMenu();
            navigateTo('home');
            loadMovies(currentState);
        }
    }, 400);
}

// ===== VIEW MOVIE DETAIL =====
async function viewMovieDetail(slug) {
    if (!slug) {
        showToast('error', 'Lỗi', 'Không tìm thấy phim!');
        return;
    }
    
    const movieData = await fetchMovieDetail(slug);
    if (!movieData) return;
    
    const movie = mapMovieData(movieData);
    currentSlug = slug;
    currentMovieTitle = movie.title || '';
    const rating = getMovieRating(slug);
    const avg = rating.count > 0 ? (rating.total / rating.count) : 0;
    const isFav = isFavorite(slug);
    
    // Xử lý episodes
    let epList = [];
    if (movie.episodes && movie.episodes.length > 0) {
        movie.episodes.forEach(epGroup => {
            if (epGroup.server_data && epGroup.server_data.length > 0) {
                epGroup.server_data.forEach(ep => {
                    const link = ep.link_embed || ep.link_m3u8 || '';
                    if (!link) return;
                    epList.push({
                        name: String(ep.name || ep.slug || 'Full'),
                        link: link
                    });
                });
            }
        });
    }
    currentEpisodeList = epList;
    
    let episodesHTML = '';
    if (epList.length > 0) {
        episodesHTML = `
            <div>
                <h4 class="text-sm font-bold text-gray-400 mb-2">📺 Danh sách tập (${epList.length}):</h4>
                <div class="flex flex-wrap gap-2">
                    ${epList.map((ep, idx) => `
                        <button onclick="playMovieByIndex(${idx})" 
                                class="px-4 py-2 bg-gray-800 hover:bg-amber-500 hover:text-black rounded-xl text-xs font-bold transition">
                            Tập ${escapeHtml(ep.name)}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    const actorsHTML = movie.actors && movie.actors.length > 0 
        ? `<div class="flex flex-wrap gap-1 mt-1"><span class="text-gray-500">Diễn viên:</span> ${movie.actors.slice(0, 10).map(a => `<span class="text-xs bg-gray-800 px-2 py-1 rounded-full">${a}</span>`).join(' ')}</div>`
        : '';
    
    const directorsHTML = movie.directors && movie.directors.length > 0
        ? `<div class="flex flex-wrap gap-1"><span class="text-gray-500">Đạo diễn:</span> ${movie.directors.map(d => `<span class="text-xs bg-gray-800 px-2 py-1 rounded-full">${d}</span>`).join(' ')}</div>`
        : '';
    
    const container = document.getElementById('detail-content-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="glass-premium p-5 md:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="aspect-[2/3] rounded-2xl overflow-hidden border border-gray-800 shadow-xl">
                <img src="${movie.poster}" class="w-full h-full object-cover" alt="${escapeHtml(movie.title)}" 
                     onerror="this.src='https://placehold.co/300x400/1a1a1a/666?text=No+Image'">
            </div>
            <div class="md:col-span-3 flex flex-col justify-between space-y-5">
                <div>
                    <div class="flex justify-between items-start gap-3 flex-wrap">
                        <div>
                            <h1 class="text-2xl md:text-3xl font-black text-white">${escapeHtml(movie.title)}</h1>
                            <p class="text-sm mt-1 text-gray-400">${escapeHtml(movie.origin_name || '')}</p>
                        </div>
                        <button onclick="toggleFavorite('${slug}')" class="text-xs px-4 py-2.5 rounded-xl border border-gray-800 flex items-center gap-2 transition ${isFav ? 'bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20' : 'bg-gray-900/60 text-gray-300 hover:border-amber-500'} btn-ripple">
                            <i class="fa-${isFav ? 'solid' : 'regular'} fa-bookmark"></i>
                            <span>${isFav ? 'Đã Yêu Thích' : 'Yêu Thích'}</span>
                        </button>
                    </div>
                    <div class="flex flex-wrap items-center gap-3 mt-4 text-xs text-gray-300">
                        <span class="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-extrabold px-3 py-1 rounded-lg"><i class="fa-solid fa-star"></i> ${movie.rating || 'N/A'}</span>
                        ${movie.imdbId ? `<a href="https://www.imdb.com/title/${movie.imdbId}" target="_blank" rel="noopener" class="text-xs px-2.5 py-1 rounded-lg border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 font-bold">IMDb</a>` : ''}
                        ${movie.tmdbId ? `<a href="https://www.themoviedb.org/${movie.tmdbType === 'tv' ? 'tv' : 'movie'}/${movie.tmdbId}" target="_blank" rel="noopener" class="text-xs px-2.5 py-1 rounded-lg border border-sky-500/40 text-sky-400 hover:bg-sky-500/10 font-bold">TMDB</a>` : ''}
                        <span>Dạng: <strong class="text-white">${movie.type}</strong></span>
                        <span>Năm: <strong class="text-white">${movie.year}</strong></span>
                        <span class="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-[10px] font-bold">${movie.episode_total || 0} Tập</span>
                        ${movie.quality ? `<span class="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-bold">${movie.quality}</span>` : ''}
                        ${movie.lang ? `<span class="bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full text-[10px] font-bold">${movie.lang}</span>` : ''}
                    </div>
                    
                    <div class="rating-system mt-3" id="rating-system-${slug}">
                        <div class="stars" data-movie-id="${slug}">
                            ${[1,2,3,4,5].map(v => `<span class="star ${rating.user >= v ? 'active' : ''}" data-value="${v}">★</span>`).join('')}
                        </div>
                        <span class="rating-text" id="rating-text-${slug}">
                            ${rating.user > 0 ? `Bạn đã đánh giá ${rating.user}⭐` : 'Chưa đánh giá'}
                        </span>
                        <span class="rating-avg">
                            <i class="fa-solid fa-star"></i> <span id="rating-avg-value-${slug}">${avg.toFixed(1)}</span> (<span id="rating-count-${slug}">${rating.count}</span>)
                        </span>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-sm font-bold text-gray-400 mb-1">Tóm tắt:</h3>
                    <p class="text-sm leading-relaxed text-gray-300">${escapeHtml(movie.summary || 'Chưa có tóm tắt')}</p>
                </div>
                
                ${directorsHTML}
                ${actorsHTML}
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs border-t border-gray-800 pt-4">
                    <div><p class="text-gray-500">Trạng thái</p><p class="text-amber-500 font-bold mt-1">${movie.status}</p></div>
                    <div><p class="text-gray-500">Số tập</p><p class="font-bold text-white mt-1">${movie.episode_total || 0}</p></div>
                    <div><p class="text-gray-500">Lượt xem</p><p class="font-bold text-white mt-1">${movie.views}</p></div>
                    <div><p class="text-gray-500">Chất lượng</p><p class="font-bold text-white mt-1">${movie.quality}</p></div>
                </div>
                
                ${episodesHTML}
                
                ${movie.trailer ? `
                    <div>
                        <h4 class="text-sm font-bold text-gray-400 mb-2">🎬 Trailer:</h4>
                        <a href="${movie.trailer}" target="_blank" class="text-amber-500 hover:underline text-sm">Xem trailer</a>
                    </div>
                ` : ''}
            </div>
        </div>
        
        <div class="glass-premium p-5 md:p-8 rounded-3xl space-y-6 mt-8">
            <h3 class="text-lg font-bold flex items-center space-x-2 text-white">
                <span class="w-1.5 h-5 bg-gradient-to-b from-amber-500 to-purple-500 rounded-full"></span>
                <span>Bình Luận</span>
            </h3>
            <div class="flex flex-col sm:flex-row gap-3">
                <input id="comment-user" type="text" value="${escapeHtml(getCurrentUser()?.name || '')}" placeholder="Tên của bạn..." class="bg-gray-900 border border-gray-800 text-sm px-4 py-3 rounded-xl sm:w-1/4 focus:outline-none focus:border-amber-500 text-white">
                <input id="comment-input" type="text" placeholder="Nhập nội dung bình luận..." class="bg-gray-900 border border-gray-800 text-sm px-4 py-3 rounded-xl flex-1 focus:outline-none focus:border-amber-500 text-white">
                <button onclick="submitComment('${slug}')" class="bg-amber-500 text-black font-extrabold px-7 py-3 rounded-xl hover:bg-amber-600 transition btn-ripple">Đăng</button>
            </div>
            <div id="comments-container" class="space-y-4 pt-3"></div>
        </div>
    `;
    
    navigateTo('detail');
    setTimeout(() => updateRatingDisplay(slug), 100);
    renderComments(slug);
}

// ===== APP INIT =====
window.onload = function () {
    // Theme
    if (localStorage.getItem('roflix-theme') === 'light') {
        document.body.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
        updateThemeIcon(true);
    }
    
    // Init profile
    initProfile();
    
    // Load dữ liệu
    if (typeof loadMovies === 'function') {
        loadMovies();
    } else {
        console.warn('loadMovies is not defined yet');
    }
    
    initHeroSlider();
    renderBottomBoards();
    checkUserAuthStatus();
    checkDailyLogin();
    
    // Render leaderboard
    renderLeaderboard();
    
    console.log('🎬 RoFlix V3 - Đã khởi động thành công!');
};
