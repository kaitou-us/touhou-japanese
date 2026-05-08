/**
 * 幻想郷 言霊修行帳 - 主应用入口
 */

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🏮 幻想郷 言霊修行帳 - 初始化开始');
    
    // 1. 初始化特效
    Effects.createParticles();
    Effects.initBackToTop();
    
    // 2. 检查 API 状态
    await checkAPIStatus();
    
    // 3. 加载面板
    await Panels.renderPanels();
    
    // 4. 设置导航栏滚动效果
    setupNavScroll();
    
    // 5. 设置弹窗关闭
    setupModalClose();
    
    // 6. 设置时钟更新
    setupClock();
    
    // 7. 设置键盘快捷键
    setupKeyboardShortcuts();
    
    console.log('✅ 初始化完成 - "言灵即是力量"');
});

/**
 * 检查 API 连接状态
 */
async function checkAPIStatus() {
    const indicator = document.getElementById('apiIndicator');
    const text = document.getElementById('apiStatusText');
    
    const isOnline = await API.checkHealth();
    
    if (indicator && text) {
        if (isOnline) {
            indicator.classList.remove('offline');
            text.textContent = '结界稳定';
        } else {
            indicator.classList.add('offline');
            text.textContent = '结界波动';
        }
    }
    
    // 每30秒检查一次
    setInterval(async () => {
        const online = await API.checkHealth();
        if (indicator && text) {
            if (online) {
                indicator.classList.remove('offline');
                text.textContent = '结界稳定';
            } else {
                indicator.classList.add('offline');
                text.textContent = '结界波动';
            }
        }
    }, 30000);
}

/**
 * 导航栏滚动效果
 */
function setupNavScroll() {
    const nav = document.querySelector('.top-nav');
    if (!nav) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

/**
 * 弹窗关闭
 */
function setupModalClose() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', Panels.closeModal);
    }
    
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                Panels.closeModal();
            }
        });
    }
    
    // ESC 关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            Panels.closeModal();
        }
    });
}

/**
 * 时钟更新
 */
function setupClock() {
    const clock = document.getElementById('navClock');
    if (!clock) return;
    
    function update() {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    
    update();
    setInterval(update, 10000);
}

/**
 * 键盘快捷键
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + 数字键 打开对应板块
        if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            Panels.openModal(parseInt(e.key));
        }
        
        // Ctrl/Cmd + R 随机抽卡
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            Panels.openModal(1);
        }
    });
}

/**
 * 快捷栏操作
 */
function quickAction(type) {
    const actions = {
        card: 1,
        duel: 2,
        shop: 3,
        grammar: 4,
        danmaku: 5,
        culture: 6,
    };
    
    const id = actions[type];
    if (id) {
        Panels.openModal(id);
    }
}

// 导出到全局
window.quickAction = quickAction;