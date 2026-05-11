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
            html += '<div class="opponent-card" id="opp_' + o.id + '" onclick="Panels.startBattle(\'' + o.id + '\')"><span class="opponent-emoji">' + o.emoji + '</span><div class="opponent-name">' + o.name + '</div><div class="opponent-hp">❤️ HP: ' + o.hp + '</div><div class="opponent-reward">💰 赏金: ' + o.reward + ' 賽錢</div></div>';
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
        renderBattleScreen2();
    }

    // 战斗界面：敌人+战斗按钮，单词等点击战斗按钮才显示
    function renderBattleScreen2() {
        var body = document.getElementById('modalBody');
        var opp = currentOpponent;
        body.innerHTML = '<div class="modal-header"><div class="modal-title" style="font-size:1.4em;color:var(--color-gold);text-align:center;">⚔️ VS ' + opp.name + '</div></div>' +
            '<div class="battle-arena"><div class="battle-opponent-zone"><span class="battle-opponent-emoji" id="oppEmoji">' + opp.emoji + '</span><div style="color:var(--text-gold);">' + opp.name + '</div><div class="hp-bar-outer"><div class="hp-bar-inner" id="hpBar" style="width:' + (currentOpponentHP / currentOpponentMaxHP * 100) + '%"></div></div><div class="hp-text" id="hpText">❤️ ' + currentOpponentHP + ' / ' + currentOpponentMaxHP + '</div></div>' +
            '<div class="battle-hand-zone"><div id="cardArea" style="text-align:center;min-height:120px;"></div>' +
            '<div style="text-align:center;margin-top:20px;"><button class="btn btn-primary btn-lg" id="fightBtn" onclick="Panels.revealCard()">⚡ 战斗</button></div></div></div>' +
            '<div style="text-align:center;margin-top:15px;"><button class="btn btn-ghost" onclick="Panels.renderDuelPanel().then(function(h){document.getElementById(\'modalBody\').innerHTML=h;})">🔙 返回</button></div>';
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

    // 点击符卡：显示假名 + 造成伤害
    function attackAndShowReading() {
        var card = battleDrawnCards[currentCardIndex];
        card.revealed = true;
        card.used = true;
        
        // 显示假名
        document.getElementById('readingSpot').textContent = card.reading || card.word;
        
        // 计算伤害
        var damage = DAMAGE_MAP[card.rarity] || 50;
        currentOpponentHP = Math.max(0, currentOpponentHP - damage);
        
        // 更新HP
        document.getElementById('hpBar').style.width = (currentOpponentHP / currentOpponentMaxHP * 100) + '%';
        document.getElementById('hpText').textContent = '❤️ ' + currentOpponentHP + ' / ' + currentOpponentMaxHP;
        
        // 禁用卡片点击
        document.getElementById('cardArea').querySelector('.hand-card').onclick = null;
        document.getElementById('cardArea').querySelector('.hand-card').style.opacity = '0.5';
        document.getElementById('cardArea').querySelector('.hand-card').style.cursor = 'default';
        
        // 显示伤害数字
        showDamageNumber(damage);
        
        // 恢复战斗按钮
        document.getElementById('fightBtn').disabled = false;
        document.getElementById('fightBtn').textContent = '⚡ 战斗';
        
        // 检查胜负
        if (currentOpponentHP <= 0) {
            setTimeout(function() { endBattle(true); }, 800);
        } else {
            var allUsed = battleDrawnCards.every(function(c) { return c.used; });
            if (allUsed) {
                setTimeout(function() { endBattle(false); }, 800);
            }
        }
    }

    function endBattle(victory) {
        var oppEmoji = document.getElementById('oppEmoji');
        if (victory && oppEmoji) oppEmoji.style.filter = 'grayscale(1)';
        
        if (victory) {
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
        popup.innerHTML = '<span class="victory-emoji">🎉</span><div class="victory-text">胜利！</div><p>' + rewardMsg + '</p><button class="btn btn-primary" style="margin-top:15px;" onclick="this.parentElement.remove();Panels.renderDuelPanel().then(function(h){document.getElementById(\'modalBody\').innerHTML=h;});">返回</button>';
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
        renderDuelPanel, renderBattleScreen2
    };
})();

window.Panels = Panels;