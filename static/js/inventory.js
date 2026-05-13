/**
 * 幻想郷 言霊修行帳 - 背包系统
 * Inventory & User Storage System
 */

const Inventory = (() => {
    
    /**
     * 获取当前用户 token
     */
    function getToken() {
        return localStorage.getItem('touhou_user_token') || '';
    }
    
    /**
     * 带 token 的 API 请求
     */
    async function apiGet(endpoint) {
        const token = getToken();
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${window.location.origin}${endpoint}${separator}token=${encodeURIComponent(token)}`;
        const res = await fetch(url);
        return res.json();
    }
    
    async function apiPost(endpoint, body = {}) {
        const token = getToken();
        const res = await fetch(`${window.location.origin}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...body, token: token })
        });
        return res.json();
    }
    
    /**
     * 渲染背包弹窗
     */
    async function renderInventoryModal() {
        try {
            const overview = await apiGet('/api/inventory/overview');
            const profile = await apiGet('/api/user/profile');
            
            if (!overview.success || !profile.success) {
                throw new Error('加载失败');
            }
            
            const user = profile.data;
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                        🎒 幻想郷修練帳 · 背包
                    </div>
                </div>
                
                <!-- 用户状态栏 -->
                <div class="user-status-bar">
                    <div class="user-avatar onclick="AudioManager.playVoice('${(user.character_emoji || '').split('/').pop().replace('.png','')}')">
                    <img src="${user.character_emoji || '/static/images/characters/reimu.png'}" style="width:50px;height:50px;object-fit:contain;"></div>
                    <div class="user-info">
                        <div class="user-name">${user.display_name}</div>
                        <div class="user-title">${user.character_title} · Lv.${user.level}</div>
                        <div class="exp-bar">
                            <div class="exp-fill" style="width:${(user.exp / user.exp_to_next * 100).toFixed(1)}%"></div>
                        </div>
                        <div style="color:var(--text-muted);font-size:0.75em;margin-top:2px;">
                            EXP: ${user.exp}/${user.exp_to_next}
                        </div>
                    </div>
                </div>
                
                <!-- 货币展示 -->
                <div class="currencies-row" style="margin-bottom:16px;">
                    <div class="currency-item">
                        <span class="currency-icon">💎</span>
                        <span class="currency-name">靈珠</span>
                        <span class="currency-amount">${user.currencies['靈珠'] || 0}</span>
                    </div>
                    <div class="currency-item">
                        <span class="currency-icon">💰</span>
                        <span class="currency-name">賽錢</span>
                        <span class="currency-amount">${user.currencies['賽錢'] || 0}</span>
                    </div>
                    <div class="currency-item">
                        <span class="currency-icon">⭐</span>
                        <span class="currency-name">信仰</span>
                        <span class="currency-amount">${user.currencies['信仰ポイント'] || 0}</span>
                    </div>
                </div>
                
                <!-- 标签切换 -->
                <div class="inventory-tabs">
                    <button class="inventory-tab active" onclick="Inventory.switchTab('spellcards')">
                        📜 符卡 (${overview.data.spell_cards_count})
                    </button>
                    <button class="inventory-tab" onclick="Inventory.switchTab('items')">
                        🎒 道具 (${overview.data.items_count})
                    </button>
                    <button class="inventory-tab" onclick="Inventory.switchTab('equipment')">
                        ⚔️ 装备 (${overview.data.equipment_count})
                    </button>
                </div>
                <div class="inventory-tabs">
                    <button class="inventory-tab active" onclick="Inventory.switchTab('spellcards')">
                        📜 符卡
                    </button>
                    <button class="inventory-tab" onclick="Inventory.switchTab('items')">
                        🎒 道具
                    </button>
                    <button class="inventory-tab" onclick="Inventory.switchTab('equipment')">
                        ⚔️ 装备
                    </button>
                    <button class="inventory-tab" onclick="Inventory.switchTab('favorites')">
                        ⭐ 收藏
                    </button>
                </div>
                    
                <!-- 内容区域 -->
                <div id="inventoryContent">
                    ${await renderSpellcardsTab()}
                </div>
            `;
        } catch (error) {
            return `<p style="color:#e74c3c;text-align:center;padding:30px;">背包加载失败: ${error.message}</p>`;
        }
    }
    
    /**
     * 切换标签
     */
async function switchTab(tabName) {
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 高亮当前选中的标签
    const clickedTab = document.querySelector(`.inventory-tab[onclick*="${tabName}"]`);
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    const content = document.getElementById('inventoryContent');
    if (!content) return;
    
    // 直接替换内容，不显示加载动画
    switch(tabName) {
        case 'spellcards':
            content.innerHTML = await renderSpellcardsTab();
            break;
        case 'items':
            content.innerHTML = await renderItemsTab();
            break;
        case 'equipment':
            content.innerHTML = await renderEquipmentTab();
            break;
        case 'favorites':
            content.innerHTML = await Favorites.renderFavoritesTab();
            break;
    }
}
    /**
     * 渲染符卡标签
     */
    async function renderSpellcardsTab() {
        try {
            const result = await apiGet('/api/inventory/spellcards');
            
            if (!result.success) {
                return '<p style="text-align:center;color:#e74c3c;padding:30px;">加载失败</p>';
            }
            
            const cards = result.data || [];
            
            if (cards.length === 0) {
                return `
                    <div style="text-align:center;padding:50px 20px;">
                        <div style="font-size:4em;margin-bottom:15px;">📜</div>
                        <p style="color:var(--text-muted);">暂无符卡</p>
                        <p style="color:var(--text-muted);font-size:0.85em;">去词汇符卡板块抽取吧！🎴</p>
                    </div>
                `;
            }
            
            return `
                <div class="spellcards-grid">
                    ${cards.map(card => `
                        <div class="spellcard-item ${card.equipped ? 'equipped' : ''}">
                            <div class="spellcard-rarity rarity-${card.rarity}">${card.rarity}</div>
                            <div class="spellcard-name">${card.name}</div>
                            <div class="spellcard-type">${getTypeLabel(card.type)}</div>
                            <div class="spellcard-power">⚡ 灵力 ${card.power}</div>
                            <div class="spellcard-desc">${card.description}</div>
                            <div style="color:var(--text-muted);font-size:0.75em;margin-top:4px;">
                                获得日期：${card.obtained_date}
                            </div>
                            <div class="spellcard-actions">
                                <button class="btn btn-sm ${card.equipped ? 'btn-ghost' : 'btn-primary'}" 
                                        onclick="Inventory.toggleEquip('${card.id}', ${!card.equipped})">
                                    ${card.equipped ? '🔓 卸下' : '🔒 装备'}
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            return '<p style="text-align:center;color:#e74c3c;padding:30px;">符卡加载失败</p>';
        }
    }
    
    /**
     * 渲染道具标签
     */
    async function renderItemsTab() {
        try {
            const result = await apiGet('/api/inventory/items');
            
            if (!result.success) {
                return '<p style="text-align:center;color:#e74c3c;padding:30px;">加载失败</p>';
            }
            
            const items = result.data || [];
            
            if (items.length === 0) {
                return `
                    <div style="text-align:center;padding:50px 20px;">
                        <div style="font-size:4em;margin-bottom:15px;">🎒</div>
                        <p style="color:var(--text-muted);">暂无道具</p>
                        <p style="color:var(--text-muted);font-size:0.85em;">去河童杂货铺购买吧！🏮</p>
                    </div>
                `;
            }
            
            return `
                <div class="items-list">
                    ${items.map(item => `
                        <div class="item-row">
                            <div class="item-icon-large">${item.icon || '📦'}</div>
                            <div class="item-info">
                                <div class="item-name-row">
                                    <span class="item-name-text">${item.name}</span>
                                    <span class="item-type-badge type-${item.type}">${getItemTypeLabel(item.type)}</span>
                                    <span class="item-rarity-badge">${item.rarity}</span>
                                </div>
                                <div class="item-effect">✨ ${item.effect}</div>
                                <div class="item-desc-text">${item.description}</div>
                            </div>
                            <div class="item-quantity" style="font-size:1.1em;font-weight:bold;color:var(--text-gold);">
                                ×${item.quantity}
                            </div>
                            ${item.type === 'consumable' ? `
                                <button class="btn btn-sm btn-primary" 
                                        onclick="Inventory.useItem('${item.id}')">
                                    🍵 使用
                                </button>
                            ` : `
                                <span style="color:var(--text-muted);font-size:0.8em;">素材</span>
                            `}
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            return '<p style="text-align:center;color:#e74c3c;padding:30px;">道具加载失败</p>';
        }
    }
    
    /**
     * 渲染装备标签
     */
    async function renderEquipmentTab() {
        try {
            const result = await apiGet('/api/inventory/equipment');
            
            if (!result.success) {
                return '<p style="text-align:center;color:#e74c3c;padding:30px;">加载失败</p>';
            }
            
            const equipment = result.data || [];
            
            if (equipment.length === 0) {
                return `
                    <div style="text-align:center;padding:50px 20px;">
                        <div style="font-size:4em;margin-bottom:15px;">⚔️</div>
                        <p style="color:var(--text-muted);">暂无装备</p>
                        <p style="color:var(--text-muted);font-size:0.85em;">继续修行，获得更强装备吧！</p>
                    </div>
                `;
            }
            
            return `
                <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap:14px;">
                    ${equipment.map(eq => `
                        <div class="equipment-slot filled">
                            <div class="slot-icon">${eq.type === 'weapon' ? '⚔️' : '🛡️'}</div>
                            <div class="slot-name">${eq.name}</div>
                            <div style="color:var(--text-muted);font-size:0.8em;">${getEquipTypeLabel(eq.type)}</div>
                            ${eq.attack_bonus ? `<div style="color:var(--color-primary);">⚡ 攻击力 +${eq.attack_bonus}</div>` : ''}
                            ${eq.defense_bonus ? `<div style="color:#3498db;">🛡️ 防御力 +${eq.defense_bonus}</div>` : ''}
                            <div style="color:var(--text-secondary);font-size:0.85em;margin-top:4px;">${eq.description}</div>
                            ${eq.equipped ? '<div style="color:#5a5;margin-top:4px;">✅ 装备中</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        } catch (error) {
            return '<p style="text-align:center;color:#e74c3c;padding:30px;">装备加载失败</p>';
        }
    }
    
    /**
     * 装备/卸下符卡
     */
    async function toggleEquip(cardId, equip) {
        try {
            const res = await apiPost('/api/inventory/spellcards/equip', {
                card_id: cardId,
                equip: equip
            });
            
            if (res.success) {
                Panels.showToast('📜', res.message, 'success');
                // 刷新符卡列表
                const content = document.getElementById('inventoryContent');
                if (content) {
                    content.innerHTML = await renderSpellcardsTab();
                }
            } else {
                Panels.showToast('💢', res.message || '操作失败', 'error');
            }
        } catch (error) {
            Panels.showToast('💢', '装备操作失败', 'error');
        }
    }
    
    /**
     * 使用道具
     */
    async function useItem(itemId) {
        try {
            const res = await apiPost('/api/inventory/items/use', {
                item_id: itemId
            });
            
            if (res.success) {
                Panels.showToast('✨', res.message, 'success');
                // 刷新道具列表
                const content = document.getElementById('inventoryContent');
                if (content) {
                    content.innerHTML = await renderItemsTab();
                }
                // 刷新背包总览中的数量
                updateInventoryCounts();
            } else {
                Panels.showToast('💢', res.message || '使用失败', 'error');
            }
        } catch (error) {
            Panels.showToast('💢', '道具使用失败', 'error');
        }
    }
    
    /**
     * 更新背包标签上的数量
     */
    async function updateInventoryCounts() {
        try {
            const overview = await apiGet('/api/inventory/overview');
            if (overview.success) {
                const tabs = document.querySelectorAll('.inventory-tab');
                if (tabs.length >= 3) {
                    tabs[0].textContent = `📜 符卡 (${overview.data.spell_cards_count})`;
                    tabs[1].textContent = `🎒 道具 (${overview.data.items_count})`;
                    tabs[2].textContent = `⚔️ 装备 (${overview.data.equipment_count})`;
                }
            }
        } catch (e) {
            // 静默失败
        }
    }
    
    // ========== 辅助函数 ==========
    
    function getTypeLabel(type) {
        const labels = { 
            'attack': '🗡️ 攻击', 
            'defense': '🛡️ 防御', 
            'support': '💊 辅助',
            'heal': '💚 回复'
        };
        return labels[type] || type || '未知';
    }
    
    function getItemTypeLabel(type) {
        const labels = { 
            'consumable': '消耗品', 
            'material': '素材',
            'key': '关键道具'
        };
        return labels[type] || type || '道具';
    }
    
    function getEquipTypeLabel(type) {
        const labels = {
            'weapon': '武器',
            'armor': '防具',
            'accessory': '饰品'
        };
        return labels[type] || type || '装备';
    }
    
    // ========== 公开接口 ==========
    
    return {
        renderInventoryModal,
        switchTab,
        toggleEquip,
        useItem,
        updateInventoryCounts
    };
})();

// 导出到全局
window.Inventory = Inventory;