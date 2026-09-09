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
        return `<button onclick="playMovieByIndex(${idx})" class="py-2 px-
