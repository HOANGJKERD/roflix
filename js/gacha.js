// ============================================================
// GACHA SYSTEM
// ============================================================

function getCards() {
    return JSON.parse(localStorage.getItem('roflix-cards')) || [];
}

function saveCards(data) {
    localStorage.setItem('roflix-cards', JSON.stringify(data));
}

function rollGacha() {
    const total = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
    let roll = Math.random() * total;
    for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
        roll -= weight;
        if (roll <= 0) {
            const pool = GACHA_POOL.filter(c => c.rarity === rarity);
            return pool[Math.floor(Math.random() * pool.length)];
        }
    }
    return GACHA_POOL[0];
}

function performGacha() {
    const cost = CONFIG.GACHA_COST;
    const gems = getGem();
    if (gems < cost) {
        showToast('error', 'Không đủ RoGem', `Cần ${cost} 💎 để quay Gacha`);
        return;
    }
    
    addGem(-cost, false);
    
    const card = rollGacha();
    const cards = getCards();
    card.obtainedAt = new Date().toISOString();
    card.id = card.id + '_' + Date.now();
    cards.push(card);
    saveCards(cards);
    
    showGachaPull(card);
    updateProfileUI();
    renderCollection();
}

function showGachaPull(card) {
    const overlay = document.getElementById('gacha-pull-overlay');
    const pullCard = document.getElementById('gacha-pull-card');
    const rarityNames = {
        common: '⚪ Common',
        rare: '🟢 Rare',
        'super-rare': '🔵 Super Rare',
        epic: '🟣 Epic',
        legendary: '🟠 Legendary',
        secret: '🌈 Secret'
    };
    const rarityColors = {
        common: '#6b7280',
        rare: '#22c55e',
        'super-rare': '#3b82f6',
        epic: '#8b5cf6',
        legendary: '#f59e0b',
        secret: '#ec4899'
    };
    
    const rarityEl = document.getElementById('pull-rarity');
    const artEl = document.getElementById('pull-art');
    const nameEl = document.getElementById('pull-name');
    const movieEl = document.getElementById('pull-movie');
    
    if (rarityEl) {
        rarityEl.textContent = rarityNames[card.rarity] || '✨ Common';
        rarityEl.style.background = rarityColors[card.rarity] || '#6b7280';
        rarityEl.style.color = card.rarity === 'legendary' ? 'black' : 'white';
    }
    if (artEl) artEl.src = card.image;
    if (nameEl) nameEl.textContent = card.name;
    if (movieEl) movieEl.textContent = `Từ: ${card.movie}`;
    
    if (pullCard) {
        pullCard.classList.remove('show');
    }
    if (overlay) {
        overlay.classList.add('show');
    }
    setTimeout(() => {
        if (pullCard) pullCard.classList.add('show');
    }, 100);
}

function closeGachaPull() {
    const overlay = document.getElementById('gacha-pull-overlay');
    const pullCard = document.getElementById('gacha-pull-card');
    if (overlay) overlay.classList.remove('show');
    if (pullCard) pullCard.classList.remove('show');
}

function renderCollection() {
    const cards = getCards();
    const totalCards = GACHA_POOL.length;
    
    const countEl = document.getElementById('collection-count');
    const totalEl = document.getElementById('collection-total');
    const percentEl = document.getElementById('collection-percent');
    
    if (countEl) countEl.textContent = cards.length;
    if (totalEl) totalEl.textContent = totalCards;
    if (percentEl) percentEl.textContent = totalCards > 0 ? Math.round((cards.length / totalCards) * 100) + '%' : '0%';
    
    const grid = document.getElementById('card-grid');
    if (!grid) return;
    
    if (cards.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full empty-state" style="padding:40px;">
                <div class="empty-icon"><i class="fa-solid fa-layer-group"></i></div>
                <h3>Chưa có thẻ nào</h3>
                <p>Hãy quay Gacha để sưu tập nhân vật!</p>
            </div>
        `;
        return;
    }
    
    const rarityNames = {
        common: 'Common',
        rare: 'Rare',
        'super-rare': 'Super Rare',
        epic: 'Epic',
        legendary: 'Legendary',
        secret: 'Secret'
    };
    
    grid.innerHTML = cards.map(card => `
        <div class="card-item">
            <span class="card-rarity ${card.rarity}">${rarityNames[card.rarity] || 'Common'}</span>
            <img class="card-art" src="${card.image}" alt="${card.name}">
            <div class="card-name">${card.name}</div>
            <div class="card-movie">${card.movie}</div>
        </div>
    `).join('');
}
