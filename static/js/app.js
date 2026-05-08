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
            showWelcomeScreen();
        }
    } else {
        showWelcomeScreen();
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
    
    // ========== 第六步：加载用户头部信息 ==========
    if (existingToken) {
        await loadUserHeader();
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
                    <span class="character-emoji-display">${currentCharacter.emoji}</span>
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
                <span class="character-emoji-display">${currentCharacter.emoji}</span>
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