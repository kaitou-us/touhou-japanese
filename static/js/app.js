/**
 * 幻想郷 言霊修行帳 - 主应用入口
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏮 幻想郷 言霊修行帳 - 初始化开始');
    
    // ========== 第一步：用户登录检查 ==========
       const existingToken = localStorage.getItem('touhou_user_token');
    
    if (existingToken) {
        const loginSuccess = await autoLogin(existingToken);
        if (loginSuccess) {
            document.getElementById('welcomeOverlay').style.display = 'none';
        } else {
            localStorage.removeItem('touhou_user_token');
            showWelcomeScreen();  // token无效，显示邀请函
        }
    } else {
        showWelcomeScreen();  // 无token，显示邀请函
    }
    
    // ========== 第二步：初始化特效 ==========
    Effects.createParticles();
    Effects.initBackToTop();
    
    // ========== 第三步：检查 API 状态 ==========
    await checkAPIStatus();
    
    // ========== 第四步：加载面板 ==========
    await Panels.renderPanels();
    
    // ========== 第五步：UI 设置 ==========
    setupNavScroll();
    setupModalClose();
    setupClock();
    setupKeyboardShortcuts();
    initJLPTToggle();
    
    // ========== 第六步：加载用户头部信息 ==========
    if (existingToken) {
        await loadUserHeader();
        // 加载每日挑战
        await loadChallenges();
        // 加载签到按钮
        Signin.init();
    }


            
    console.log('✅ 初始化完成 - "言灵即是力量"');
});

// ==================== API 状态检查 ====================

async function checkAPIStatus() {
    const indicator = document.getElementById('apiIndicator');
    const text = document.getElementById('apiStatusText');
    
    if (!indicator || !text) return;
    
    const isOnline = await API.checkHealth();
    
    if (isOnline) {
        indicator.classList.remove('offline');
        text.textContent = '结界稳定';
    } else {
        indicator.classList.add('offline');
        text.textContent = '结界波动';
    }
    
    setInterval(async () => {
        const online = await API.checkHealth();
        if (online) {
            indicator.classList.remove('offline');
            text.textContent = '结界稳定';
        } else {
            indicator.classList.add('offline');
            text.textContent = '结界波动';
        }
    }, 30000);
}

// ==================== 导航栏 ====================

function setupNavScroll() {
    initJLPTToggle();
    const nav = document.querySelector('.top-nav');
    if (!nav) return;
    
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ==================== 弹窗 ====================

function setupModalClose() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', Panels.closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Panels.closeModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay && overlay.classList.contains('active')) {
            Panels.closeModal();
        }
    });
}

// ==================== 时钟 ====================

function setupClock() {
    const clock = document.getElementById('navClock');
    if (!clock) return;
    
    function update() {
        clock.textContent = new Date().toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    update();
    setInterval(update, 10000);
}

// ==================== 键盘快捷键 ====================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            Panels.openModal(parseInt(e.key));
        }
    });
}

// ==================== 快捷栏 ====================

function quickAction(type) {
    const actions = { card: 1, duel: 2, shop: 3, grammar: 4, danmaku: 5, culture: 6 };
    const id = actions[type];
    if (id) Panels.openModal(id);
}

window.quickAction = quickAction;

// ==================== 用户系统 ====================

let currentCharacter = null;

function showWelcomeScreen() {
    const overlay = document.getElementById('welcomeOverlay');
    if (!overlay) return;
    
    overlay.style.display = 'block';
    overlay.style.opacity = '1';
    
    const stepDraw = document.getElementById('stepDraw');
    const stepConfirm = document.getElementById('stepConfirm');
    const drawResult = document.getElementById('drawResult');
    
    if (stepDraw) stepDraw.classList.add('active');
    if (stepConfirm) stepConfirm.classList.remove('active');
    if (drawResult) drawResult.innerHTML = '';
}

async function drawCharacter() {
    const btn = document.getElementById('drawBtn');
    const resultDiv = document.getElementById('drawResult');
    
    if (!btn || !resultDiv) return;
    
    btn.disabled = true;
    btn.textContent = '✨ 抽取中...';
    
    resultDiv.innerHTML = `
        <div class="drawing-animation">
            <span style="font-size:3em;">🌸</span>
            <p class="drawing-text">命运之力正在凝聚...</p>
        </div>
    `;
    
    // 花瓣特效
    for (let i = 0; i < 20; i++) {
        createPetal();
    }
    
    try {
        const res = await fetch(`${window.location.origin}/api/user/draw_character`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        
        await new Promise(r => setTimeout(r, 1500));
        
        if (data.success) {
            currentCharacter = data.data;
            const rarityClass = `rarity-${currentCharacter.rarity}-badge`;
            
            resultDiv.innerHTML = `
                <div class="drawn-character-card">
                    <img src="${currentCharacter.emoji}" class="character-emoji-display" style="width:80px;height:80px;object-fit:contain;">
                    <div class="character-name-display">${currentCharacter.name}</div>
                    <div class="character-title-display">${currentCharacter.title}</div>
                    <div class="character-rarity-badge ${rarityClass}">${currentCharacter.rarity}</div>
                    <p class="character-desc">${currentCharacter.description}</p>
                    <p style="color:#a04060;font-size:0.85em;">
                        🎴 初始符卡：<strong>${currentCharacter.starter_card}</strong>
                    </p>
                    <button class="redraw-button" onclick="drawCharacter()">🔄 重新抽取</button>
                    <br><br>
                    <button class="confirm-button" onclick="goToConfirm()">
                        ✨ 就决定是你了！
                    </button>
                </div>
            `;
        } else {
            throw new Error(data.message || '抽取失败');
        }
    } catch (e) {
        resultDiv.innerHTML = `<p style="color:#e74c3c;">抽取失败，请刷新页面重试</p>`;
        btn.disabled = false;
        btn.textContent = '🎴 抽取你的角色';
    }
}

function goToConfirm() {
    if (!currentCharacter) return;
    
    const stepDraw = document.getElementById('stepDraw');
    const stepConfirm = document.getElementById('stepConfirm');
    const confirmContent = document.getElementById('confirmContent');
    
    if (stepDraw) stepDraw.classList.remove('active');
    if (stepConfirm) stepConfirm.classList.add('active');
    
    if (confirmContent) {
        const rarityClass = `rarity-${currentCharacter.rarity}-badge`;
        
        confirmContent.innerHTML = `
            <div class="drawn-character-card">
                <img src="${currentCharacter.emoji}" class="character-emoji-display" style="width:80px;height:80px;object-fit:contain;">
                <div class="character-name-display">${currentCharacter.name}</div>
                <div class="character-rarity-badge ${rarityClass}">${currentCharacter.rarity}</div>
            </div>
            <div class="welcome-summary">
                <div class="summary-row">
                    <span class="summary-label">角色</span>
                    <span class="summary-value">${currentCharacter.name}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">称号</span>
                    <span class="summary-value">${currentCharacter.title}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">初始符卡</span>
                    <span class="summary-value">${currentCharacter.starter_card}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">初始靈珠</span>
                    <span class="summary-value">💎 ${currentCharacter.starter_currency['靈珠']}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">初始賽錢</span>
                    <span class="summary-value">💰 ${currentCharacter.starter_currency['賽錢']}</span>
                </div>
            </div>
            <div class="name-input-group">
                <p style="color:#6b2040;font-size:0.9em;">为你取一个名字吧：</p>
                <input type="text" class="name-input" id="customNameInput" 
                       placeholder="${currentCharacter.name}" maxlength="20">
            </div>
            <button class="confirm-button" onclick="confirmRegistration()">
                🌸 进入幻想乡
            </button>
            <br>
            <button class="redraw-button" onclick="goBackToDraw()">🔄 重新抽取</button>
        `;
    }
}

function goBackToDraw() {
    const stepDraw = document.getElementById('stepDraw');
    const stepConfirm = document.getElementById('stepConfirm');
    
    if (stepDraw) stepDraw.classList.add('active');
    if (stepConfirm) stepConfirm.classList.remove('active');
}

async function confirmRegistration() {
    if (!currentCharacter) return;
    
    const customName = document.getElementById('customNameInput')?.value || '';
    
    try {
        const res = await fetch(`${window.location.origin}/api/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                character: currentCharacter,
                custom_name: customName.trim()
            })
        });
        
        const data = await res.json();
        
        if (data.success) {
            localStorage.setItem('touhou_user_token', data.data.token);
            
            const overlay = document.getElementById('welcomeOverlay');
            if (overlay) {
                overlay.style.transition = 'opacity 0.8s ease-out';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 800);
            }
            
            setTimeout(() => {
                if (window.Panels && Panels.showToast) {
                    Panels.showToast('🌸', data.message, 'success');
                }
            }, 500);
            
            setTimeout(loadUserHeader, 1000);
            setTimeout(loadChallenges, 1500);  // ← 确保这行存在
        } else {
            alert('注册失败：' + (data.message || '未知错误'));
        }
    } catch (e) {
        console.error('注册失败:', e);
        alert('与幻想乡的连接中断，请刷新页面重试');
    }
}

async function autoLogin(token) {
    try {
        const res = await fetch(`${window.location.origin}/api/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token })
        });
        
        const data = await res.json();
        
        if (data.success) {
            setTimeout(() => {
                if (window.Panels && Panels.showToast) {
                    Panels.showToast('🏮', data.message, 'success');
                }
            }, 800);
            setTimeout(loadUserHeader, 1200);
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

async function loadUserHeader() {
    const token = localStorage.getItem('touhou_user_token');
    if (!token) return;
    
    try {
        const res = await fetch(`${window.location.origin}/api/user/profile?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        
        if (data.success) {
            const user = data.data;

            // 更新头像为PNG
            var avatar = document.querySelector('.user-avatar');
            if (avatar) {
               avatar.innerHTML = '<img src="' + user.character_emoji + '" style="width:50px;height:50px;object-fit:contain;">';
            }
                    
            const els = {
                username: document.getElementById('headerUsername'),
                title: document.getElementById('headerTitle'),
                expBar: document.getElementById('headerExpBar'),
                rei: document.getElementById('headerRei'),
                saisen: document.getElementById('headerSaisen'),
            };
            
            if (els.username) els.username.textContent = user.display_name;
            if (els.title) els.title.textContent = `${user.character_title} · Lv.${user.level}`;
            if (els.expBar) els.expBar.style.width = `${(user.exp / user.exp_to_next * 100).toFixed(1)}%`;
            if (els.rei) els.rei.textContent = user.currencies['靈珠'] || 0;
            if (els.saisen) els.saisen.textContent = user.currencies['賽錢'] || 0;
        }
    } catch (e) {
        console.log('用户信息加载失败');
    }
}

function createPetal() {
    const petals = ['🌸', '💮', '🌺', '💐', '🏵️'];
    const overlay = document.getElementById('welcomeOverlay');
    if (!overlay) return;
    
    const petal = document.createElement('span');
    petal.className = 'petal-particle';
    petal.textContent = petals[Math.floor(Math.random() * petals.length)];
    petal.style.left = Math.random() * 100 + '%';
    petal.style.top = -(Math.random() * 20) + 'px';
    petal.style.animationDuration = (4 + Math.random() * 6) + 's';
    petal.style.animationDelay = Math.random() * 2 + 's';
    
    overlay.appendChild(petal);
    setTimeout(() => petal.remove(), 8000);
}

// ==================== 背包系统 ====================

async function openInventory() {
    const token = localStorage.getItem('touhou_user_token');
    if (!token) {
        if (window.Panels && Panels.showToast) {
            Panels.showToast('💢', '请先完成角色抽取', 'error');
        }
        return;
    }
    
    const overlay = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    
    if (!overlay || !body) return;
    
    body.innerHTML = '<div class="modal-loading"><div class="loading-spinner"></div><p>打开修練帳...</p></div>';
    overlay.classList.add('active');
    
    try {
        const content = await Inventory.renderInventoryModal();
        body.innerHTML = content;
    } catch (e) {
        body.innerHTML = `<p style="color:#e74c3c;text-align:center;padding:30px;">背包打开失败: ${e.message}</p>`;
    }
}

// ==================== 全局导出 ====================

window.drawCharacter = drawCharacter;
window.goToConfirm = goToConfirm;
window.goBackToDraw = goBackToDraw;
window.confirmRegistration = confirmRegistration;
window.openInventory = openInventory;
window.loadUserHeader = loadUserHeader;



// ==================== 搜索系统 ====================

let searchTimeout = null;

function openSearchUI() {
    let searchOverlay = document.getElementById('searchOverlay');
    if (searchOverlay) {
        searchOverlay.classList.add('active');
        const input = document.getElementById('searchInput');
        if (input) input.focus();
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'searchOverlay';
    overlay.className = 'search-overlay active';
    overlay.innerHTML = `
        <div class="search-backdrop" onclick="closeSearchUI()"></div>
        <div class="search-panel">
            <div class="search-header">
                <div class="search-input-wrapper">
                    <input type="text" class="search-input" id="searchInput" 
                           placeholder="搜索词汇、读音、含义、等级..." 
                           oninput="handleSearchInput(this.value)">
                    <button class="search-input-clear" id="searchClearBtn" onclick="clearSearch()">✕</button>
                </div>
                <button class="search-close-btn" onclick="closeSearchUI()">✕</button>
            </div>
            <div class="search-hints">
                <span class="search-hint-tag" onclick="quickSearch('N1')">N1</span>
                <span class="search-hint-tag" onclick="quickSearch('N2')">N2</span>
                <span class="search-hint-tag" onclick="quickSearch('N3')">N3</span>
                <span class="search-hint-tag" onclick="quickSearch('N4')">N4</span>
                <span class="search-hint-tag" onclick="quickSearch('N5')">N5</span>
                <span class="search-hint-tag" onclick="quickSearch('SSR')">⭐ SSR</span>
                <span class="search-hint-tag" onclick="quickSearch('自然')">自然</span>
                <span class="search-hint-tag" onclick="quickSearch('幻想')">幻想</span>
            </div>
            <div class="search-results" id="searchResults">
                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                    <span style="font-size:2.5em;display:block;margin-bottom:10px;">🔍</span>
                    输入关键词开始搜索符卡词汇
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => {
        const input = document.getElementById('searchInput');
        if (input) input.focus();
    }, 300);
}

function closeSearchUI() {
    const overlay = document.getElementById('searchOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

function handleSearchInput(query) {
    const clearBtn = document.getElementById('searchClearBtn');
    if (clearBtn) clearBtn.classList.toggle('visible', query.length > 0);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (!query.trim()) {
        document.getElementById('searchResults').innerHTML = `
            <div style="text-align:center;padding:40px;color:var(--text-muted);">
                <span style="font-size:2.5em;display:block;margin-bottom:10px;">🔍</span>
                输入关键词开始搜索符卡词汇
            </div>
        `;
        return;
    }
    
    searchTimeout = setTimeout(() => performSearch(query.trim()), 300);
}

async function performSearch(query) {
    const resultsDiv = document.getElementById('searchResults');
    resultsDiv.innerHTML = '<div class="search-loading"><div class="loading-spinner"></div></div>';
    
    try {
        // 获取 JLPT 设置
        const jlpt = localStorage.getItem('jlpt_enabled') || 'true';
        const res = await fetch(`${window.location.origin}/api/cards/search?q=${encodeURIComponent(query)}&jlpt=${jlpt}`);
        const data = await res.json();
        
        if (!data.success || data.total === 0) {
            resultsDiv.innerHTML = `
                <div class="search-no-results">
                    <span class="no-results-icon">🔍</span>
                    <p>未找到与 "<strong>${escapeHTML(query)}</strong>" 相关的词汇</p>
                    <p style="font-size:0.85em;margin-top:5px;">试试搜索：N1、SSR、自然、幻想...</p>
                </div>
            `;
            return;
        }
        
        const infoHTML = `<div class="search-result-info">找到 <strong>${data.total}</strong> 个词汇${jlpt === 'false' ? '（JLPT已隐藏）' : ''}</div>`;
        
        const itemsHTML = data.results.map(item => {
            const c = item;
            return `
                <div class="search-result-item" onclick="viewCardDetail(${c.id})">
                    <span class="search-result-rarity ${c.rarity}">${c.rarity}</span>
                    <span class="search-result-word">${c.word}</span>
                    <span class="search-result-reading">${c.reading || ''}</span>
                    <span class="search-result-meaning">${c.meaning}</span>
                    <span class="search-result-level">${c.level || ''}</span>
                </div>
            `;
        }).join('');
        
        resultsDiv.innerHTML = infoHTML + itemsHTML;
    } catch (e) {
        resultsDiv.innerHTML = '<div class="search-no-results"><p>查询失败，请检查网络</p></div>';
    }
}

function quickSearch(query) {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = query;
        handleSearchInput(query);
        input.focus();
    }
}

function clearSearch() {
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = '';
        handleSearchInput('');
        input.focus();
    }
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function viewCardDetail(cardId) {
    closeSearchUI();
    setTimeout(() => Panels.openModal(1), 200);
}

// 导出搜索函数
window.openSearchUI = openSearchUI;
window.closeSearchUI = closeSearchUI;
window.handleSearchInput = handleSearchInput;
window.quickSearch = quickSearch;
window.clearSearch = clearSearch;
window.viewCardDetail = viewCardDetail;


// ==================== JLPT 单词切换 ====================

let jlptEnabled = true;  // 默认开启

function toggleJLPT() {
    jlptEnabled = !jlptEnabled;
    const btn = document.getElementById('jlptToggleBtn');
    
    if (btn) {
        if (jlptEnabled) {
            btn.classList.add('active');
            btn.classList.remove('disabled');
            btn.title = 'JLPT单词已开启';
            Panels.showToast('📚', 'JLPT单词已开启，可以抽取所有词汇', 'success');
        } else {
            btn.classList.remove('active');
            btn.classList.add('disabled');
            btn.title = 'JLPT单词已关闭';
            Panels.showToast('🔒', 'JLPT单词已隐藏，只抽取幻想乡原词', 'info');
        }
    }
    
    // 保存设置
    localStorage.setItem('jlpt_enabled', jlptEnabled.toString());
}

function initJLPTToggle() {
    // 从 localStorage 加载设置
    const saved = localStorage.getItem('jlpt_enabled');
    if (saved !== null) {
        jlptEnabled = saved === 'true';
    }
    
    const btn = document.getElementById('jlptToggleBtn');
    if (btn) {
        if (jlptEnabled) {
            btn.classList.add('active');
        } else {
            btn.classList.add('disabled');
        }
    }
}

window.toggleJLPT = toggleJLPT;

// 加载每日挑战面板
async function loadChallenges() {
    // 等待一小段时间确保 Challenges 模块加载
    await new Promise(r => setTimeout(r, 500));
    
    const container = document.getElementById('challengePanelContainer');
    if (container && window.Challenges) {
        try {
            container.innerHTML = await Challenges.renderChallengePanel();
        } catch (e) {
            console.log('挑战面板加载失败:', e);
        }
    }
}
