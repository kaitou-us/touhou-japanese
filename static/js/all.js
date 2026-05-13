/**
 * 幻想郷 言霊修行帳 - API 模块
 * 所有与 Flask 后端的通信都通过这里
 */

const API = (() => {
    const BASE_URL = window.location.origin;
    
    /**
     * 通用请求函数
     */
    async function request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };
        
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * GET 请求
     */
    function get(endpoint) {
        return request(endpoint);
    }
    
    /**
     * POST 请求
     */
    function post(endpoint, body) {
        return request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    }
    
    // ==================== 公开 API ====================
    
    return {
        /**
         * 健康检查
         */
        async checkHealth() {
            try {
                const res = await fetch(`${BASE_URL}/api/panels`);
                return res.ok;
            } catch {
                return false;
            }
        },
        
        /**
         * 获取所有板块信息
         */
        getPanels() {
            return get('/api/panels');
        },
        
        /**
         * 随机抽取词汇符卡
         */
        getRandomCard() {
            return get('/api/card/random');
        },
        
        /**
         * 获取所有符卡
         */
        getAllCards() {
            return get('/api/cards');
        },
        
        /**
         * 获取指定ID的符卡
         */
        getCardById(id) {
            return get(`/api/card/${id}`);
        },
        
        /**
         * 获取对决信息
         */
        getDuelInfo() {
            return get('/api/duel');
        },
        
        /**
         * 提交对决宣告
         */
        submitDuel(spellName) {
            return post('/api/duel', { spell_name: spellName });
        },
        
        /**
         * 获取杂货铺商品
         */
        getShopItems() {
            return get('/api/shop');
        },
        
        /**
         * 模拟购买
         */
        buyItem(itemName) {
            return post('/api/shop/buy', { item_name: itemName });
        },
        
        /**
         * 获取语法知识点
         */
        getGrammar() {
            return get('/api/grammar');
        },
        
        /**
         * 获取随机弹幕题目
         */
        getRandomDanmaku() {
            return get('/api/danmaku/random');
        },
        
        /**
         * 检查弹幕答案
         */
        checkDanmaku(answer, exerciseId) {
            return post('/api/danmaku/check', {
                answer: answer,
                exercise_id: exerciseId,
            });
        },
        
        /**
         * 获取文化信息
         */
        getCulture() {
            return get('/api/culture');
        },
        
        /**
         * 搜索词汇
         */
        search(query) {
            return get(`/api/search?q=${encodeURIComponent(query)}`);
        },
    };
})();/**
 * 幻想郷 言霊修行帳 - 特效系统
 * 粒子、背景、动画效果
 */

const Effects = (() => {
    
    /**
     * 创建浮动粒子系统
     */
    function createParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;
        
        const particleTypes = ['🦋', '🌸', '🍂', '✨', '💫', '🍃', '🏮', '💮'];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.className = 'butterfly-particle';
            particle.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${8 + Math.random() * 15}s`;
            particle.style.fontSize = `${10 + Math.random() * 20}px`;
            particle.style.opacity = `${0.3 + Math.random() * 0.5}`;
            
            container.appendChild(particle);
        }
        
        // 添加蝴蝶粒子样式（如果还没有）
        if (!document.getElementById('particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                .butterfly-particle {
                    position: fixed;
                    pointer-events: none;
                    z-index: 0;
                    animation: floatUp linear infinite;
                    will-change: transform;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 创建弹幕飞行特效
     */
    function createDanmakuEffect(container, count = 8) {
        const colors = ['#e74c3c', '#d4a574', '#f0e6d3', '#c0392b', '#e8c9a0'];
        
        for (let i = 0; i < count; i++) {
            const bullet = document.createElement('div');
            const size = 4 + Math.random() * 8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            bullet.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color};
                pointer-events: none;
                z-index: 1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                --fly-x: ${(Math.random() - 0.5) * 200}px;
                --fly-y: ${(Math.random() - 0.5) * 200}px;
                animation: danmakuFly ${1 + Math.random() * 2}s ease-out forwards;
            `;
            
            container.appendChild(bullet);
            
            // 动画结束后移除
            setTimeout(() => bullet.remove(), 3000);
        }
    }
    
    /**
     * 洗练成功特效
     */
    function refinementSuccessEffect(element) {
        // 创建闪光粒子
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 3px;
                height: 3px;
                background: #d4a574;
                border-radius: 50%;
                pointer-events: none;
                z-index: 999;
                box-shadow: 0 0 6px #d4a574;
                transition: all ${0.5 + Math.random() * 0.5}s ease-out;
            `;
            
            document.body.appendChild(spark);
            
            requestAnimationFrame(() => {
                spark.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0)`;
                spark.style.opacity = '0';
            });
            
            setTimeout(() => spark.remove(), 1000);
        }
    }
    
    /**
     * 抽卡翻转特效
     */
    function cardFlipEffect(element) {
        element.style.animation = 'none';
        element.offsetHeight; // 强制回流
        element.style.animation = 'cardFlip 0.6s ease-in-out';
    }
    
    /**
     * 灵力波动特效
     */
    function spiritPulseEffect(element) {
        element.classList.add('animate-spiritWave');
        setTimeout(() => element.classList.remove('animate-spiritWave'), 2000);
    }
    
    /**
     * 滚动到元素
     */
    function scrollToElement(element, offset = 80) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
    
    /**
     * 回到顶部
     */
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 初始化回到顶部按钮
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        btn.addEventListener('click', scrollToTop);
    }
    
    return {
        createParticles,
        createDanmakuEffect,
        refinementSuccessEffect,
        cardFlipEffect,
        spiritPulseEffect,
        scrollToElement,
        scrollToTop,
        initBackToTop,
    };
})();const AudioManager = (() => {
    var bgm = new Audio('/static/audio/bgm.mp3');
    bgm.loop = true; bgm.volume = 0.3;
    
    var battle1 = new Audio('/static/audio/battle1.mp3');
    battle1.loop = true; battle1.volume = 0.4;
    
    var battle2 = new Audio('/static/audio/battle2.mp3');
    battle2.loop = true; battle2.volume = 0.4;
    
    var damage = new Audio('/static/audio/damage.mp3');
    damage.volume = 0.5;
    
    var victory = new Audio('/static/audio/victory.mp3');
    victory.volume = 0.5;
    
    var current = null;

    function stopAll() {
        bgm.pause(); bgm.currentTime = 0;
        battle1.pause(); battle1.currentTime = 0;
        battle2.pause(); battle2.currentTime = 0;
        damage.pause(); damage.currentTime = 0;
        victory.pause(); victory.currentTime = 0;
        current = null;
    }

    function play(audio) {
        stopAll();
        audio.currentTime = 0;
        audio.play().catch(function(){});
        current = audio;
    }

    function playBGM()        { play(bgm); }
    function playBattle(id)   { play(id === 'yukari' ? battle2 : battle1); }
    function playDamage()     { damage.currentTime = 0; damage.play().catch(function(){}); }
    function playVictory()    { stopAll(); victory.currentTime = 0; victory.play().catch(function(){}); }

    return { playBGM, playBattleMusic: playBattle, playDamage, playVictory, stopAll };
})();
window.AudioManager = AudioManager;/**
 * 幻想郷 言霊修行帳 - 六大板块逻辑
 */

