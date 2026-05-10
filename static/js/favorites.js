/**
 * 幻想郷 言霊修行帳 - 符卡收藏系统
 */

const Favorites = (() => {
    
    function getToken() {
        return localStorage.getItem('touhou_user_token') || '';
    }
    
    /**
     * 获取收藏列表
     */
    async function getFavorites() {
        const token = getToken();
        if (!token) return [];
        
        try {
            const res = await fetch(`${window.location.origin}/api/favorites?token=${encodeURIComponent(token)}`);
            const data = await res.json();
            return data.success ? data.data : [];
        } catch (e) {
            return [];
        }
    }
    
    /**
     * 添加收藏
     */
    async function addFavorite(card) {
        const token = getToken();
        if (!token) {
            Panels.showToast('💢', '请先登录', 'error');
            return false;
        }
        
        try {
            const res = await fetch(`${window.location.origin}/api/favorites/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    card_id: card.id,
                    word: card.word,
                    reading: card.reading || '',
                    meaning: card.meaning || '',
                    rarity: card.rarity || 'R',
                    level: card.level || ''
                })
            });
            const data = await res.json();
            
            if (data.success) {
                Panels.showToast('⭐', data.message, 'success');
                return true;
            } else {
                Panels.showToast('💢', data.message, 'error');
                return false;
            }
        } catch (e) {
            Panels.showToast('💢', '收藏失败', 'error');
            return false;
        }
    }
    
    /**
     * 取消收藏
     */
    async function removeFavorite(cardId) {
        const token = getToken();
        if (!token) return false;
        
        try {
            const res = await fetch(`${window.location.origin}/api/favorites/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, card_id: cardId })
            });
            const data = await res.json();
            
            if (data.success) {
                Panels.showToast('⭐', data.message, 'success');
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 检查是否已收藏
     */
    async function isFavorited(cardId) {
        const favs = await getFavorites();
        return favs.some(f => f.card_id === cardId || f.id === cardId);
    }
    
    /**
     * 切换收藏状态
     */
    async function toggleFavorite(card) {
        const favorited = await isFavorited(card.id);
        if (favorited) {
            await removeFavorite(card.id);
            return false;
        } else {
            await addFavorite(card);
            return true;
        }
    }
    
    /**
     * 更新收藏按钮图标
     */
    async function updateFavoriteBtn(cardId, btnElement) {
        const favorited = await isFavorited(cardId);
        if (btnElement) {
            btnElement.textContent = favorited ? '⭐' : '☆';
            btnElement.classList.toggle('favorited', favorited);
        }
        return favorited;
    }
    
    /**
     * 渲染收藏列表（用于背包展示）
     */
    async function renderFavoritesTab() {
        const favs = await getFavorites();
        
        if (favs.length === 0) {
            return `
                <div style="text-align:center;padding:50px 20px;">
                    <div style="font-size:4em;margin-bottom:15px;">⭐</div>
                    <p style="color:var(--text-muted);">暂无收藏</p>
                    <p style="color:var(--text-muted);font-size:0.85em;">抽卡时点击 ☆ 按钮收藏喜欢的单词</p>
                </div>
            `;
        }
        
        return `
            <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:14px;">
                ${favs.map(card => `
                    <div class="spellcard-item" style="position:relative;">
                        <div class="spellcard-rarity rarity-${card.rarity}">${card.rarity}</div>
                        <div class="spellcard-name">${card.word}</div>
                        <div style="color:var(--color-primary);font-size:0.9em;">${card.reading || ''}</div>
                        <div class="spellcard-desc">${card.meaning}</div>
                        <div style="color:var(--text-muted);font-size:0.75em;margin-top:4px;">
                            ${card.level || ''} · 收藏于 ${card.favorited_at || ''}
                        </div>
                        <button class="btn btn-sm btn-ghost" 
                                style="position:absolute;top:8px;right:8px;"
                                onclick="Favorites.removeAndRefresh('${card.card_id || card.id}')">
                            ⭐ 取消
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * 取消收藏并刷新
     */
    async function removeAndRefresh(cardId) {
        await removeFavorite(cardId);
        // 直接刷新收藏列表
        const content = document.getElementById('inventoryContent');
        if (content) {
            content.innerHTML = await renderFavoritesTab();
        }
    }
    
    return {
        getFavorites,
        addFavorite,
        removeFavorite,
        isFavorited,
        toggleFavorite,
        updateFavoriteBtn,
        renderFavoritesTab,
        removeAndRefresh
    };
})();

window.Favorites = Favorites;