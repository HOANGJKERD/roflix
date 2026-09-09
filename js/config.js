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
    { id: 'comment_10', name: '💬 Người nói nhiều', desc: 'Viết 10 bình luận', icon: '💬', condition: (stats) => stats.totalComments >= 10 },
    { id: 'gem_100', name: '💰 Nhà sưu tập', desc: 'Sở hữu 100 RoGem', icon: '💰', condition: (stats) => stats.totalGemEarned >= 100 },
    { id: 'gem_500', name: '💎 Đại gia', desc: 'Sở hữu 500 RoGem', icon: '💎', condition: (stats) => stats.totalGemEarned >= 500 },
];

const GACHA_POOL = [
    { id: 'common_1', name: 'Neo', movie: 'Ma trận', rarity: 'common', image: 'https://via.placeholder.com/150/6b7280/fff?text=Neo' },
    { id: 'common_2', name: 'Trinity', movie: 'Ma trận', rarity: 'common', image: 'https://via.placeholder.com/150/6b7280/fff?text=Trinity' },
    { id: 'common_3', name: 'Morpheus', movie: 'Ma trận', rarity: 'common', image: 'https://via.placeholder.com/150/6b7280/fff?text=Morpheus' },
    { id: 'common_4', name: 'Paul Atreides', movie: 'Dune', rarity: 'common', image: 'https://via.placeholder.com/150/6b7280/fff?text=Paul' },
    { id: 'common_5', name: 'Chani', movie: 'Dune', rarity: 'common', image: 'https://via.placeholder.com/150/6b7280/fff?text=Chani' },
    { id: 'rare_1', name: 'Jake Sully', movie: 'Avatar', rarity: 'rare', image: 'https://via.placeholder.com/150/22c55e/fff?text=Jake' },
    { id: 'rare_2', name: 'Neytiri', movie: 'Avatar', rarity: 'rare', image: 'https://via.placeholder.com/150/22c55e/fff?text=Neytiri' },
    { id: 'rare_3', name: 'Batman', movie: 'The Batman', rarity: 'rare', image: 'https://via.placeholder.com/150/22c55e/fff?text=Batman' },
    { id: 'rare_4', name: 'Catwoman', movie: 'The Batman', rarity: 'rare', image: 'https://via.placeholder.com/150/22c55e/fff?text=Catwoman' },
    { id: 'sr_1', name: 'Oppenheimer', movie: 'Oppenheimer', rarity: 'super-rare', image: 'https://via.placeholder.com/150/3b82f6/fff?text=Oppenheimer' },
    { id: 'sr_2', name: 'John Wick', movie: 'John Wick', rarity: 'super-rare', image: 'https://via.placeholder.com/150/3b82f6/fff?text=Wick' },
    { id: 'sr_3', name: 'Caine', movie: 'John Wick', rarity: 'super-rare', image: 'https://via.placeholder.com/150/3b82f6/fff?text=Caine' },
    { id: 'epic_1', name: 'Duke Leto', movie: 'Dune', rarity: 'epic', image: 'https://via.placeholder.com/150/8b5cf6/fff?text=Leto' },
    { id: 'epic_2', name: 'Lady Jessica', movie: 'Dune', rarity: 'epic', image: 'https://via.placeholder.com/150/8b5cf6/fff?text=Jessica' },
    { id: 'leg_1', name: 'Feyd-Rautha', movie: 'Dune', rarity: 'legendary', image: 'https://via.placeholder.com/150/f59e0b/000?text=Feyd' },
    { id: 'leg_2', name: 'Stilgar', movie: 'Dune', rarity: 'legendary', image: 'https://via.placeholder.com/150/f59e0b/000?text=Stilgar' },
    { id: 'sec_1', name: '🔥 Movie God', movie: 'RoFlix', rarity: 'secret', image: 'https://via.placeholder.com/150/ec4899/fff?text=MovieGod' },
];
