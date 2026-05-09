/**
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
            
            // 触发入场动画
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
            2: '面对对手，宣告符卡之名吧',
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
            2: ['对决', '发音', '灵力'],
            3: ['购物', '生活', '実践'],
            4: ['文法', '语序', 'SOV'],
            5: ['练习', '句子', '互动'],
            6: ['文化', '神社', '神話'],
        };
        return tags[id] || [];
    }
    
    /**
     * 打开弹窗
     */
    async function openModal(id) {
        const overlay = document.getElementById('modalOverlay');
        const body = document.getElementById('modalBody');
        
        // 显示加载状态
        body.innerHTML = `
            <div class="modal-loading">
                <div class="loading-spinner"></div>
                <p>言灵之力加载中...</p>
            </div>
        `;
        overlay.classList.add('active');
        
        // 加载内容
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
            
            // 创建弹幕特效
            const danmakuZone = body.querySelector('.danmaku-zone');
            if (danmakuZone) {
                Effects.createDanmakuEffect(danmakuZone, 5);
            }
            
        } catch (error) {
            body.innerHTML = `
                <div class="modal-loading" style="color:#e74c3c;">
                    <p>🏮 言灵之力不足...</p>
                    <p style="font-size:0.9em;">${error.message}</p>
                </div>
            `;
        }
    }
    
    /**
     * 关闭弹窗
     */
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
        
        var readingText = card.reading || '';
        var readingDisplay = readingText;
        
        return `
            <div class="modal-header">
                <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                    📜 词汇符卡 — 言灵収集
                </div>
                <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">
                    Spell Card Collection · 理解关键名词
                </div>
            </div>
            <div class="modal-content">
                <div class="ofuda-card ${card.rarity === 'SSR' ? 'ssr' : ''}" id="ofudaCard">
                    <div class="rarity-badge">
                        ${'★'.repeat(card.rarity === 'SSR' ? 5 : card.rarity === 'SR' ? 4 : 3)} ${card.rarity}
                    </div>
                    <div class="card-level">${card.level || ''}</div>
                    <div class="card-word">${card.word}</div>
                    <div class="card-reading">${readingDisplay}</div>
                    <div class="card-meaning">${card.meaning}</div>
                    <div class="card-example">
                        <strong>例句：</strong>${card.example}<br>
                        <span style="color:#8b4513;">${card.example_reading}</span>
                    </div>
                    <div style="margin-top:8px;font-size:0.8em;color:#a08060;">
                        分类：${card.category}
                    </div>
                </div>
                <p style="text-align:center; color:#b8956a; margin-top:15px;">
                    ✦ 点击下方按钮重新抽取符卡 ✦
                </p>
                <div style="text-align:center;">
                    <button class="btn btn-primary btn-lg" onclick="Panels.refreshCard()">
                        🎴 抽取新的符卡
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        throw error;
    }
}

async function refreshCard() {
    try {
        var result = await getFilteredRandomCard();
        var card = result.data;
        var display = document.getElementById('ofudaCard');
        
        if (display) {
            var readingText = card.reading || '';
            var readingDisplay = readingText;
            
            display.className = 'ofuda-card ' + (card.rarity === 'SSR' ? 'ssr' : '');
            display.innerHTML = `
                <div class="rarity-badge">
                    ${'★'.repeat(card.rarity === 'SSR' ? 5 : card.rarity === 'SR' ? 4 : 3)} ${card.rarity}
                </div>
                <div class="card-level">${card.level || ''}</div>
                <div class="card-word">${card.word}</div>
                <div class="card-reading">${readingDisplay}</div>
                <div class="card-meaning">${card.meaning}</div>
                <div class="card-example">
                    <strong>例句：</strong>${card.example}<br>
                    <span style="color:#8b4513;">${card.example_reading}</span>
                </div>
                <div style="margin-top:8px;font-size:0.8em;color:#a08060;">
                    分类：${card.category}
                </div>
            `;
            
            Effects.cardFlipEffect(display);
            Panels.showToast('🎴', '抽到了 ' + card.rarity + ' 级言灵：' + card.word);
        }
    } catch (error) {
        Panels.showToast('💢', '抽卡失败，请重试', 'error');
    }
}
    
    // ==================== 2. 符卡对决 ====================
    async function renderDuelPanel() {
        try {
            const result = await API.getDuelInfo();
            const duel = result.data;
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                        ⚔️ 符卡对决 — 宣告之战
                    </div>
                    <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">
                        Spell Card Duel · 大声读出符卡之名
                    </div>
                </div>
                <div class="duel-arena">
                    <div class="duel-fighter">
                        <span class="fighter-avatar">${duel.player1.emoji}</span>
                        <div class="fighter-name">${duel.player1.name}</div>
                        <div class="fighter-spell">${duel.player1.spell}</div>
                    </div>
                    <div class="duel-vs">VS</div>
                    <div class="duel-fighter">
                        <span class="fighter-avatar">${duel.player2.emoji}</span>
                        <div class="fighter-name">${duel.player2.name}</div>
                        <div class="fighter-spell">${duel.player2.spell}</div>
                    </div>
                </div>
                <p style="text-align:center;color:#b8956a;margin:15px 0;">
                    🔊 ${duel.instruction}
                </p>
                <div class="duel-input-group">
                    <input type="text" class="duel-spell-input" id="spellInput" 
                           placeholder="输入你要宣告的符卡名称...">
                    <br><br>
                    <button class="btn btn-primary" onclick="Panels.submitDuel()">⚡ 宣告符卡</button>
                    <button class="btn btn-ghost" onclick="Panels.randomSpell()">🎲 随机符卡</button>
                    <p id="duelResult" style="margin-top:15px;color:#d4a574;min-height:30px;"></p>
                </div>
            `;
        } catch (error) {
            throw error;
        }
    }
    
    async function submitDuel() {
        const input = document.getElementById('spellInput');
        const result = document.getElementById('duelResult');
        const spellName = input.value.trim();
        
        if (!spellName) {
            result.innerHTML = '<span style="color:#e74c3c;">💢 请先输入你要宣告的符卡名称！</span>';
            return;
        }
        
        try {
            const res = await API.submitDuel(spellName);
            result.innerHTML = `
                🎯 宣告：「${res.user_spell}」<br>
                💥 灵力判定：<strong>${res.power}</strong> 点<br>
                ✨ ${res.outcome}
            `;
            Effects.spiritPulseEffect(result);
        } catch (error) {
            result.innerHTML = '<span style="color:#e74c3c;">结界震荡，对决中断...</span>';
        }
    }
    
    function randomSpell() {
        const spells = [
            '霊符「夢想封印」', '紅符「不夜城レッド」', '神技「八方鬼縛陣」',
            '夜符「クイーン・オブ・ミッドナイト」', '氷符「アイシクルフォール」',
            '華符「竹林グライダー」', '星符「ドラゴンメテオ」'
        ];
        const input = document.getElementById('spellInput');
        if (input) {
            input.value = spells[Math.floor(Math.random() * spells.length)];
        }
    }
    
    // ==================== 3. 河童杂货铺 ====================
    async function renderShopPanel() {
        try {
            const result = await API.getShopItems();
            const shop = result.data;
            
            const itemsHTML = shop.map(item => `
                <div class="shop-item">
                    <div class="item-emoji">${item.icon}</div>
                    <div class="item-details">
                        <div class="item-name">${item.name_jp}</div>
                        <div class="item-desc">${item.description} (${item.name_cn})</div>
                    </div>
                    <div class="item-price">¥${item.price}</div>
                    <button class="btn btn-sm btn-primary" onclick="Panels.buyItem('${item.name_jp}')">
                        購入
                    </button>
                </div>
            `).join('');
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                        🏮 河童杂货铺 — 买卖修行
                    </div>
                    <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">
                        店主：${result.shopkeeper} · いらっしゃいませ！
                    </div>
                </div>
                <p style="text-align:center;color:#d4a574;margin-bottom:15px;">💬 ${result.greeting}</p>
                ${itemsHTML}
                <p id="buyResult" style="text-align:center;margin-top:15px;color:#d4a574;min-height:24px;"></p>
                <p style="text-align:center;margin-top:15px;color:#a08060;font-size:0.9em;">
                    💬 客：「<strong>これをください！</strong>」 | 店員：「<strong>ありがとうございます！</strong>」
                </p>
            `;
        } catch (error) {
            throw error;
        }
    }
    
    async function buyItem(itemName) {
        try {
            const res = await API.buyItem(itemName);
            const resultDiv = document.getElementById('buyResult');
            if (resultDiv) {
                resultDiv.innerHTML = `🛒 ${res.message}`;
                showToast('🛒', res.message, 'success');
            }
        } catch (error) {
            showToast('💢', '购买失败', 'error');
        }
    }
    
    // ==================== 4. 文法罗盘 ====================
    async function renderGrammarPanel() {
        try {
            const result = await API.getGrammar();
            const grammar = result.data[0];
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                        🧭 迷路竹林文法罗盘
                    </div>
                    <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">
                        Grammar Compass · 语序结构指引
                    </div>
                </div>
                <p style="color:#d4a574;text-align:center;font-size:1.05em;">${grammar.description}</p>
                <div style="text-align:center;font-size:1.2em;margin:20px 0;">
                    ❌ <span style="color:#e74c3c;text-decoration:line-through;">${grammar.example_wrong}</span> (SVO)<br>
                    ✅ <span style="color:#5a5;">${grammar.example_correct}</span> (SOV)
                </div>
                <div class="compass-visual">
                    <div class="compass-diagram">
                        <div class="compass-pointer">🧭</div>
                    </div>
                    <div class="compass-formula">
                        ${grammar.formula}
                    </div>
                </div>
                <p style="text-align:center;color:#b8956a;margin-top:15px;">${grammar.tip}</p>
                <p style="text-align:center;color:#887060;">${result['compass_口诀']}</p>
            `;
        } catch (error) {
            throw error;
        }
    }
    
    // ==================== 5. 弹幕洗练 ====================
    async function renderDanmakuPanel() {
        try {
            const result = await API.getRandomDanmaku();
            const exercise = result.data;
            currentExerciseId = exercise.id;
            selectedWords = [];
            
            const wordsHTML = exercise.shuffled_words.map(w => `
                <span class="danmaku-word-chip" data-word="${w}" onclick="Panels.toggleDanmakuWord(this)">
                    ${w}
                </span>
            `).join('');
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                        💥 弹幕洗练 — 句子重组
                    </div>
                    <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">
                        Danmaku Refinement · 目标：${exercise.meaning}
                    </div>
                </div>
                <p style="text-align:center;color:#b8956a;">按正确顺序点击散乱的弹幕词块：</p>
                <div class="danmaku-zone" id="danmakuZone">
                    <div class="danmaku-words-container" id="danmakuWords">
                        ${wordsHTML}
                    </div>
                    <div class="danmaku-assembled-area" id="assembledArea">
                        <span style="color:#887060;">← 点击上方词块拼出正确句子</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="Panels.checkDanmaku()">✨ 洗练弹幕</button>
                    <button class="btn btn-ghost" onclick="Panels.resetDanmaku()">🔄 重置</button>
                    <button class="btn btn-ghost" onclick="Panels.newDanmaku()">🎲 换一题</button>
                    <p id="danmakuResult" style="margin-top:12px;min-height:24px;"></p>
                </div>
            `;
        } catch (error) {
            throw error;
        }
    }
    
    function toggleDanmakuWord(el) {
        const word = el.dataset.word;
        if (el.classList.contains('selected')) {
            el.classList.remove('selected');
            selectedWords = selectedWords.filter(w => w !== word);
        } else {
            el.classList.add('selected');
            selectedWords.push(word);
        }
        updateAssembledArea();
    }
    
    function updateAssembledArea() {
        const area = document.getElementById('assembledArea');
        if (!area) return;
        
        area.className = 'danmaku-assembled-area';
        
        if (selectedWords.length === 0) {
            area.innerHTML = '<span style="color:#887060;">← 点击上方词块拼出正确句子</span>';
        } else {
            area.innerHTML = selectedWords.map(w => 
                `<span class="danmaku-word-chip selected" style="cursor:default;animation:none;">${w}</span>`
            ).join('');
        }
    }
    
    async function checkDanmaku() {
        try {
            const res = await API.checkDanmaku(selectedWords, currentExerciseId);
            const result = document.getElementById('danmakuResult');
            const area = document.getElementById('assembledArea');
            
            if (result) {
                result.innerHTML = res.message;
                result.style.color = res.is_correct ? '#5a5' : '#e74c3c';
            }
            
            if (area) {
                area.className = `danmaku-assembled-area ${res.is_correct ? 'correct' : 'wrong'}`;
                if (res.is_correct) {
                    Effects.refinementSuccessEffect(area);
                }
            }
        } catch (error) {
            showToast('💢', '判定失败', 'error');
        }
    }
    
    function resetDanmaku() {
        selectedWords = [];
        document.querySelectorAll('.danmaku-word-chip.selected').forEach(w => w.classList.remove('selected'));
        updateAssembledArea();
        const result = document.getElementById('danmakuResult');
        if (result) result.innerHTML = '';
        
        const area = document.getElementById('assembledArea');
        if (area) area.className = 'danmaku-assembled-area';
    }
    
    async function newDanmaku() {
        const body = document.getElementById('modalBody');
        body.innerHTML = '<div class="modal-loading"><div class="loading-spinner"></div></div>';
        
        try {
            const content = await renderDanmakuPanel();
            body.innerHTML = content;
            
            const danmakuZone = body.querySelector('.danmaku-zone');
            if (danmakuZone) {
                Effects.createDanmakuEffect(danmakuZone, 5);
            }
        } catch (error) {
            body.innerHTML = '<p style="color:#e74c3c;text-align:center;">加载失败</p>';
        }
    }
    
    // ==================== 6. 神社文化 ====================
    async function renderCulturePanel() {
        try {
            const result = await API.getCulture();
            const culture = result.data;
            
            const sanshinHTML = culture[1].items.map(item => `
                <p>🗡️ <strong>${item.name}</strong> 
                   <span style="color:#b8956a;">(${item.reading})</span> — ${item.meaning}</p>
            `).join('');
            
            return `
                <div class="modal-header">
                    <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">
                        ⛩️ 神社点 — 神话与文化
                    </div>
                    <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">
                        ${result.shrine_name} · 日本神話と文化
                    </div>
                </div>
                <div class="shrine-scene">
                    <div class="shrine-gate" id="shrineGate" onclick="Panels.performBow()">⛩️</div>
                    <p style="color:#d4a574;margin-top:10px;">点击鸟居进行参拜体验</p>
                    <button class="btn btn-primary" onclick="Panels.performBow()">
                        🙏 ${culture[0].content}
                    </button>
                </div>
                <div style="margin-top:15px;padding:15px;background:rgba(0,0,0,0.2);border-radius:6px;">
                    <p style="color:#d4a574;">🔸 <strong>${culture[1].title}</strong>：</p>
                    ${sanshinHTML}
                </div>
                <p style="text-align:center;color:#b8956a;margin-top:12px;">
                    「いただきます」${culture[2].content}
                </p>
                <p style="text-align:center;color:#887060;margin-top:10px;font-size:0.9em;">
                    ${result.blessing}
                </p>
            `;
        } catch (error) {
            throw error;
        }
    }
    
    function performBow() {
        const gate = document.getElementById('shrineGate');
        if (gate) {
            gate.classList.remove('bow-animation');
            void gate.offsetWidth;
            gate.classList.add('bow-animation');
            
            setTimeout(() => {
                alert('⛩️ 参拜完成：二礼二拍手一礼\n\n一、二礼（にれい）— 鞠躬两次\n二、二拍手（にはくしゅ）— 拍手两次\n三、一礼（いちれい）— 最后鞠躬一次\n\n愿幻想乡的众神保佑你。');
            }, 1900);
        }
    }
    
    // ==================== 工具函数 ====================
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
        renderPanels,
        openModal,
        closeModal,
        refreshCard,
        submitDuel,
        randomSpell,
        buyItem,
        toggleDanmakuWord,
        checkDanmaku,
        resetDanmaku,
        newDanmaku,
        performBow,
        showToast,
    };
})();

// 导出到全局
window.Panels = Panels;