const Panels = (() => {
    // 当前弹幕洗练状态
    let selectedWords = [];
    let currentExerciseId = 1;
    
    /**
     * 渲染面板列表
     */
    async function renderPanels() {
        const grid = document.getElementById('panelsGrid');
        
        try {
            const result = await API.getPanels();
            
            if (!result.success) {
                throw new Error(result.message);
            }
            
            grid.innerHTML = result.data.map((panel, index) => `
                <div class="panel ${panel.featured ? 'featured' : ''} anim-hidden delay-${index * 100}" 
                     data-id="${panel.id}"
                     onclick="Panels.openModal(${panel.id})">
                    <div class="panel-header">
                        <div class="panel-icon-wrapper">${panel.icon}</div>
                        <div>
                            <div class="panel-number">${panel.number}</div>
                            <div class="panel-title">${panel.title}</div>
                        </div>
                    </div>
                    <div class="panel-body">
                        <p>${panel.description}</p>
                        <span class="preview-jp">${getPreviewJP(panel.id)}</span>
                        <span class="preview-hint">${getPreviewHint(panel.id)}</span>
                        <div class="panel-tags">
                            ${getPanelTags(panel.id).map(tag => `<span class="panel-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `).join('');
            
            requestAnimationFrame(() => {
                grid.querySelectorAll('.panel').forEach((panel, i) => {
                    setTimeout(() => {
                        panel.classList.add('visible');
                    }, i * 100);
                });
            });
            
        } catch (error) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align:center; padding:40px; color:#e74c3c;">
                    <p>🏮 结界波动中...</p>
                    <p style="color:#887060; font-size:0.9em;">${error.message}</p>
                    <button class="btn btn-ghost" onclick="location.reload()">重新连接</button>
                </div>
            `;
        }
    }
    
    function getPreviewJP(id) {
        const previews = {
            1: '【夢】ゆめ — 梦想',
            2: '【宣告】スペルカード発動！',
            3: '「これ、いくらですか？」',
            4: '私は リンゴを 食べます',
            5: 'を · 私 · ケーキ · 食べます',
            6: '二礼二拍手一礼',
        };
        return previews[id] || '';
    }
    
    function getPreviewHint(id) {
        const hints = {
            1: 'SSR级言灵 · 音调②型',
            2: '选择对手，用符卡战斗！',
            3: '黄瓜特价中！河城荷取的推荐',
            4: '主语+宾语+谓语 = SOV结构',
            5: '洗练弹幕，发动华丽反击',
            6: '从神社看日本神话文化',
        };
        return hints[id] || '';
    }
    
    function getPanelTags(id) {
        const tags = {
            1: ['词汇', '符卡', 'SSR'],
            2: ['对决', '战斗', '赏金'],
            3: ['购物', '生活', '実践'],
            4: ['文法', '语序', 'SOV'],
            5: ['练习', '句子', '互动'],
            6: ['文化', '神社', '神話'],
        };
        return tags[id] || [];
    }
    
    async function openModal(id) {
        const overlay = document.getElementById('modalOverlay');
        const body = document.getElementById('modalBody');
        
        body.innerHTML = `<div class="modal-loading"><div class="loading-spinner"></div><p>言灵之力加载中...</p></div>`;
        overlay.classList.add('active');
        
        try {
            let content = '';
            switch (id) {
                case 1: content = await renderCardPanel(); break;
                case 2: content = await renderDuelPanel(); break;
                case 3: content = await renderShopPanel(); break;
                case 4: content = await renderGrammarPanel(); break;
                case 5: content = await renderDanmakuPanel(); break;
                case 6: content = await renderCulturePanel(); break;
                default: content = '<p>未知的板块...</p>';
            }
            body.innerHTML = content;
            
            const danmakuZone = body.querySelector('.danmaku-zone');
            if (danmakuZone) Effects.createDanmakuEffect(danmakuZone, 5);
        } catch (error) {
            body.innerHTML = `<div class="modal-loading" style="color:#e74c3c;"><p>🏮 言灵之力不足...</p><p style="font-size:0.9em;">${error.message}</p></div>`;
        }
    }
    
    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        selectedWords = [];
        currentExerciseId = 1;
    }
    
    // ==================== 1. 词汇符卡 ====================
    
    async function getFilteredRandomCard() {
        const jlpt = localStorage.getItem('jlpt_enabled') || 'true';
        const res = await fetch(`${window.location.origin}/api/card/random/filtered?jlpt=${jlpt}`);
        return res.json();
    }
    
    async function renderCardPanel() {
        try {
            const result = await getFilteredRandomCard();
            const card = result.data;
            var readingDisplay = card.reading || '';
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">📜 词汇符卡 — 言灵収集</div>
                    <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">Spell Card Collection · 理解关键名词</div>
                </div>
                <div class="modal-content">
                    <div class="ofuda-card ${card.rarity === 'SSR' ? 'ssr' : ''}" id="ofudaCard">
                        <div class="rarity-badge">${'★'.repeat(card.rarity === 'SSR' ? 5 : card.rarity === 'SR' ? 4 : 3)} ${card.rarity}</div>
                        <div class="favorite-btn" id="favBtn" onclick="event.stopPropagation(); Favorites.toggleFavorite({id: ${card.id}, word: '${card.word}', reading: '${card.reading || ''}', meaning: '${card.meaning || ''}', rarity: '${card.rarity}', level: '${card.level || ''}'}).then(function(result) { document.getElementById('favBtn').textContent = result ? '⭐' : '☆'; document.getElementById('favBtn').classList.toggle('favorited', result); })">☆</div>
                        <div class="card-level">${card.level || ''}</div>
                        <div class="card-word">${card.word}</div>
                        <div class="card-reading">${readingDisplay}</div>
                        <div class="card-meaning">${card.meaning}</div>
                        <div class="card-example"><strong>例句：</strong>${card.example}<br><span style="color:#8b4513;">${card.example_reading}</span></div>
                        <div style="margin-top:8px;font-size:0.8em;color:#a08060;">分类：${card.category}</div>
                    </div>
                    <p style="text-align:center; color:#b8956a; margin-top:15px;">✦ 点击下方按钮重新抽取符卡 ✦</p>
                    <div style="text-align:center;"><button class="btn btn-primary btn-lg" onclick="Panels.refreshCard()">🎴 抽取新的符卡</button></div>
                </div>`;
        } catch (error) { throw error; }
    }
    
    async function refreshCard() {
        try {
            var result = await getFilteredRandomCard();
            if (!result || !result.success) { Panels.showToast('💢', result?.message || '抽卡失败', 'error'); return; }
            var card = result.data;
            var display = document.getElementById('ofudaCard');
            if (display && card) {
                var readingDisplay = card.reading || '';
                display.className = 'ofuda-card ' + (card.rarity === 'SSR' ? 'ssr' : '');
                display.innerHTML = `
                    <div class="rarity-badge">${'★'.repeat(card.rarity === 'SSR' ? 5 : card.rarity === 'SR' ? 4 : 3)} ${card.rarity}</div>
                    <div class="card-level">${card.level || ''}</div>
                    <div class="card-word">${card.word}</div>
                    <div class="card-reading">${readingDisplay}</div>
                    <div class="card-meaning">${card.meaning}</div>
                    <div class="card-example"><strong>例句：</strong>${card.example}<br><span style="color:#8b4513;">${card.example_reading}</span></div>
                    <div style="margin-top:8px;font-size:0.8em;color:#a08060;">分类：${card.category}</div>`;
                Effects.cardFlipEffect(display);
                Panels.showToast('🎴', '抽到了 ' + card.rarity + ' 级言灵：' + card.word);
                if (window.Challenges) { Challenges.updateProgress('draw_card', 1); Challenges.updateProgress('learn_word', 1); if (card.rarity === 'SSR') Challenges.updateProgress('draw_card', 1); }
            }
        } catch (error) { Panels.showToast('💢', '抽卡失败，请重试', 'error'); }
    }
    
    // ==================== 2. 符卡对决（简化战斗系统） ====================

    let battleDrawnCards = [];
    let currentOpponent = null;
    let currentOpponentHP = 0;
    let currentOpponentMaxHP = 0;
    let currentCardIndex = 0;

    var OPPONENTS = {
        'cirno': {id:'cirno', name:'チルノ', hp:300, emoji:'❄️', reward:80},
        'reimu': {id:'reimu', name:'博麗霊夢', hp:600, emoji:'🧙‍♀️', reward:200},
        'yukari': {id:'yukari', name:'八雲紫', hp:999, emoji:'🦊', reward:500}
    };

    var DAMAGE_MAP = {'SSR': 250, 'SR': 120, 'R': 50};

    async function renderDuelPanel() {
        if (window.Challenges) Challenges.updateProgress('learn_word', 1);
        
        var html = '<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">⚔️ 符卡对决 — 幻想乡武道会</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">选择对手，抽取符卡，用言灵之力击败他们！</div></div>';
        html += '<div style="margin-bottom:15px;text-align:center;"><button class="btn btn-primary" onclick="Panels.showHandCards()">🎴 符卡存放 (' + battleDrawnCards.length + '/7)</button> <button class="btn btn-ghost" onclick="Panels.drawBattleCards()">🀄 抽取符卡</button></div>';
        
        for (var key in OPPONENTS) {
            var o = OPPONENTS[key];
            html += '<div class="opponent-card" id="opp_' + o.id + '" onclick="Panels.startBattle(\'' + o.id + '\')"><img src="/static/images/opponents/' + o.id + '_normal.png" style="width:100px;height:auto;"><div class="opponent-name">' + o.name + '</div><div class="opponent-hp">❤️ HP: ' + o.hp + '</div><div class="opponent-reward">💰 赏金: ' + o.reward + ' 賽錢</div></div>';
        }
        
        html += '<p style="text-align:center;color:#887060;font-size:0.8em;margin-top:10px;">需要先抽取符卡才能开始战斗</p>';
        return html;
    }

    async function drawBattleCards() {
        if (battleDrawnCards.length >= 7) { Panels.showToast('💢', '手牌已满（最多7张）', 'error'); return; }
        var jlpt = localStorage.getItem('jlpt_enabled') || 'true';
        try {
            var res = await fetch(window.location.origin + '/api/card/random/filtered?jlpt=' + jlpt);
            var data = await res.json();
            if (data.success) {
                // 二次检查防止溢出
                if (battleDrawnCards.length >= 7) { return; }
                battleDrawnCards.push({word: data.data.word, reading: data.data.reading || '', meaning: data.data.meaning || '', rarity: data.data.rarity || 'R', revealed: false, used: false});
                Panels.showToast('🎴', '获得符卡：' + data.data.word, 'success');
                document.getElementById('modalBody').innerHTML = await renderDuelPanel();
            }
        } catch (e) { Panels.showToast('💢', '抽取失败', 'error'); }
    }

    function showHandCards() {
        if (battleDrawnCards.length === 0) { Panels.showToast('💢', '手牌为空', 'error'); return; }
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
        var panel = document.createElement('div');
        panel.style.cssText = 'background:var(--bg-modal);border:2px solid var(--border-gold);border-radius:12px;padding:20px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;';
        var listHTML = '';
        for (var i = 0; i < battleDrawnCards.length; i++) {
            var c = battleDrawnCards[i];
            listHTML += '<div style="background:rgba(0,0,0,0.3);border:1px solid var(--border-light);border-radius:8px;padding:10px;text-align:center;' + (c.used ? 'opacity:0.3;' : '') + '"><div style="color:var(--text-gold);font-size:1.1em;">' + c.word + '</div><div style="color:#c0392b;font-size:0.8em;">' + (c.reading || '') + '</div><div style="color:var(--text-muted);font-size:0.75em;">' + c.rarity + (c.used ? ' (已使用)' : '') + '</div></div>';
        }
        panel.innerHTML = '<h3 style="color:var(--text-gold);text-align:center;margin-bottom:15px;">🎴 符卡存放 (' + battleDrawnCards.length + '/7)</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">' + listHTML + '</div><button class="btn btn-ghost" style="margin-top:15px;width:100%;" onclick="this.parentElement.parentElement.remove()">关闭</button>';
        overlay.appendChild(panel);
        document.body.appendChild(overlay);
    }

    // 新版战斗：点击敌人直接进入
    function startBattle(opponentId) {
        if (battleDrawnCards.length === 0) { Panels.showToast('💢', '请先抽取符卡', 'error'); return; }
        currentOpponent = OPPONENTS[opponentId];
        currentOpponentHP = currentOpponent.hp;
        currentOpponentMaxHP = currentOpponent.hp;
        currentCardIndex = 0;
        AudioManager.playBattleMusic(opponentId);
        renderBattleScreen2();
    }

    // 战斗界面：敌人+战斗按钮，单词等点击战斗按钮才显示
    function renderBattleScreen2() {
        var body = document.getElementById('modalBody');
        var opp = currentOpponent;
        var html = '<div class="modal-header"><div class="modal-title" style="font-size:1.4em;color:var(--color-gold);text-align:center;">⚔️ VS ' + opp.name + '</div></div>';
        html += '<div class="battle-arena"><div class="battle-opponent-zone">';
        html += '<img id="oppImage" src="/static/images/opponents/' + opp.id + '_normal.png" style="width:120px;height:auto;transition:0.3s;">';
        html += '<div style="color:var(--text-gold);">' + opp.name + '</div>';
        html += '<div class="hp-bar-outer"><div class="hp-bar-inner" id="hpBar" style="width:' + (currentOpponentHP / currentOpponentMaxHP * 100) + '%"></div></div>';
        html += '<div class="hp-text" id="hpText">❤️ ' + currentOpponentHP + ' / ' + currentOpponentMaxHP + '</div></div>';
        html += '<div class="battle-hand-zone"><div id="cardArea" style="text-align:center;min-height:120px;"></div>';
        html += '<div style="text-align:center;margin-top:20px;"><button class="btn btn-primary btn-lg" id="fightBtn" onclick="Panels.revealCard()">⚡ 战斗</button></div></div></div>';
        html += '<div style="text-align:center;margin-top:15px;"><button class="btn btn-ghost" onclick="AudioManager.stopAll(); AudioManager.playBGM(); Panels.renderDuelPanel().then(function(h){document.getElementById(\'modalBody\').innerHTML=h;})">🔙 返回</button></div>';
        body.innerHTML = html;
    }

    // 点击战斗按钮：随机弹出一张未使用的符卡（只显示汉字）
    function revealCard() {
        if (currentOpponentHP <= 0) return;
        
        // 找未使用的卡
        var unused = [];
        for (var i = 0; i < battleDrawnCards.length; i++) {
            if (!battleDrawnCards[i].used) unused.push(i);
        }
        if (unused.length === 0) {
            Panels.showToast('💢', '所有符卡已用完！', 'error');
            endBattle(false);
            return;
        }
        
        var idx = unused[Math.floor(Math.random() * unused.length)];
        currentCardIndex = idx;
        var card = battleDrawnCards[idx];
        card.revealed = false;
        
        // 只显示汉字，不显示假名
        var cardArea = document.getElementById('cardArea');
        cardArea.innerHTML = '<div class="hand-card revealed" onclick="Panels.attackAndShowReading()" style="cursor:pointer;padding:20px;background:var(--bg-panel);border:2px solid var(--border-gold);border-radius:8px;">' +
            '<div class="card-front-word" style="font-size:2em;color:var(--text-gold);">' + card.word + '</div>' +
            '<div id="readingSpot" style="color:#c0392b;font-size:1.2em;margin-top:8px;min-height:28px;"></div>' +
            '<div style="color:var(--text-muted);font-size:0.8em;margin-top:8px;">点击揭示读音并攻击</div></div>';
        
        document.getElementById('fightBtn').disabled = true;
        document.getElementById('fightBtn').textContent = '🎴 点击符卡攻击';
    }
    // 点击符卡攻击：显示符卡的假名，扣除血量，显示伤害数字
    function attackAndShowReading() {
        var card = battleDrawnCards[currentCardIndex];
        card.revealed = true;
        card.used = true;
        // 显示假名
        document.getElementById('readingSpot').textContent = card.reading || card.word;
        // 扣除血量
        var damage = DAMAGE_MAP[card.rarity] || 50;
        currentOpponentHP = Math.max(0, currentOpponentHP - damage);
        AudioManager.playDamage();
        // 更新血条
        document.getElementById('hpBar').style.width = (currentOpponentHP / currentOpponentMaxHP * 100) + '%';
        document.getElementById('hpText').textContent = '❤️ ' + currentOpponentHP + ' / ' + currentOpponentMaxHP;
        // 禁用符卡，显示伤害数字
        document.getElementById('cardArea').querySelector('.hand-card').onclick = null;
        document.getElementById('cardArea').querySelector('.hand-card').style.opacity = '0.5';
        document.getElementById('cardArea').querySelector('.hand-card').style.cursor = 'default';
        
        document.getElementById('fightBtn').disabled = false;
        document.getElementById('fightBtn').textContent = '⚡ 战斗';
        // 显示伤害数字
        showDamageNumber(damage);

        // 根据稀有度切换表情
        var oppImage = document.getElementById('oppImage');
        if (oppImage) {
            if (currentOpponentHP <= 0) {
                oppImage.src = '/static/images/opponents/' + currentOpponent.id + '_angry.png';
            } else if (card.rarity === 'SSR') {
                oppImage.src = '/static/images/opponents/' + currentOpponent.id + '_cry.png';
            } else if (card.rarity === 'SR') {
                oppImage.src = '/static/images/opponents/' + currentOpponent.id + '_sad.png';
            } else {
                oppImage.src = '/static/images/opponents/' + currentOpponent.id + '_surprised.png';
            }
        }

        if (currentOpponentHP <= 0) {
            setTimeout(function() { endBattle(true); }, 1200);
        } else {
            var allUsed = battleDrawnCards.every(function(c) { return c.used; });
            if (allUsed) {
                if (oppImage) oppImage.src = '/static/images/opponents/' + currentOpponent.id + '_angry.png';
                setTimeout(function() { endBattle(false); }, 1200);
            }
        }
    }

    function endBattle(victory) {
        var oppEmoji = document.getElementById('oppEmoji');
        if (victory && oppEmoji) oppEmoji.style.filter = 'grayscale(1)';
        
        if (victory) {
            AudioManager.playVictory(); 
            var rewardMsg = '';
            var token = localStorage.getItem('touhou_user_token');
            if (token) {
                fetch('/api/battle/reward', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({token: token, opponent_id: currentOpponent.id})
                }).then(function(r){return r.json()}).then(function(d){
                    if (d.success) {
                        battleDrawnCards = battleDrawnCards.filter(function(c) { return !c.used; });
                        showVictoryPopup('获得 ' + d.reward + ' 賽錢！');
                        AudioManager.playBGM(); 
                    }
                });
            }
        } else {
            Panels.showToast('💢', '战斗失败，请重新挑战', 'error');
            battleDrawnCards = [];
        }
    }

    function showDamageNumber(damage) {
        var popup = document.createElement('div');
        popup.style.cssText = 'position:fixed;font-size:2em;font-weight:bold;color:#ff4444;pointer-events:none;z-index:200;left:45%;top:30%;animation:floatUp 1s ease-out forwards;';
        popup.textContent = '-' + damage;
        document.body.appendChild(popup);
        setTimeout(function() { popup.remove(); }, 1000);
    }

    function showVictoryPopup(rewardMsg) {
        var popup = document.createElement('div');
        popup.className = 'victory-popup';
        popup.innerHTML = '<span class="victory-emoji">🎉</span><div class="victory-text">胜利！</div><p>' + rewardMsg + '</p><button class="btn btn-primary" style="margin-top:15px;" onclick="AudioManager.stopAll(); AudioManager.playBGM(); this.parentElement.remove(); Panels.renderDuelPanel().then(function(h){document.getElementById(\'modalBody\').innerHTML=h;})">返回</button>';
        document.body.appendChild(popup);
    }
                    
    // ==================== 3. 河童杂货铺 ====================
    
    async function renderShopPanel() {
        try {
            const result = await API.getShopItems();
            const shop = result.data;
            const itemsHTML = shop.map(item => `
                <div class="shop-item"><div class="item-emoji">${item.icon}</div><div class="item-details"><div class="item-name">${item.name_jp}</div><div class="item-desc">${item.description} (${item.name_cn})</div></div><div class="item-price">¥${item.price}</div><button class="btn btn-sm btn-primary" onclick="Panels.buyItem('${item.name_jp}')">購入</button></div>`).join('');
            return `<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">🏮 河童杂货铺 — 买卖修行</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">店主：${result.shopkeeper} · いらっしゃいませ！</div></div><p style="text-align:center;color:#d4a574;margin-bottom:15px;">💬 ${result.greeting}</p>${itemsHTML}<p id="buyResult" style="text-align:center;margin-top:15px;color:#d4a574;min-height:24px;"></p>`;
        } catch (error) { throw error; }
    }
    
    async function buyItem(itemName) {
        const token = localStorage.getItem('touhou_user_token') || '';
        try {
            const res = await fetch(`${window.location.origin}/api/shop/buy`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item_name:itemName,token})});
            const data = await res.json();
            const resultDiv = document.getElementById('buyResult');
            if (resultDiv) {
                if (data.success) { resultDiv.innerHTML = `🛒 ${data.message}${data.balance!==undefined?' (剩余賽錢: '+data.balance+')':''}`; showToast('🛒', data.message, 'success'); if(window.loadUserHeader) setTimeout(window.loadUserHeader, 500); }
                else { resultDiv.innerHTML = `💢 ${data.message}`; showToast('💢', data.message, 'error'); }
            }
        } catch (error) { showToast('💢', '购买失败', 'error'); }
    }
    
    // ==================== 4. 文法罗盘 ====================
    
    async function renderGrammarPanel() {
        try {
            const result = await API.getGrammar();
            const grammar = result.data[0];
            return `<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">🧭 迷路竹林文法罗盘</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">Grammar Compass · 语序结构指引</div></div><p style="color:#d4a574;text-align:center;font-size:1.05em;">${grammar.description}</p><div style="text-align:center;font-size:1.2em;margin:20px 0;">❌ ${grammar.example_wrong} (SVO)<br>✅ ${grammar.example_correct} (SOV)</div><div class="compass-visual"><div class="compass-diagram"><div class="compass-pointer">🧭</div></div><div class="compass-formula">${grammar.formula}</div></div><p style="text-align:center;color:#b8956a;margin-top:15px;">${grammar.tip}</p><p style="text-align:center;color:#887060;">${result['compass_口诀']}</p>`;
        } catch (error) { throw error; }
    }
    
    // ==================== 5. 弹幕洗练 ====================
    
    async function renderDanmakuPanel() {
        try {
            const result = await API.getRandomDanmaku();
            const exercise = result.data;
            currentExerciseId = exercise.id;
            selectedWords = [];
            const wordsHTML = exercise.shuffled_words.map(w => `<span class="danmaku-word-chip" data-word="${w}" onclick="Panels.toggleDanmakuWord(this)">${w}</span>`).join('');
            return `<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">💥 弹幕洗练 — 句子重组</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">目标：${exercise.meaning}</div></div><p style="text-align:center;color:#b8956a;">按正确顺序点击散乱的弹幕词块：</p><div class="danmaku-zone" id="danmakuZone"><div class="danmaku-words-container" id="danmakuWords">${wordsHTML}</div><div class="danmaku-assembled-area" id="assembledArea"><span style="color:#887060;">← 点击上方词块拼出正确句子</span></div></div><div class="modal-footer"><button class="btn btn-primary" onclick="Panels.checkDanmaku()">✨ 洗练弹幕</button><button class="btn btn-ghost" onclick="Panels.resetDanmaku()">🔄 重置</button><button class="btn btn-ghost" onclick="Panels.newDanmaku()">🎲 换一题</button><p id="danmakuResult" style="margin-top:12px;min-height:24px;"></p></div>`;
        } catch (error) { throw error; }
    }
    
    function toggleDanmakuWord(el) {
        const word = el.dataset.word;
        if (el.classList.contains('selected')) { el.classList.remove('selected'); selectedWords = selectedWords.filter(w => w !== word); }
        else { el.classList.add('selected'); selectedWords.push(word); }
        updateAssembledArea();
    }
    
    function updateAssembledArea() {
        const area = document.getElementById('assembledArea');
        if (!area) return;
        area.className = 'danmaku-assembled-area';
        area.innerHTML = selectedWords.length === 0 ? '<span style="color:#887060;">← 点击上方词块拼出正确句子</span>' : selectedWords.map(w => `<span class="danmaku-word-chip selected" style="cursor:default;animation:none;">${w}</span>`).join('');
    }
    
    async function checkDanmaku() {
        try {
            const res = await API.checkDanmaku(selectedWords, currentExerciseId);
            const result = document.getElementById('danmakuResult');
            const area = document.getElementById('assembledArea');
            if (result) { result.innerHTML = res.message; result.style.color = res.is_correct ? '#5a5' : '#e74c3c'; }
            if (area) { area.className = `danmaku-assembled-area ${res.is_correct ? 'correct' : 'wrong'}`; if (res.is_correct) Effects.refinementSuccessEffect(area); }
        } catch (error) { showToast('💢', '判定失败', 'error'); }
    }
    
    function resetDanmaku() {
        selectedWords = [];
        document.querySelectorAll('.danmaku-word-chip.selected').forEach(w => w.classList.remove('selected'));
        updateAssembledArea();
        const result = document.getElementById('danmakuResult'); if (result) result.innerHTML = '';
        const area = document.getElementById('assembledArea'); if (area) area.className = 'danmaku-assembled-area';
    }
    
    async function newDanmaku() {
        const body = document.getElementById('modalBody');
        body.innerHTML = '<div class="modal-loading"><div class="loading-spinner"></div></div>';
        try { const content = await renderDanmakuPanel(); body.innerHTML = content; const danmakuZone = body.querySelector('.danmaku-zone'); if (danmakuZone) Effects.createDanmakuEffect(danmakuZone, 5); }
        catch (error) { body.innerHTML = '<p style="color:#e74c3c;text-align:center;">加载失败</p>'; }
    }
    
    // ==================== 6. 神社文化 ====================
    
    async function renderCulturePanel() {
        try {
            const result = await API.getCulture();
            const culture = result.data;
            const sanshinHTML = culture[1].items.map(item => `<p>🗡️ <strong>${item.name}</strong> <span style="color:#b8956a;">(${item.reading})</span> — ${item.meaning}</p>`).join('');
            return `<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">⛩️ 神社点 — 神话与文化</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">${result.shrine_name} · 日本神話と文化</div></div><div class="shrine-scene"><div class="shrine-gate" id="shrineGate" onclick="Panels.performBow()">⛩️</div><p style="color:#d4a574;margin-top:10px;">点击鸟居进行参拜体验</p><button class="btn btn-primary" onclick="Panels.performBow()">🙏 ${culture[0].content}</button></div><div style="margin-top:15px;padding:15px;background:rgba(0,0,0,0.2);border-radius:6px;"><p style="color:#d4a574;">🔸 <strong>${culture[1].title}</strong>：</p>${sanshinHTML}</div><p style="text-align:center;color:#b8956a;margin-top:12px;">「いただきます」${culture[2].content}</p><p style="text-align:center;color:#887060;margin-top:10px;font-size:0.9em;">${result.blessing}</p>`;
        } catch (error) { throw error; }
    }
    
    function performBow() {
        const gate = document.getElementById('shrineGate');
        if (gate) { gate.classList.remove('bow-animation'); void gate.offsetWidth; gate.classList.add('bow-animation'); setTimeout(() => { alert('⛩️ 参拜完成：二礼二拍手一礼\n\n愿幻想乡的众神保佑你。'); }, 1900); }
    }
    
    function showToast(icon, message, type = 'info') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
    
    return {
        renderPanels, openModal, closeModal, refreshCard,
        buyItem, toggleDanmakuWord, checkDanmaku, resetDanmaku, newDanmaku,
        performBow, showToast,
        drawBattleCards, showHandCards, startBattle, revealCard, attackAndShowReading,
        renderDuelPanel, renderBattleScreen2,battleDrawnCards,currentOpponent,currentOpponentHP,
        currentOpponentMaxHP
    };
})();

