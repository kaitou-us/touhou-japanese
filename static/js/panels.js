/**
 * 幻想郷 言霊修行帳 - 六大板块逻辑
 */
const Panels = (() => {
    let selectedWords = [];
    let currentExerciseId = 1;

    // 战斗状态变量
    let battleDrawnCards = [];
    let currentOpponent = null;
    let currentOpponentHP = 0;
    let currentOpponentMaxHP = 0;
    let currentCardIndex = 0;

    var OPPONENTS = {
        'cirno': {id:'cirno', name:'チルノ', hp:300, reward:80, emoji:'❄️'},
        'reimu': {id:'reimu', name:'博麗霊夢', hp:600, reward:200, emoji:'🧙‍♀️'},
        'yukari': {id:'yukari', name:'八雲紫', hp:999, reward:500, emoji:'🦊'}
    };
    var DAMAGE_MAP = {'SSR': 250, 'SR': 120, 'R': 50};

    async function renderPanels() {
        const grid = document.getElementById('panelsGrid');
        try {
            const result = await API.getPanels();
            if (!result.success) throw new Error(result.message);
            grid.innerHTML = result.data.map((panel, index) => `
                <div class="panel ${panel.featured ? 'featured' : ''} anim-hidden delay-${index * 100}" 
                     data-id="${panel.id}" onclick="Panels.openModal(${panel.id})">
                    <div class="panel-header"><div class="panel-icon-wrapper">${panel.icon}</div><div><div class="panel-number">${panel.number}</div><div class="panel-title">${panel.title}</div></div></div>
                    <div class="panel-body"><p>${panel.description}</p><span class="preview-jp">${getPreviewJP(panel.id)}</span><span class="preview-hint">${getPreviewHint(panel.id)}</span><div class="panel-tags">${getPanelTags(panel.id).map(tag => `<span class="panel-tag">${tag}</span>`).join('')}</div></div>
                </div>`).join('');
            requestAnimationFrame(() => { grid.querySelectorAll('.panel').forEach((p, i) => setTimeout(() => p.classList.add('visible'), i * 100)); });
        } catch (error) { grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:#e74c3c;"><p>🏮 结界波动中...</p><p style="color:#887060;font-size:0.9em;">${error.message}</p><button class="btn btn-ghost" onclick="location.reload()">重新连接</button></div>`; }
    }

    function getPreviewJP(id) { return {1:'【夢】ゆめ — 梦想',2:'【宣告】スペルカード発動！',3:'「これ、いくらですか？」',4:'私は リンゴを 食べます',5:'を · 私 · ケーキ · 食べます',6:'二礼二拍手一礼'}[id]||''; }
    function getPreviewHint(id) { return {1:'SSR级言灵 · 音调②型',2:'选择对手，用符卡战斗！',3:'黄瓜特价中！河城荷取的推荐',4:'主语+宾语+谓语 = SOV结构',5:'洗练弹幕，发动华丽反击',6:'从神社看日本神话文化'}[id]||''; }
    function getPanelTags(id) { return {1:['词汇','符卡','SSR'],2:['对决','战斗','赏金'],3:['购物','生活','実践'],4:['文法','语序','SOV'],5:['练习','句子','互动'],6:['文化','神社','神話']}[id]||[]; }

    async function openModal(id) {
        const overlay = document.getElementById('modalOverlay');
        const body = document.getElementById('modalBody');
        body.innerHTML = '<div class="modal-loading"><div class="loading-spinner"></div><p>言灵之力加载中...</p></div>';
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
                default: content = '<p>未知的板块...</p>'; }
            body.innerHTML = content;
            if (id === 4) {
            var idx = 0;
            var grammars = [
                {description: '日语的基本语序...', example_wrong: '我 吃 苹果', example_correct: '私は リンゴを 食べます', tip: '谓语永远在句末', formula: '主语 → は/が → 宾语 → を → 谓语'},
                {description: '「〜たい」...', example_wrong: 'I want to go', example_correct: '私は 日本に 行きたいです', tip: '愿望表达', formula: '主语 → は → 目的地 → に → 动词+たい'},
                {description: '「〜ている」...', example_wrong: 'I am studying', example_correct: '私は 勉強しています', tip: '进行时', formula: '主语 → は → 宾语 → を → 动词+ている'},
                {description: '「〜たことがある」...', example_wrong: 'I have been to Japan', example_correct: '私は 日本に 行ったことがあります', tip: '经验表达', formula: '主语 → は → 场所 → に → 动词た形+ことがある'},
                {description: '「〜なければならない」...', example_wrong: 'I must study', example_correct: '私は 勉強しなければなりません', tip: '义务表达', formula: '主语 → は → 宾语 → を → 动词否定形+ばならない'}
            ];

            window._grammarTimer = setInterval(function() {
                idx = (idx + 1) % grammars.length;
                var g = grammars[idx];
                var descEl = document.getElementById('grammarDesc');
                var exampleEl = document.getElementById('grammarExample');
                var formulaEl = document.getElementById('grammarFormula');
                var tipEl = document.getElementById('grammarTip');
                var counterEl = document.getElementById('grammarCounter');
                if (descEl) descEl.textContent = g.description;
                if (exampleEl) exampleEl.innerHTML = '❌ <span style="color:#ff6b6b;text-decoration:line-through;">' + g.example_wrong + '</span> (SVO)<br>✅ <span style="color:#5a5;">' + g.example_correct + '</span> (SOV)';
                if (formulaEl) formulaEl.textContent = g.formula;
                if (tipEl) tipEl.textContent = g.tip;
                if (counterEl) counterEl.textContent = '语法 ' + (idx+1) + '/5';
            }, 5000);
        }
            const danmakuZone = body.querySelector('.danmaku-zone');
            if (danmakuZone) Effects.createDanmakuEffect(danmakuZone, 5);
        } catch (error) { body.innerHTML = `<div class="modal-loading" style="color:#e74c3c;"><p>🏮 言灵之力不足...</p><p style="font-size:0.9em;">${error.message}</p></div>`; }
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('active');
        selectedWords = [];
        currentExerciseId = 1;
        if (window._grammarTimer) { clearInterval(window._grammarTimer); }
    }

    // ==================== 1. 词汇符卡 ====================
    async function getFilteredRandomCard() { const jlpt = localStorage.getItem('jlpt_enabled')||'true'; const res = await fetch(`${window.location.origin}/api/card/random/filtered?jlpt=${jlpt}`); return res.json(); }
    async function renderCardPanel() {
        try {
            const result = await getFilteredRandomCard(); const card = result.data; var readingDisplay = card.reading || '';
            return `<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">📜 词汇符卡 — 言灵収集</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">Spell Card Collection · 理解关键名词</div></div><div class="modal-content"><div class="ofuda-card ${card.rarity==='SSR'?'ssr':''}" id="ofudaCard"><div class="rarity-badge">${'★'.repeat(card.rarity==='SSR'?5:card.rarity==='SR'?4:3)} ${card.rarity}</div><div class="card-level">${card.level||''}</div><div class="card-word">${card.word}</div><div class="card-reading">${readingDisplay}</div><div class="card-meaning">${card.meaning}</div><div class="card-example"><strong>例句：</strong>${card.example}<br><span style="color:#8b4513;">${card.example_reading}</span></div><div style="margin-top:8px;font-size:0.8em;color:#a08060;">分类：${card.category}</div></div><p style="text-align:center;color:#b8956a;margin-top:15px;">✦ 点击下方按钮重新抽取符卡 ✦</p><div style="text-align:center;"><button class="btn btn-primary btn-lg" onclick="Panels.refreshCard()">🎴 抽取新的符卡</button></div></div>`;
        } catch (error) { throw error; }
    }
    async function refreshCard() {
        try {
            var result = await getFilteredRandomCard();
            if (!result||!result.success) { Panels.showToast('💢', result?.message||'抽卡失败', 'error'); return; }
            var card = result.data; var display = document.getElementById('ofudaCard');
            if (display && card) {
                var readingDisplay = card.reading||''; display.className = 'ofuda-card '+(card.rarity==='SSR'?'ssr':'');
                display.innerHTML = `<div class="rarity-badge">${'★'.repeat(card.rarity==='SSR'?5:card.rarity==='SR'?4:3)} ${card.rarity}</div><div class="card-level">${card.level||''}</div><div class="card-word">${card.word}</div><div class="card-reading">${readingDisplay}</div><div class="card-meaning">${card.meaning}</div><div class="card-example"><strong>例句：</strong>${card.example}<br><span style="color:#8b4513;">${card.example_reading}</span></div><div style="margin-top:8px;font-size:0.8em;color:#a08060;">分类：${card.category}</div>`;
                Effects.cardFlipEffect(display); Panels.showToast('🎴', '抽到了 '+card.rarity+' 级言灵：'+card.word);
                if (window.Challenges) { Challenges.updateProgress('draw_card',1); Challenges.updateProgress('learn_word',1); if (card.rarity==='SSR') Challenges.updateProgress('draw_card',1); }
            }
        } catch (error) { Panels.showToast('💢', '抽卡失败，请重试', 'error'); }
    }

    // ==================== 2. 符卡对决 ====================
    async function renderDuelPanel() {
        var html = '<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">⚔️ 符卡对决 — 幻想乡武道会</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">选择对手，抽取符卡，用言灵之力击败他们！</div></div>';
        html += '<div style="margin-bottom:15px;text-align:center;"><button class="btn btn-primary" onclick="Panels.showHandCards()">🎴 符卡存放 ('+battleDrawnCards.length+'/7)</button> <button class="btn btn-ghost" onclick="Panels.drawBattleCards()">🀄 抽取符卡</button></div>';
        for (var key in OPPONENTS) { var o = OPPONENTS[key]; html += '<div class="opponent-card" id="opp_'+o.id+'" onclick="Panels.startBattle(\''+o.id+'\')"><img src="/static/images/opponents/'+o.id+'_normal.png" style="width:100px;height:auto;"><div class="opponent-name">'+o.name+'</div><div class="opponent-hp">❤️ HP: '+o.hp+'</div><div class="opponent-reward">💰 赏金: '+o.reward+' 賽錢</div></div>'; }
        html += '<p style="text-align:center;color:#887060;font-size:0.8em;margin-top:10px;">需要先抽取符卡才能开始战斗</p>';
        return html;
    }

    async function drawBattleCards() {
        if (battleDrawnCards.length >= 7) { Panels.showToast('💢', '手牌已满（最多7张）', 'error'); return; }
        var jlpt = localStorage.getItem('jlpt_enabled')||'true';
        try {
            var res = await fetch(window.location.origin+'/api/card/random/filtered?jlpt='+jlpt); var data = await res.json();
            if (data.success) {
                if (battleDrawnCards.length >= 7) return;
                battleDrawnCards.push({word:data.data.word, reading:data.data.reading||'', meaning:data.data.meaning||'', rarity:data.data.rarity||'R', revealed:false, used:false});
                Panels.showToast('🎴', '获得符卡：'+data.data.word, 'success');
                document.getElementById('modalBody').innerHTML = await renderDuelPanel();
            }
        } catch (e) { Panels.showToast('💢', '抽取失败', 'error'); }
    }

    function showHandCards() {
        if (battleDrawnCards.length === 0) { Panels.showToast('💢', '手牌为空', 'error'); return; }
        var overlay = document.createElement('div'); overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;';
        overlay.onclick = function(e) { if (e.target===overlay) overlay.remove(); };
        var panel = document.createElement('div'); panel.style.cssText = 'background:var(--bg-modal);border:2px solid var(--border-gold);border-radius:12px;padding:20px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;';
        var listHTML = '';
        for (var i=0;i<battleDrawnCards.length;i++) { var c=battleDrawnCards[i]; listHTML += '<div style="background:rgba(0,0,0,0.3);border:1px solid var(--border-light);border-radius:8px;padding:10px;text-align:center;'+(c.used?'opacity:0.3;':'')+'"><div style="color:var(--text-gold);font-size:1.1em;">'+c.word+'</div><div style="color:#c0392b;font-size:0.8em;">'+(c.reading||'')+'</div><div style="color:var(--text-muted);font-size:0.75em;">'+c.rarity+(c.used?' (已使用)':'')+'</div></div>'; }
        panel.innerHTML = '<h3 style="color:var(--text-gold);text-align:center;margin-bottom:15px;">🎴 符卡存放 ('+battleDrawnCards.length+'/7)</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">'+listHTML+'</div><button class="btn btn-ghost" style="margin-top:15px;width:100%;" onclick="this.parentElement.parentElement.remove()">关闭</button>';
        overlay.appendChild(panel); document.body.appendChild(overlay);
    }

    function startBattle(opponentId) {
        if (battleDrawnCards.length===0) { Panels.showToast('💢','请先抽取符卡','error'); return; }
        currentOpponent = OPPONENTS[opponentId]; currentOpponentHP = currentOpponent.hp; currentOpponentMaxHP = currentOpponent.hp; currentCardIndex = 0;
        AudioManager.playBattleMusic(opponentId);
        renderBattleScreen2();
    }

    function renderBattleScreen2() {
        var body = document.getElementById('modalBody'); var opp = currentOpponent;
        body.innerHTML = '<div class="modal-header"><div class="modal-title" style="font-size:1.4em;color:var(--color-gold);text-align:center;">⚔️ VS '+opp.name+'</div></div><div class="battle-arena"><div class="battle-opponent-zone"><img id="oppImage" src="/static/images/opponents/'+opp.id+'_normal.png" style="width:120px;height:auto;transition:0.3s;"><div style="color:var(--text-gold);">'+opp.name+'</div><div class="hp-bar-outer"><div class="hp-bar-inner" id="hpBar" style="width:'+(currentOpponentHP/currentOpponentMaxHP*100)+'%"></div></div><div class="hp-text" id="hpText">❤️ '+currentOpponentHP+' / '+currentOpponentMaxHP+'</div></div><div class="battle-hand-zone"><div id="cardArea" style="text-align:center;min-height:120px;"></div><div style="text-align:center;margin-top:20px;"><button class="btn btn-primary btn-lg" id="fightBtn" onclick="Panels.revealCard()">⚡ 战斗</button></div></div></div><div style="text-align:center;margin-top:15px;"><button class="btn btn-ghost" onclick="AudioManager.stopAll(); AudioManager.playBGM(); Panels.renderDuelPanel().then(function(h){document.getElementById(\'modalBody\').innerHTML=h;})">🔙 返回</button></div>';
    }

    function revealCard() {
        if (currentOpponentHP<=0) return;
        var unused = [];
        for (var i=0;i<battleDrawnCards.length;i++) { if (!battleDrawnCards[i].used) unused.push(i); }
        if (unused.length===0) { Panels.showToast('💢','所有符卡已用完！','error'); endBattle(false); return; }
        var idx = unused[Math.floor(Math.random()*unused.length)]; currentCardIndex = idx; var card = battleDrawnCards[idx]; card.revealed = false;
        var cardArea = document.getElementById('cardArea');
        cardArea.innerHTML = '<div class="hand-card revealed" onclick="Panels.attackAndShowReading()" style="cursor:pointer;padding:20px;background:var(--bg-panel);border:2px solid var(--border-gold);border-radius:8px;"><div class="card-front-word" style="font-size:2em;color:var(--text-gold);">'+card.word+'</div><div id="readingSpot" style="color:#c0392b;font-size:1.2em;margin-top:8px;min-height:28px;"></div><div style="color:var(--text-muted);font-size:0.8em;margin-top:8px;">点击揭示读音并攻击</div></div>';
        document.getElementById('fightBtn').disabled = true; document.getElementById('fightBtn').textContent = '🎴 点击符卡攻击';
    }

    function attackAndShowReading() {
        var card = battleDrawnCards[currentCardIndex]; card.revealed = true; card.used = true;
        document.getElementById('readingSpot').textContent = card.reading||card.word;
        var damage = DAMAGE_MAP[card.rarity]||50; currentOpponentHP = Math.max(0, currentOpponentHP-damage);
        AudioManager.playDamage();
        document.getElementById('hpBar').style.width = (currentOpponentHP/currentOpponentMaxHP*100)+'%';
        document.getElementById('hpText').textContent = '❤️ '+currentOpponentHP+' / '+currentOpponentMaxHP;
        document.getElementById('cardArea').querySelector('.hand-card').onclick = null;
        document.getElementById('cardArea').querySelector('.hand-card').style.opacity = '0.5';
        document.getElementById('cardArea').querySelector('.hand-card').style.cursor = 'default';
        document.getElementById('fightBtn').disabled = false; document.getElementById('fightBtn').textContent = '⚡ 战斗';
        showDamageNumber(damage);
        var oppImage = document.getElementById('oppImage');
        if (oppImage) {
            if (currentOpponentHP<=0) oppImage.src = '/static/images/opponents/'+currentOpponent.id+'_angry.png';
            else if (card.rarity==='SSR') oppImage.src = '/static/images/opponents/'+currentOpponent.id+'_cry.png';
            else if (card.rarity==='SR') oppImage.src = '/static/images/opponents/'+currentOpponent.id+'_sad.png';
            else oppImage.src = '/static/images/opponents/'+currentOpponent.id+'_surprised.png';
        }
        if (currentOpponentHP<=0) { setTimeout(function(){ endBattle(true); },1200); }
        else { var allUsed = battleDrawnCards.every(function(c){return c.used;}); if (allUsed) { if (oppImage) oppImage.src = '/static/images/opponents/'+currentOpponent.id+'_angry.png'; setTimeout(function(){ endBattle(false); },1200); } }
    }

    function endBattle(victory) {
        if (victory) {
            AudioManager.playVictory();
            var token = localStorage.getItem('touhou_user_token');
            if (token) {
                fetch('/api/battle/reward', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:token,opponent_id:currentOpponent.id})}).then(r=>r.json()).then(function(d){
                    if (d.success) { battleDrawnCards = battleDrawnCards.filter(function(c){return !c.used;}); showVictoryPopup('获得 '+d.reward+' 賽錢！'); }
                });
            }
        } else { Panels.showToast('💢','战斗失败，请重新挑战','error'); battleDrawnCards = []; }
    }

    function showDamageNumber(damage) { var popup = document.createElement('div'); popup.style.cssText = 'position:fixed;font-size:2em;font-weight:bold;color:#ff4444;pointer-events:none;z-index:200;left:45%;top:30%;animation:floatUp 1s ease-out forwards;'; popup.textContent = '-'+damage; document.body.appendChild(popup); setTimeout(function(){popup.remove();},1000); }
    function showVictoryPopup(rewardMsg) { var popup = document.createElement('div'); popup.className = 'victory-popup'; popup.innerHTML = '<span class="victory-emoji">🎉</span><div class="victory-text">胜利！</div><p>'+rewardMsg+'</p><button class="btn btn-primary" style="margin-top:15px;" onclick="AudioManager.stopAll(); AudioManager.playBGM(); this.parentElement.remove(); Panels.renderDuelPanel().then(function(h){document.getElementById(\'modalBody\').innerHTML=h;})">返回</button>'; document.body.appendChild(popup); }

    // ==================== 3. 河童杂货铺 ====================
    async function renderShopPanel() { try { const result = await API.getShopItems(); const shop = result.data; const itemsHTML = shop.map(item => `<div class="shop-item"><div class="item-emoji">${item.icon}</div><div class="item-details"><div class="item-name">${item.name_jp}</div><div class="item-desc">${item.description} (${item.name_cn})</div></div><div class="item-price">¥${item.price}</div><button class="btn btn-sm btn-primary" onclick="Panels.buyItem('${item.name_jp}')">購入</button></div>`).join(''); return `<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">🏮 河童杂货铺 — 买卖修行</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">店主：${result.shopkeeper} · いらっしゃいませ！</div></div><p style="text-align:center;color:#d4a574;margin-bottom:15px;">💬 ${result.greeting}</p>${itemsHTML}<p id="buyResult" style="text-align:center;margin-top:15px;color:#d4a574;min-height:24px;"></p>`; } catch (error) { throw error; } }
    async function buyItem(itemName) { const token = localStorage.getItem('touhou_user_token')||''; try { const res = await fetch(`${window.location.origin}/api/shop/buy`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item_name:itemName,token})}); const data = await res.json(); const resultDiv = document.getElementById('buyResult'); if (resultDiv) { if (data.success) { resultDiv.innerHTML = `🛒 ${data.message}${data.balance!==undefined?' (剩余賽錢: '+data.balance+')':''}`; showToast('🛒',data.message,'success'); if(window.loadUserHeader) setTimeout(window.loadUserHeader,500); } else { resultDiv.innerHTML = `💢 ${data.message}`; showToast('💢',data.message,'error'); } } } catch (error) { showToast('💢','购买失败','error'); } }

    // ==================== 4. 文法罗盘（动态切换版） ====================

    async function renderGrammarPanel() {
        var grammars = [
            { description: '日语的基本语序是主语(S)+宾语(O)+谓语(V)', example_wrong: '我 吃 苹果', example_correct: '私は リンゴを 食べます', tip: '谓语永远在句末，助词是指针', formula: '主语 → は/が → 宾语 → を → 谓语' },
            { description: '「〜たい」表示愿望，"想做某事"', example_wrong: 'I want to go', example_correct: '私は 日本に 行きたいです', tip: '「〜たい」接在动词连用形后', formula: '主语 → は → 目的地 → に → 动词+たい' },
            { description: '「〜ている」表示正在进行的动作或状态', example_wrong: 'I am studying', example_correct: '私は 勉強しています', tip: '「〜て+いる」变「〜ています」更礼貌', formula: '主语 → は → 宾语 → を → 动词+ている' },
            { description: '「〜たことがある」表示曾经有过的经历', example_wrong: 'I have been to Japan', example_correct: '私は 日本に 行ったことがあります', tip: '动词た形+ことがある，表示经验', formula: '主语 → は → 场所 → に → 动词た形+ことがある' },
            { description: '「〜なければならない」表示必须做某事', example_wrong: 'I must study', example_correct: '私は 勉強しなければなりません', tip: '否定形+ば+ならない，表示义务', formula: '主语 → は → 宾语 → を → 动词否定形+ばならない' }
        ];
        
        var index = Math.floor(Math.random() * grammars.length);
        var g = grammars[index];
        
        return `
            <div class="modal-header">
                <div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">🧭 迷路竹林文法罗盘</div>
                <div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;" id="grammarCounter">语法 1/5</div>
            </div>
            <div class="grammar-video-wrapper">
                <video autoplay loop muted playsinline>
                    <source src="/static/video/grammar_bg.mp4" type="video/mp4">
                </video>
                <div class="grammar-overlay">
                    <p style="color:#f0e6d3;text-align:center;font-size:1.05em;" id="grammarDesc">${g.description}</p>
                    <div style="text-align:center;font-size:1.2em;margin:20px 0;" id="grammarExample">
                        ❌ <span style="color:#ff6b6b;text-decoration:line-through;">${g.example_wrong}</span> (SVO)<br>
                        ✅ <span style="color:#5a5;">${g.example_correct}</span>
                    </div>
                    <p style="color:#f0e6d3;text-align:center;" id="grammarFormula">${g.formula}</p>
                </div>
            </div>
            <p style="text-align:center;color:#b8956a;" id="grammarTip">${g.tip}</p>
        `;
    }

    // ==================== 5. 弹幕射击小游戏 ====================

    let danmakuScore = 0;
    let danmakuTarget = 10;
    let danmakuActive = false;
    let danmakuTimer = null;
    let danmakuWords = [];
    let danmakuMode = 'word';
    let danmakuEnemyHP = 10;

    async function renderDanmakuPanel() {
        danmakuScore = 0;
        danmakuEnemyHP = 10;
        danmakuActive = false;
        
        var html = '<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">💥 弹幕射击 — 言灵弹幕</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">点击正确弹幕，击破敌人！</div></div>';
        
        // 模式选择
        html += '<div style="text-align:center;margin-bottom:10px;">';
        html += '<button class="btn btn-primary btn-sm" onclick="Panels.setDanmakuMode(\'word\')" id="modeWordBtn" style="margin:4px;">📝 单词模式</button>';
        html += '<button class="btn btn-ghost btn-sm" onclick="Panels.setDanmakuMode(\'sentence\')" id="modeSentenceBtn" style="margin:4px;">📖 句子模式</button>';
        html += '</div>';
        
        // 游戏区域
        html += '<div id="danmakuGameArea" style="position:relative;width:100%;height:350px;background:rgba(0,0,0,0.4);border:2px solid var(--border-primary);border-radius:12px;overflow:hidden;cursor:crosshair;">';
        
        // 怪物（右侧）
        html += '<div id="danmakuEnemy" style="position:absolute;right:20px;top:50%;transform:translateY(-50%);text-align:center;transition:all 0.3s;">';
        html += '<img id="enemyImg" src="/static/images/opponents/cirno_normal.png" style="width:80px;height:auto;">';
        html += '<div style="color:#e74c3c;font-size:0.8em;">HP: <span id="enemyHP">' + danmakuEnemyHP + '</span></div>';
        html += '<div class="hp-bar-outer" style="width:60px;margin:4px auto;"><div class="hp-bar-inner" id="enemyHPBar" style="width:100%;background:linear-gradient(90deg,#e74c3c,#ff6b6b);"></div></div>';
        html += '</div>';
        
        // 自机（左侧）- 使用角色PNG
        var playerImg = '/static/images/characters/reimu.png';
        try {
            var token = localStorage.getItem('touhou_user_token');
            if (token) {
                var pRes = await fetch('/api/user/profile?token=' + token);
                var pData = await pRes.json();
                if (pData.success && pData.data.character_emoji) {
                    playerImg = pData.data.character_emoji;
                }
            }
        } catch(e) {}
        
        html += '<div id="danmakuPlayer" style="position:absolute;left:30px;top:50%;transform:translateY(-50%);transition:all 0.2s;">';
        html += '<img src="' + playerImg + '" style="width:60px;height:auto;">';
        html += '</div>';
        
        html += '</div>';
        
        // 分数和按钮
        html += '<div style="text-align:center;margin-top:12px;">';
        html += '<span style="color:#ffd700;font-size:1.2em;">⭐ 积分: <strong id="danmakuScore">0</strong></span>';
        html += '&nbsp;&nbsp;';
        html += '<button class="btn btn-primary" id="danmakuStartBtn" onclick="Panels.startDanmakuGame()">🎮 开始游戏</button>';
        html += '<button class="btn btn-ghost btn-sm" onclick="Panels.stopDanmakuGame()">⏹ 停止</button>';
        html += '</div>';
        
        return html;
    }

    function setDanmakuMode(mode) {
        danmakuMode = mode;
        document.getElementById('modeWordBtn').className = (mode === 'word') ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
        document.getElementById('modeSentenceBtn').className = (mode === 'sentence') ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm';
    }

    async function startDanmakuGame() {
        danmakuScore = 0;
        danmakuEnemyHP = 10;
        danmakuActive = true;
        document.getElementById('danmakuScore').textContent = '0';
        document.getElementById('enemyHP').textContent = danmakuEnemyHP;
        document.getElementById('enemyHPBar').style.width = '100%';
        document.getElementById('danmakuStartBtn').disabled = true;
        
        // 加载单词
        var jlpt = localStorage.getItem('jlpt_enabled') || 'true';
        danmakuWords = [];
        try {
            var res = await fetch(window.location.origin + '/api/cards?jlpt=' + jlpt);
            var data = await res.json();
            if (data.success && data.data.length > 0) {
                var shuffled = data.data.sort(function() { return 0.5 - Math.random(); });
                danmakuWords = shuffled.slice(0, 30);
            }
        } catch(e) {
            danmakuWords = [{word:'テスト', reading:'てすと', meaning:'测试'}, {word:'知識', reading:'ちしき', meaning:'知识'}, {word:'学校', reading:'がっこう', meaning:'学校'}];
        }
        
        pickNewTarget();
        spawnDanmaku();
    }

    function pickNewTarget() {
        if (danmakuWords.length === 0) return;
        var idx = Math.floor(Math.random() * danmakuWords.length);
        var target = danmakuWords[idx];
        var targetWord = (danmakuMode === 'word') ? target.word : (target.reading || target.word);
        document.getElementById('danmakuEnemy').setAttribute('data-target', targetWord);

        var player = document.getElementById('danmakuPlayer');
        if (player) {
            var hint = document.getElementById('targetHint');
            if (!hint) {
                hint = document.createElement('div');
                hint.id = 'targetHint';
                hint.style.cssText = 'position:absolute;top:-25px;left:50%;transform:translateX(-50%);color:#ffd700;font-size:0.8em;white-space:nowrap;';
                player.appendChild(hint);
            }
                hint.textContent = '🎯 找: ' + targetWord;
            }
        }
    

    function spawnDanmaku() {
        if (!danmakuActive) return;
        var gameArea = document.getElementById('danmakuGameArea');
        if (!gameArea) return;
        
        // 清除旧弹幕
        gameArea.querySelectorAll('.danmaku-bullet').forEach(function(b) { b.remove(); });
        
        var targetWord = document.getElementById('danmakuEnemy').getAttribute('data-target') || '';
        
        // 生成4-6个弹幕，1个正确
        var count = 4 + Math.floor(Math.random() * 3);
        var correctPos = Math.floor(Math.random() * count);
        
        var distractors = [];
        for (var i = 0; i < danmakuWords.length; i++) {
            var w = (danmakuMode === 'word') ? danmakuWords[i].word : (danmakuWords[i].reading || danmakuWords[i].word);
            if (w !== targetWord && w.length > 1) distractors.push(w);
        }
        distractors = distractors.sort(function() { return 0.5 - Math.random(); });
        
        for (var i = 0; i < count; i++) {
            var bullet = document.createElement('div');
            bullet.className = 'danmaku-bullet';
            
            var word;
            if (i === correctPos) {
                word = targetWord;
                bullet.setAttribute('data-correct', 'true');
            } else {
                word = distractors[i % distractors.length] || '???';
                bullet.setAttribute('data-correct', 'false');
            }
            
            bullet.textContent = word;
            bullet.setAttribute('data-word', word);
            
            var top = 30 + Math.random() * 280;
            var size = 14 + Math.random() * 8;
            var duration = 3 + Math.random() * 3;
            
            bullet.style.cssText = 
                'position:absolute;' +
                'left:100%;' +
                'top:' + top + 'px;' +
                'font-size:' + size + 'px;' +
                'color:#ff6b6b;' +
                'text-shadow:0 0 6px rgba(255,100,100,0.8);' +
                'animation:danmakuFloat ' + duration + 's linear forwards;' +
                'cursor:pointer;' +
                'white-space:nowrap;' +
                'z-index:10;' +
                'user-select:none;';
            
            bullet.onclick = function(e) {
                e.stopPropagation();
                if (!danmakuActive) return;
                
                var isCorrect = this.getAttribute('data-correct') === 'true';
                if (isCorrect) {
                    hitTarget();
                    gameArea.querySelectorAll('.danmaku-bullet').forEach(function(b) { b.remove(); });
                    clearTimeout(danmakuTimer);
                    if (danmakuActive) {
                        pickNewTarget();
                        danmakuTimer = setTimeout(function() { spawnDanmaku(); }, 600);
                    }
                } else {
                    // 错误：弹幕闪红
                    this.style.color = '#fff';
                    this.style.textShadow = '0 0 12px #fff';
                    setTimeout(function(b) { b.style.color = '#ff6b6b'; b.style.textShadow = '0 0 6px rgba(255,100,100,0.8)'; }, 200, this);
                }
            };
            
            gameArea.appendChild(bullet);
        }
        
        // 弹幕循环：间隔后重新生成
        danmakuTimer = setTimeout(function() {
            gameArea.querySelectorAll('.danmaku-bullet').forEach(function(b) { b.remove(); });
            if (danmakuActive) spawnDanmaku();
        }, 4000);
    }

    function hitTarget() {
        // 随机伤害 1-3
        var damage = 1 + Math.floor(Math.random() * 3);
        danmakuEnemyHP -= damage;
        danmakuScore += damage;
        
        document.getElementById('danmakuScore').textContent = danmakuScore;
        document.getElementById('enemyHP').textContent = Math.max(0, danmakuEnemyHP);
        document.getElementById('enemyHPBar').style.width = (Math.max(0, danmakuEnemyHP) / 10 * 100) + '%';
        
        // 发射弹幕动画
        firePlayerBullet();
        
        // 怪物受伤闪烁
        var enemy = document.getElementById('danmakuEnemy');
        enemy.style.filter = 'brightness(2)';
        setTimeout(function() { enemy.style.filter = ''; }, 200);
        
        // 音效
        if (window.AudioManager) AudioManager.playDamage();
        
        if (danmakuEnemyHP <= 0) {
            danmakuActive = false;
            clearTimeout(danmakuTimer);
            
            document.getElementById('enemyImg').style.filter = 'grayscale(1)';
            document.getElementById('enemyHP').textContent = '0';
            document.getElementById('enemyHPBar').style.width = '0%';
            
            var reward = danmakuScore * 100;  // 1:100 积分换賽錢
            
            setTimeout(function() {
                // 发放奖励
                var token = localStorage.getItem('touhou_user_token');
                if (token) {
                    fetch('/api/user/currencies/add', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({token: token, type: '賽錢', amount: reward})
                    }).then(function(r){ return r.json(); }).then(function(d) {
                        if (d.success) {
                            showDanmakuResultPopup(danmakuScore, reward);
                            if (window.loadUserHeader) setTimeout(window.loadUserHeader, 500);
                        }
                    });
                } else {
                    showDanmakuResultPopup(danmakuScore, reward);
                }
                document.getElementById('danmakuStartBtn').disabled = false;
            }, 600);
        }
    }

    function firePlayerBullet() {
        var gameArea = document.getElementById('danmakuGameArea');
        var player = document.getElementById('danmakuPlayer');
        var enemy = document.getElementById('danmakuEnemy');
        if (!gameArea || !player || !enemy) return;
        
        var bullet = document.createElement('div');
        bullet.style.cssText = 
            'position:absolute;' +
            'left:' + (player.offsetLeft + 30) + 'px;' +
            'top:' + (player.offsetTop + 25) + 'px;' +
            'width:10px;height:10px;' +
            'background:#ffd700;' +
            'border-radius:50%;' +
            'box-shadow:0 0 10px #ffd700;' +
            'animation:playerShoot 0.4s linear forwards;' +
            'z-index:20;pointer-events:none;';
        gameArea.appendChild(bullet);
        setTimeout(function() { bullet.remove(); }, 500);
    }

    function stopDanmakuGame() {
        danmakuActive = false;
        clearTimeout(danmakuTimer);
        document.getElementById('danmakuStartBtn').disabled = false;
        document.getElementById('danmakuScore').textContent = '0';
        danmakuEnemyHP = 10;
        document.getElementById('enemyHP').textContent = danmakuEnemyHP;
        document.getElementById('enemyHPBar').style.width = '100%';
        document.getElementById('enemyImg').style.filter = '';
        var gameArea = document.getElementById('danmakuGameArea');
        if (gameArea) gameArea.querySelectorAll('.danmaku-bullet').forEach(function(b) { b.remove(); });
    }


    function showDanmakuResultPopup(score, reward) {
    var popup = document.createElement('div');
    popup.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:300;background:var(--bg-modal);border:3px solid #ffd700;border-radius:16px;padding:30px;text-align:center;box-shadow:0 0 60px rgba(255,215,0,0.5);animation:scaleIn 0.5s ease-out;';
    popup.innerHTML = 
        '<span style="font-size:4em;display:block;">🎉</span>' +
        '<div style="color:#ffd700;font-size:1.5em;margin:10px 0;">弹幕击破！</div>' +
        '<p style="color:var(--text-primary);">⭐ 积分: <strong>' + score + '</strong></p>' +
        '<p style="color:#ffd700;">💰 获得賽錢: <strong>' + reward + '</strong></p>' +
        '<button class="btn btn-primary" style="margin-top:15px;" onclick="this.parentElement.remove();">确定</button>';
    document.body.appendChild(popup);
    }

    // ==================== 6. 神社占卜 ====================
    async function renderCulturePanel() {
        var token = localStorage.getItem('touhou_user_token')||''; var fortuneData = null; var alreadyDone = false;
        try { var res = await fetch('/api/fortune?token='+encodeURIComponent(token)); var data = await res.json(); if (data.success) { fortuneData = data.data; alreadyDone = data.already_done; } } catch(e) {}
        var html = '<div class="modal-header"><div class="modal-title" style="font-size:1.6em;color:var(--color-gold);text-align:center;">⛩️ 博麗神社 · おみくじ</div><div class="modal-subtitle" style="text-align:center;color:#887060;font-size:0.9em;">每日占卜 · 测测今天的运势</div></div><div class="shrine-scene"><div class="fortune-box" id="fortuneBox">';
        if (alreadyDone && fortuneData) { html += '<span class="fortune-emoji">'+fortuneData.emoji+'</span><div class="fortune-level" style="color:'+fortuneData.color+'">'+fortuneData.level+'</div><p class="fortune-message">'+fortuneData.message+'</p><p style="color:#ffd700;">💰 +'+fortuneData.reward+' 賽錢</p><p style="color:var(--text-muted);font-size:0.8em;">今日已占卜，明天再来吧</p>'; }
        else { html += '<img src="/static/images/fortune_box.png" class="fortune-box-img" id="fortuneImg" style="width:120px;height:auto;"><p style="color:var(--text-muted);">摇动抽签筒，抽取你的运势</p>'; }
        html += '</div>';
        if (!alreadyDone) { html += '<button class="btn btn-primary btn-lg" onclick="Panels.drawFortune()" style="margin-top:15px;">🎋 抽签占卜</button>'; }
        html += '<button class="btn btn-ghost" style="margin-top:10px;" onclick="Panels.performBow()">🙏 参拜</button></div>';
        return html;
    }
    async function drawFortune() {
        var token = localStorage.getItem('touhou_user_token')||'';
        var box = document.getElementById('fortuneBox');
        box.innerHTML = '<img src="/static/images/fortune_box.png" class="fortune-box-img shaking" id="fortuneImg" style="width:120px;height:auto;"><p style="color:var(--text-muted);">摇晃中...</p>';
        try {
            var res = await fetch('/api/fortune?token='+encodeURIComponent(token)); var data = await res.json();
            if (data.success) {
                var f = data.data;
                box.innerHTML = '<span class="fortune-emoji">'+f.emoji+'</span><div class="fortune-level" style="color:'+f.color+';font-size:2em;">'+f.level+'</div><p class="fortune-message">'+f.message+'</p><p style="color:#ffd700;">💰 +'+f.reward+' 賽錢</p>';
                if (window.loadUserHeader) setTimeout(window.loadUserHeader, 500);
            }
        } catch(e) {}
    }
    function showToast(icon, message, type) { type = type||'info'; var container = document.getElementById('toastContainer'); if (!container) return; var toast = document.createElement('div'); toast.className = 'toast '+type; toast.innerHTML = '<span class="toast-icon">'+icon+'</span> '+message; container.appendChild(toast); setTimeout(function(){toast.remove();},3000); }
    function performBow() { alert('⛩️ 参拜完成：二礼二拍手一礼\n\n愿幻想乡的众神保佑你。'); }

    return {
        renderPanels, openModal, closeModal, refreshCard,
        buyItem, performBow, showToast,
        drawBattleCards, showHandCards, startBattle, revealCard, attackAndShowReading,
        renderDuelPanel, renderBattleScreen2, battleDrawnCards, currentOpponent, currentOpponentHP,
        currentOpponentMaxHP, drawFortune, renderCulturePanel,
        setDanmakuMode, startDanmakuGame, stopDanmakuGame
    };
})();
window.Panels = Panels;