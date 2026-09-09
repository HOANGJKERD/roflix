// ============================================================
// CẤU HÌNH CHUNG
// ============================================================

const CONFIG = {
    API_BASE: 'https://vsmov.com/api',
    ITEMS_PER_PAGE: 24,
    EXP_PER_LEVEL: 100,
    HERO_INTERVAL: 7000,
    GACHA_COST: 50,
    MAX_HISTORY: 50,
    CACHE_DURATION: 3600000, // 1 hour
};

// Endpoint mapping
const ENDPOINTS = {
    'phim-moi': 'phim-moi-cap-nhat',
    'phim-le': 'phim-le',
    'phim-bo': 'phim-bo',
    'dang-chieu': 'dang-chieu',
    '4k': '4k',
    'long-tieng': 'long-tieng',
    'thuyet-minh': 'thuyet-minh',
    'subteam': 'subteam'
};

// Rarity weights for Gacha
const RARITY_WEIGHTS = {
    common: 40,
    rare: 25,
    'super-rare': 18,
    epic: 10,
    legendary: 5,
    secret: 2
};

// Achievements list
const ACHIEVEMENTS = [
    { id: 'first_watch', name: '🎬 Khởi đầu', desc: 'Xem tập phim đầu tiên', icon: '🎬', condition: (stats) => stats.totalEpisodesWatched >= 1 },
    { id: 'watch_10', name: '🎖️ Tân binh', desc: 'Xem 10 tập phim', icon: '🎖️', condition: (stats) => stats.totalEpisodesWatched >= 10 },
    { id: 'watch_50', name: '🏅 Cinephile', desc: 'Xem 50 tập phim', icon: '🏅', condition: (stats) => stats.totalEpisodesWatched >= 50 },
    { id: 'watch_100', name: '🏆 Movie Master', desc: 'Xem 100 tập phim', icon: '🏆', condition: (stats) => stats.totalEpisodesWatched >= 100 },
    { id: 'favorite_5', name: '❤️ Người yêu phim', desc: 'Yêu thích 5 phim', icon: '❤️', condition: (stats) => stats.totalFavorites >= 5 },
    { id: 'favorite_10', name: '💕 Collector', desc: 'Yêu thích 10 phim', icon: '💕', condition: (stats) => stats.totalFavorites >= 10 },
    { id: 'comment_10', name: '💬 Người nói nhiều', desc: 'Viết 10 bình luận', icon: '💬', condition: (stats) => stats
