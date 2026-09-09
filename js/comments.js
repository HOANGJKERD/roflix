// ============================================================
// COMMENTS SYSTEM
// ============================================================

function getComments(movieSlug) {
    const allComments = JSON.parse(localStorage.getItem('roflix-comments') || '{}');
    return allComments[movieSlug] || [];
}

function saveComment(movieSlug, username, text) {
    const allComments = JSON.parse(localStorage.getItem('roflix-comments') || '{}');
    if (!allComments[movieSlug]) allComments[movieSlug] = [];
    allComments[movieSlug].unshift({
        user: username || 'Khán Giả',
        text: text,
        time: new Date().toLocaleString('vi-VN'),
        timestamp: Date.now(),
        movieTitle: currentMovieTitle || movieSlug
    });
    localStorage.setItem('roflix-comments', JSON.stringify(allComments));
    
    const stats = getStats();
    stats.totalComments = (stats.totalComments || 0) + 1;
    saveStats(stats);
    updateDailyQuestProgress('comment');
    checkAchievements(stats);
    renderBbComments();
}

function renderComments(movieSlug) {
    const container = document.getElementById('comments-container');
    if (!container) return;
    const comments = getComments(movieSlug);
    container.innerHTML = comments.length > 0 ? comments.map(c => `
        <div class="border-b border-gray-800 pb-4 last:border-0">
            <div class="flex justify-between text-xs text-amber-500 font-bold mb-1">
                <span><i class="fa-regular fa-user mr-1"></i>${escapeHtml(c.user)}</span>
                <span class="font-normal text-[11px] text-gray-500">${escapeHtml(c.time)}</span>
            </div>
            <p class="text-sm mt-1 text-gray-300">${escapeHtml(c.text)}</p>
        </div>
    `).join('') : `<div class="text-center text-gray-500 py-8">Chưa có bình luận. Hãy là người đầu tiên!</div>`;
}

async function submitComment(slug) {
    const userEl = document.getElementById('comment-user');
    const inputEl = document.getElementById('comment-input');
    const username = userEl ? userEl.value.trim() : 'Khán Giả';
    const text = inputEl ? inputEl.value.trim() : '';
    
    if (!text) {
        showToast('error', 'Lỗi', 'Vui lòng nhập bình luận!');
        return;
    }
    
    saveComment(slug, username, text);
    renderComments(slug);
    if (inputEl) inputEl.value = '';
    showToast('success', 'Đã đăng', 'Bình luận thành công! +5 RoGem');
    addGem(5, true);
}

function renderBbComments() {
    const el = document.getElementById('bb-comment-list');
    if (!el) return;
    
    let all = [];
    try {
        const raw = JSON.parse(localStorage.getItem('roflix-comments') || '{}');
        Object.keys(raw).forEach(slug => {
            (raw[slug] || []).forEach(c => {
                all.push({
                    slug,
                    user: c.user || 'Khán giả',
                    text: c.text || '',
                    movie: c.movieTitle || slug,
                    timestamp: c.timestamp || 0
                });
            });
        });
    } catch (_) {}
    
    all.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    all = all.slice(0, 4);
    
    if (!all.length) {
        all = [
            { user: 'RoFlix Fan', text: 'Phim hay quá!', movie: 'Chào mừng đến RoFlix', slug: '' },
            { user: 'Wibu', text: 'Mong ra tập mới sớm', movie: 'Anime / Series', slug: '' }
        ];
    }
    
    el.innerHTML = all.map(c => {
        const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user)}&background=f59e0b&color=000&size=64`;
        const click = c.slug ? `onclick="viewMovieDetail('${c.slug}')"` : '';
        return `<div class="bb-comment" ${click}>
            <img class="bb-avatar" src="${avatar}" alt="">
            <div class="bb-c-body">
                <div class="bb-c-user">${escapeHtml(c.user)} <span class="badge-inf">∞</span></div>
                <div class="bb-c-text">${escapeHtml(c.text)}</div>
                <div class="bb-c-movie"><i class="fa-solid fa-play" style="font-size:0.55rem"></i> ${escapeHtml(c.movie)}</div>
            </div>
        </div>`;
    }).join('');
}
