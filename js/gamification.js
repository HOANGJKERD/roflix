// ============================================================
// GAMIFICATION - Gem, Level, Achievements, Daily Quest
// ============================================================

// ===== LEVEL SYSTEM =====
function getLevelData() {
    return JSON.parse(localStorage.getItem('roflix-level')) || { level: 1, exp: 0 };
}

function saveLevelData(data) {
    localStorage.setItem('roflix-level', JSON.stringify(data));
}

function getExpToNextLevel(level) {
    return CONFIG.EXP_PER_LEVEL + (level - 1) * 20;
}

function addExp(amount) {
    const levelData = getLevelData();
    let { level, exp } = levelData;
    exp += amount;
    const expToNext = getExpToNextLevel(level);
    while (exp >= expToNext) {
        exp -= expToNext;
        level++;
        showToast('success', `🎉 Level Up!`, `Bạn đã đạt Level ${level}!`);
        addGem(level * 5, true);
    }
    saveLevelData({ level, exp });
    updateProfileUI();
    return { level, exp };
}

// ===== GEM SYSTEM =====
function getGem() {
    return parseInt(localStorage.getItem('roflix-gem')) || 0;
}

function setGem(value) {
    localStorage.setItem('roflix-gem', String(Math.max(0, value)));
}

function addGem(amount, showEffect = true) {
    const current = getGem();
    const newValue = current + amount;
    setGem(newValue);
    
    const stats = getStats();
    stats.totalGemEarned = (stats.totalGemEarned || 0) + amount;
    saveStats(stats);
    
    if (showEffect && amount > 0) {
        showGemFly(amount);
        showToast('success', `+${amount} RoGem`, `Bạn đã nhận được ${amount} 💎`);
    }
    updateProfileUI();
    return newValue;
}

// ===== STATS SYSTEM =====
function getStats() {
    return JSON.parse(localStorage.getItem('roflix-stats')) || {
        totalEpisodesWatched: 0,
        totalMoviesWatched: 0,
        totalFavorites: 0,
        totalComments: 0,
        totalGemEarned: 0,
        mostWatchedMovie: null,
        favoriteGenre: null,
        watchTime: 0
    };
}

function saveStats(data) {
    localStorage.setItem('roflix-stats', JSON.stringify(data));
}

function getAchievements() {
    return JSON.parse(localStorage.getItem('roflix-achievements')) || [];
}

function saveAchievements(data) {
    localStorage.setItem('roflix-achievements', JSON.stringify(data));
}

function checkAchievements(stats) {
    const unlocked = getAchievements();
    const newUnlocked = [];
    ACHIEVEMENTS.forEach(ach => {
        if (!unlocked.find(u => u.id === ach.id) && ach.condition(stats)) {
            unlocked.push({ id: ach.id, unlockedAt: new Date().toISOString() });
            newUnlocked.push(ach);
            showToast('success', `🏆 Thành tựu mới!`, `${ach.icon} ${ach.name}`);
            addGem(10, true);
        }
    });
    if (newUnlocked.length > 0) {
        saveAchievements(unlocked);
    }
    return newUnlocked;
}

// ===== DAILY QUEST =====
function getDailyQuest() {
    const today = getToday();
    const saved = JSON.parse(localStorage.getItem('roflix-daily'));
    if (saved && saved.date === today) return saved;
    return {
        date: today,
        tasks: {
            watch: { done: false, target: 2, current: 0 },
            comment: { done: false, target: 1, current: 0 },
            favorite: { done: false, target: 1, current: 0 },
            login: { done: false }
        },
        claimed: false
    };
}

function saveDailyQuest(data) {
    localStorage.setItem('roflix-daily', JSON.stringify(data));
}

function checkDailyLogin() {
    const daily = getDailyQuest();
    if (!daily.tasks.login.done) {
        daily.tasks.login.done = true;
        saveDailyQuest(daily);
        addGem(10, true);
        addExp(20);
        showToast('success', '🎯 Điểm danh', '+10 RoGem, +20 EXP');
    }
    updateDailyQuest();
}

