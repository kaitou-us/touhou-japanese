/**
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
    
    return {
        drawHandCards,
        getHandCards,
        setOpponent,
        useCard,
        resetBattle,
        getDamage
    };
})();

window.Battle = Battle;