window.Panels = Panels;/**
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
                    <div class="user-avatar"><img src="${user.character_emoji || '/static/images/characters/reimu.png'}" style="width:50px;height:50px;object-fit:contain;"></div>
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
window.Inventory = Inventory;/**
 * 幻想郷 言霊修行帳 - 每日挑战系统
 */

const Challenges = (() => {
    
    function getToken() {
        return localStorage.getItem('touhou_user_token') || '';
    }
    
    /**
     * 获取今日挑战
     */
    async function getTodayChallenges() {
        const token = getToken();
        if (!token) return null;
        try {
            const res = await fetch(`${window.location.origin}/api/challenges?token=${encodeURIComponent(token)}`);
            return await res.json();
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 更新任务进度
     */
    async function updateProgress(taskType, amount = 1) {
        const token = getToken();
        if (!token) return;
        try {
            await fetch(`${window.location.origin}/api/challenges/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, task_type: taskType, amount: amount })
            });
        } catch (e) {
            console.log('上报进度失败:', e);
        }
    }
    /**
     * 领取奖励
     */
    async function claimReward(taskId) {
        const token = getToken();
        if (!token) return null;
        try {
            const res = await fetch(`${window.location.origin}/api/challenges/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, task_id: taskId })
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 渲染挑战面板
     */
    async function renderChallengePanel() {
        const result = await getTodayChallenges();
        if (!result || !result.success) {
            return `
                <div class="challenge-panel">
                    <div style="text-align:center;color:var(--text-muted);padding:20px;">
                        请先登录以查看每日挑战
                    </div>
                </div>`;
        }
        
        const challenges = result.data;
        const completed = challenges.filter(c => c.completed).length;
        const total = challenges.length;
        const allDone = completed === total;
        
        const tasksHTML = challenges.map(c => {
            const iconMap = { draw_card: '🎴', learn_word: '📖', test_word: '📝', duel: '⚔️' };
            const icon = iconMap[c.task_type] || '📋';
            const progressText = c.target > 1 ? ` (${c.current}/${c.target})` : '';
            
            return `
                <div class="challenge-item ${c.completed ? 'completed' : ''}">
                    <div class="challenge-icon">${icon}</div>
                    <div class="challenge-info">
                        <div class="challenge-name">${c.name}${progressText}</div>
                        <div class="challenge-desc">${c.description}</div>
                    </div>
                    <div class="challenge-reward">💎 +${c.reward_rei || 0} 💰 +${c.reward_saisen || 0}</div>
                    ${c.completed && !c.claimed ? 
                        `<button class="btn-claim" onclick="Challenges.claimAndRefresh('${c.id}')">领取</button>` :
                        c.claimed ?
                        '<span class="challenge-status done">✅</span>' :
                        '<span class="challenge-status pending">○</span>'
                    }
                </div>`;
        }).join('');
        
        return `
            <div class="challenge-panel">
                <div class="challenge-header">
                    <div class="challenge-title">🎯 每日修行</div>
                    <div class="challenge-date">${result.date}</div>
                </div>
                <div class="challenge-progress">
                    <div class="progress-bar-outer">
                        <div class="progress-bar-inner" style="width:${(completed/total*100).toFixed(0)}%"></div>
                    </div>
                    <div class="progress-text">${completed}/${total} 完成${allDone ? ' 🎉 全部完成！' : ''}</div>
                </div>
                <div class="challenge-list">
                    ${tasksHTML}
                </div>
            </div>`;
    }
    
    /**
     * 领取奖励并刷新
     */
async function claimAndRefresh(taskId) {
    var result = await claimReward(taskId);
    if (result && result.success) {
        // 显示奖励
        var rei = result.reward?.rei || 0;
        var saisen = result.reward?.saisen || 0;
        Panels.showToast('🎁', '领取成功！靈珠 +' + rei + ' 賽錢 +' + saisen, 'success');
        
        // 刷新挑战面板
        var panel = document.getElementById('challengePanelContainer');
        if (panel) {
            panel.innerHTML = await renderChallengePanel();
        }
        
        // 刷新头部货币显示
        if (window.loadUserHeader) {
            await window.loadUserHeader();
        }
    } else {
        Panels.showToast('💢', result?.message || '领取失败', 'error');
    }
}
    /**
     * 显示奖励弹窗
     */
    function showRewardPopup(reward) {
        const popup = document.createElement('div');
        popup.className = 'reward-popup';
        popup.innerHTML = `
            <span class="reward-icon">🎁</span>
            <div class="reward-text">领取成功！</div>
            <div class="reward-amount">
                ${reward.rei ? `💎 靈珠 +${reward.rei}` : ''}
                ${reward.saisen ? ` 💰 賽錢 +${reward.saisen}` : ''}
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.5s';
            setTimeout(() => popup.remove(), 500);
        }, 2000);
    }
    
    return {
        getTodayChallenges,
        updateProgress,
        claimReward,
        renderChallengePanel,
        claimAndRefresh
    };
})();

window.Challenges = Challenges;
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

window.Favorites = Favorites;/**
 * 幻想郷 言霊修行帳 - 符卡对决战斗系统
 */

const Battle = (() => {
    let handCards = [];          // 手牌（最多7张）
    let currentOpponent = null; // 当前对手
    let opponentHP = 0;
    let maxHP = 0;
    let battleActive = false;
    
    // 伤害计算
    function getDamage(rarity) {
        const damages = { 'SSR': 250, 'SR': 120, 'R': 50 };
        return damages[rarity] || 50;
    }
    
    // 获取手牌
    function getHandCards() {
        return handCards;
    }
    
    // 从词库抽取手牌
    async function drawHandCards() {
        handCards = [];
        const jlpt = localStorage.getItem('jlpt_enabled') || 'true';
        
        for (let i = 0; i < 7; i++) {
            try {
                const res = await fetch(`${window.location.origin}/api/card/random/filtered?jlpt=${jlpt}`);
                const data = await res.json();
                if (data.success) {
                    handCards.push({
                        ...data.data,
                        revealed: false,
                        used: false
                    });
                }
            } catch (e) {}
        }
        return handCards;
    }
    
    // 设置对手
    function setOpponent(opponent) {
        currentOpponent = opponent;
        opponentHP = opponent.hp;
        maxHP = opponent.hp;
        battleActive = true;
    }
    
    // 使用符卡攻击
    function useCard(cardIndex) {
        if (!battleActive || cardIndex >= handCards.length) return null;
        
        const card = handCards[cardIndex];
        if (card.used) return null;
        
        if (!card.revealed) {
            // 第一次点击：揭示符卡
            card.revealed = true;
            return { action: 'reveal', card, cardIndex };
        } else {
            // 第二次点击：发动攻击
            card.used = true;
            const damage = getDamage(card.rarity);
            opponentHP = Math.max(0, opponentHP - damage);
            
            const result = {
                action: 'attack',
                card,
                cardIndex,
                damage,
                opponentHP,
                maxHP,
                defeated: opponentHP <= 0,
                allUsed: handCards.every(c => c.used)
            };
            
            // 检查战斗结束
            if (result.defeated || result.allUsed) {
                battleActive = false;
                result.battleEnd = true;
                result.victory = opponentHP <= 0;
            }
            
            return result;
        }
    }
    
    // 重置战斗
    function resetBattle() {
        handCards = [];
        currentOpponent = null;
        opponentHP = 0;
        maxHP = 0;
        battleActive = false;
    }

    function setHandCards(cards) {
        handCards = cards;
    }
    
    return {
        drawHandCards,
        getHandCards,
        setOpponent,
        useCard,
        resetBattle,
        getDamage,
        setHandCards
    };
})();

window.Battle = Battle;const Signin = (() => {
    
    function getToken() {
        return localStorage.getItem('touhou_user_token') || '';
    }
    
    async function getStatus() {
        var token = getToken();
        if (!token) return null;
        try {
            var res = await fetch('/api/signin/status?token=' + encodeURIComponent(token));
            return await res.json();
        } catch(e) { return null; }
    }
    
    async function doSignin() {
        var token = getToken();
        if (!token) { Panels.showToast('💢', '请先登录', 'error'); return; }
        try {
            var res = await fetch('/api/signin', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token: token})
            });
            var data = await res.json();
            
            if (data.success) {
                showSigninPopup(data);
                if (window.loadUserHeader) window.loadUserHeader();
                updateButton(true);
            } else {
                Panels.showToast('💢', data.message, 'error');
            }
        } catch(e) { Panels.showToast('💢', '签到失败', 'error'); }
    }
    
    function showSigninPopup(data) {
        var popup = document.createElement('div');
        popup.className = 'signin-popup';
        var imgHTML = data.image ? '<img src="' + window.location.origin + '/static/images/signin/' + data.image + '" class="signin-image" alt="签到图">' : '';
        popup.innerHTML = '<span style="font-size:4em;">✅</span><div class="signin-title">签到成功</div>' + imgHTML + '<div class="signin-consecutive">连续签到第 ' + data.consecutive + ' 天</div><div class="signin-reward">💎 +' + data.reward.rei + ' 💰 +' + data.reward.saisen + '</div><button class="btn-close-popup" onclick="this.parentElement.remove()">确定</button>';
        document.body.appendChild(popup);
    }
    
    async function updateButton(signed) {
        var btn = document.getElementById('signinBtn');
        if (!btn) return;
        if (signed) {
            btn.textContent = '✅ 今日已签到';
            btn.disabled = true;
        } else {
            btn.textContent = '📅 每日签到';
            btn.disabled = false;
        }
    }
    
    async function init() {
        var status = await getStatus();
        if (status && status.success) {
            updateButton(status.signed_today);
        }
    }
    
    return { doSignin, init, updateButton };
})();

window.Signin = Signin;/**
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