function updateDailyQuestProgress(type) {
    const daily = getDailyQuest();
    if (daily.claimed) return;
    
    if (type === 'watch' && !daily.tasks.watch.done) {
        daily.tasks.watch.current = (daily.tasks.watch.current || 0) + 1;
        if (daily.tasks.watch.current >= daily.tasks.watch.target) {
            daily.tasks.watch.done = true;
        }
    } else if (type === 'comment' && !daily.tasks.comment.done) {
        daily.tasks.comment.current = (daily.tasks.comment.current || 0) + 1;
        if (daily.tasks.comment.current >= daily.tasks.comment.target) {
            daily.tasks.comment.done = true;
        }
    } else if (type === 'favorite' && !daily.tasks.favorite.done) {
        daily.tasks.favorite.current = (daily.tasks.favorite.current || 0) + 1;
        if (daily.tasks.favorite.current >= daily.tasks.favorite.target) {
            daily.tasks.favorite.done = true;
        }
    }
    saveDailyQuest(daily);
    updateDailyQuest();
}

function updateDailyQuest() {
    const daily = getDailyQuest();
    const container = document.getElementById('daily-quest-list');
    if (!container) return;
    
    const tasks = [
        { key: 'watch', icon: '📺', label: `Xem ${daily.tasks.watch.target} tập hôm nay`, reward: 10 },
        { key: 'comment', icon: '💬', label: `Bình luận ${daily.tasks.comment.target} lần`, reward: 5 },
        { key: 'favorite', icon: '❤️', label: `Yêu thích ${daily.tasks.favorite.target} phim`, reward: 5 },
        { key: 'login', icon: '✅', label: 'Đăng nhập hôm nay', reward: 10 }
    ];
    
    let allDone = true;
    container.innerHTML = tasks.map(t => {
        const task = daily.tasks[t.key];
        const isDone = task.done || (t.key === 'watch' && task.current >= task.target) ||
                       (t.key === 'comment' && task.current >= task.target) ||
                       (t.key === 'favorite' && task.current >= task.target);
        if (!isDone) allDone = false;
        const progress = t.key === 'watch' ? `${task.current}/${task.target}` :
                        t.key === 'comment' ? `${task.current}/${task.target}` :
                        t.key === 'favorite' ? `${task.current}/${task.target}` : '';
        return `
            <div class="quest-item">
                <div class="quest-info">
                    <div class="quest-check ${isDone ? 'done' : ''}">
                        ${isDone ? '<i class="fa-solid fa-check"></i>' : ''}
                    </div>
                    <div class="quest-text">
                        ${isDone ? `<span style="text-decoration:line-through; opacity:0.5;">${t.icon} ${t.label}</span>` :
                                   `${t.icon} ${t.label}`}
                        ${progress ? `<span class="progress">(${progress})</span>` : ''}
                    </div>
                </div>
                <div class="quest-reward">+${t.reward} 💎</div>
            </div>
        `;
    }).join('');
    
    const claimBtn = document.getElementById('claim-daily-btn');
    if (claimBtn) {
        if (daily.claimed) {
            claimBtn.disabled = true;
            claimBtn.textContent = '✅ Đã nhận thưởng hôm nay';
        } else if (allDone) {
            claimBtn.disabled = false;
            claimBtn.textContent = `🎁 Nhận thưởng ${calculateDailyReward()} RoGem`;
        } else {
            claimBtn.disabled = true;
            claimBtn.textContent = '📋 Hoàn thành nhiệm vụ để nhận thưởng';
        }
    }
    
    const resetTime = document.getElementById('quest-reset-time');
    if (resetTime) resetTime.textContent = `🔄 Reset lúc 00:00`;
}

function calculateDailyReward() {
    const daily = getDailyQuest();
    let total = 0;
    for (const key in daily.tasks) {
        const task = daily.tasks[key];
        if (task.done || (typeof task === 'object' && task.current >= task.target)) {
            if (key === 'watch') total += 10;
            else if (key === 'comment') total += 5;
            else if (key === 'favorite') total += 5;
            else if (key === 'login') total += 10;
        }
    }
    return total;
}

function claimDailyQuest() {
    const daily = getDailyQuest();
    if (daily.claimed) {
        showToast('info', 'Đã nhận', 'Bạn đã nhận thưởng hôm nay!');
        return;
    }
    
    const reward = calculateDailyReward();
    if (reward === 0) {
        showToast('info', 'Chưa hoàn thành', 'Hoàn thành nhiệm vụ trước khi nhận thưởng!');
        return;
    }
    
    daily.claimed = true;
    saveDailyQuest(daily);
    addGem(reward, true);
    addExp(reward * 2);
    showToast('success', '🎉 Nhận thưởng thành công!', `+${reward} RoGem, +${reward * 2} EXP`);
    updateDailyQuest();
    updateProfileUI();
}
