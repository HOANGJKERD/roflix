// ============================================================
// PLAYER LOGIC
// ============================================================

let currentEpisodeList = [];
let currentMovieTitle = '';
let currentEpisodeIndex = 0;

function playMovie(slug) {
    // Mở chi tiết rồi tự phát tập đầu (nếu có)
    (async () => {
        await viewMovieDetail(slug);
        if (currentEpisodeList.length > 0) {
            playMovieByIndex(0);
        } else {
            showToast('error', 'Chưa có tập', 'Phim này chưa có link phát trên API.');
        }
    })();
}

function renderPlayEpisodeGrid(activeIndex) {
    const grid = document.getElementById('episode-list-grid');
    if (!grid) return;
    if (!currentEpisodeList.length) {
        grid.innerHTML = '<p class="col-span-full text-xs text-gray-500 text-center py-4">Không có danh sách tập</p>';
        return;
    }
    grid.innerHTML = currentEpisodeList.map((ep, idx) => {
        const active = idx === activeIndex;
        const cls = active
            ? 'bg-amber-500 text-black font-bold'
            : 'bg-gray-800 hover:bg-amber-500/20 text-white border border-gray-700';
        return `<button onclick="playMovieByIndex(${idx})" class="py-2 px-1 text-xs rounded-lg text-center transition ${cls}">Tập ${escapeHtml(ep.name)}</button>`;
    }).join('');
}

function playMovieByIndex(index) {
    const ep = currentEpisodeList[index];
    if (!ep || !ep.link) {
        showToast('error', 'Lỗi', 'Không có link phát cho tập này!');
        return;
    }
    currentEpisodeIndex = index;
    const title = currentMovieTitle || 'Đang phát';
    const player = document.getElementById('movie-player');
    const titleEl = document.getElementById('playing-title');
    if (player) player.src = ep.link;
    if (titleEl) titleEl.textContent = `${title} - ${ep.name}`;
    renderPlayEpisodeGrid(index);
    navigateTo('player');
    
    // Lưu lịch sử xem
    saveWatchHistory(currentSlug || 'unknown', index, 0);
}

function playMovieByLink(link, title, epName) {
    if (!link) {
        showToast('error', 'Lỗi', 'Không có link phát cho tập này!');
        return;
    }
    const idx = currentEpisodeList.findIndex(e => e.link === link);
    if (idx >= 0) {
        playMovieByIndex(idx);
        return;
    }
    currentEpisodeList = [{ name: epName || 'Full', link }];
    currentMovieTitle = title || currentMovieTitle;
    playMovieByIndex(0);
}

function goBackFromPlay() {
    const player = document.getElementById('movie-player');
    if (player) player.src = '';
    navigateTo('detail');
}

function openFullscreen() {
    const player = document.getElementById('movie-player');
    if (player) {
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.webkitRequestFullscreen) {
            player.webkitRequestFullscreen();
        } else if (player.msRequestFullscreen) {
            player.msRequestFullscreen();
        }
    }
}

function saveWatchHistory(slug, episode, progress) {
    const history = JSON.parse(localStorage.getItem('roflix-watch-history') || '[]');
    const existing = history.find(h => h.slug === slug);
    if (existing) {
        existing.episode = episode;
        existing.progress = progress;
        existing.timestamp = Date.now();
    } else {
        history.push({ slug, episode, progress, timestamp: Date.now() });
    }
    // Giới hạn số lượng
    if (history.length > CONFIG.MAX_HISTORY) {
        history.splice(0, history.length - CONFIG.MAX_HISTORY);
    }
    localStorage.setItem('roflix-watch-history', JSON.stringify(history));
}
