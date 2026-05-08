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
})();