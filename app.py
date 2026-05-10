# -*- coding: utf-8 -*-
"""
幻想郷 言霊修行帳 — Flask 后端
Touhou Project Japanese Learning Platform
"""

import json
import random
import uuid
import datetime
import os
from pathlib import Path
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# ==================== 数据文件路径 ====================
BASE_DIR = Path(__file__).parent
DATA_FILE = BASE_DIR / 'data' / 'cards.json'
USERS_FILE = BASE_DIR / 'data' / 'users.json'

# ==================== 数据加载函数 ====================

def load_data():
    """加载 cards.json 数据"""
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {
            "vocabulary_cards": [],
            "shop_items": [],
            "danmaku_exercises": [],
            "grammar_points": [],
            "culture_points": []
        }

def load_users_data():
    """加载用户数据"""
    try:
        with open(USERS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"character_pool": [], "users": {}}

def save_users_data(data):
    """保存用户数据"""
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_or_create_user(user_token):
    """根据 token 获取用户"""
    data = load_users_data()
    if user_token and user_token in data.get('users', {}):
        return data, data['users'][user_token]
    return data, None

# ==================== 页面路由 ====================

@app.route('/')
def index():
    """主页面 — 幻想乡入口"""
    return render_template('index.html')

@app.route('/health')
def health_check():
    """健康检查"""
    return jsonify({"status": "ok", "message": "言灵之力正常运行"})

# ==================== API 路由 ====================

@app.route('/api/panels')
def get_panels():
    """获取六大板块信息"""
    panels = [
        {"id": 1, "icon": "🈶", "number": "其の壹", "title": "词汇符卡 — 言灵収集", "description": "收集散落的言灵，构建你的专属词汇库", "featured": False},
        {"id": 2, "icon": "⚔️", "number": "其の弐", "title": "符卡对决 — 宣告之战", "description": "言灵即是力量。抽出符卡，大声读出单词", "featured": False},
        {"id": 3, "icon": "🏮", "number": "其の参", "title": "河童杂货铺 — 买卖修行", "description": "在河童的机械杂货铺里，用日语购物", "featured": False},
        {"id": 4, "icon": "🧭", "number": "其の四", "title": "迷路竹林文法罗盘", "description": "谓语在最后，助词是指针。走出语序竹林", "featured": False},  # ← 改为 False
        {"id": 5, "icon": "💥", "number": "其の五", "title": "弹幕洗练 — 句子重组", "description": "在弹幕地狱中冷静重组语法", "featured": False},
        {"id": 6, "icon": "⛩️", "number": "其の陸", "title": "神社点 — 神话与文化", "description": "每一座神社都是一部活着的古事记", "featured": False}
    ]
    return jsonify({"success": True, "data": panels})

# ---------- 1. 词汇符卡 ----------

@app.route('/api/card/random')
def random_card():
    data = load_data()
    cards = data.get('vocabulary_cards', [])
    if not cards:
        return jsonify({"success": False, "message": "符卡池为空"}), 500
    card = random.choice(cards)
    return jsonify({"success": True, "data": card, "message": f"🎴 抽到了 <{card['rarity']}> 级别的言灵！"})

@app.route('/api/cards')
def all_cards():
    data = load_data()
    return jsonify({"success": True, "data": data.get('vocabulary_cards', []), "total": len(data.get('vocabulary_cards', []))})

@app.route('/api/card/<int:card_id>')
def get_card(card_id):
    data = load_data()
    card = next((c for c in data.get('vocabulary_cards', []) if c['id'] == card_id), None)
    if card:
        return jsonify({"success": True, "data": card})
    return jsonify({"success": False, "message": "符卡未找到"}), 404

# ---------- 2. 符卡对决 ----------

@app.route('/api/duel', methods=['GET', 'POST'])
def duel():
    if request.method == 'POST':
        user_input = request.json.get('spell_name', '') if request.is_json else ''
        power = random.randint(100, 999)
        outcome = random.choice(["完美发音！对手受到重创！", "发音可辨，弹幕互相抵消！", "言灵之力觉醒，胜利！"])
        return jsonify({"success": True, "user_spell": user_input, "power": power, "outcome": outcome})
    
    duel_info = {
        "player1": {"name": "灵梦", "spell": "霊符「夢想封印」", "emoji": "🧙‍♀️"},
        "player2": {"name": "蕾米莉亚", "spell": "紅符「不夜城レッド」", "emoji": "🧛"},
        "instruction": "请大声宣告你的符卡名称，以灵力震动结界"
    }
    return jsonify({"success": True, "data": duel_info})

# ---------- 3. 河童杂货铺 ----------

@app.route('/api/shop')
def shop():
    data = load_data()
    return jsonify({"success": True, "data": data.get('shop_items', []), "greeting": "いらっしゃいませ！欢迎光临河童杂货铺！", "shopkeeper": "河城荷取"})

@app.route('/api/shop/buy', methods=['POST'])
def buy_item():
    item_name = request.json.get('item_name', '')
    if not item_name:
        return jsonify({"success": False, "message": "请指定要购买的商品"}), 400
    return jsonify({"success": True, "message": f"「{item_name}」をください！— 好的，这是您的{item_name}！", "item": item_name})

# ---------- 4. 文法罗盘 ----------

@app.route('/api/grammar')
def grammar():
    data = load_data()
    return jsonify({"success": True, "data": data.get('grammar_points', []), "compass_口诀": "主语 → は/が → 宾语 → を → 谓语(永远在最后!)"})

# ---------- 5. 弹幕洗练 ----------

@app.route('/api/danmaku/random')
def random_danmaku():
    data = load_data()
    exercises = data.get('danmaku_exercises', [])
    if not exercises:
        return jsonify({"success": False, "message": "题目池为空"}), 500
    exercise = random.choice(exercises)
    shuffled = exercise['words'][:]
    random.shuffle(shuffled)
    return jsonify({"success": True, "data": {"id": exercise['id'], "shuffled_words": shuffled, "meaning": exercise['meaning']}})

@app.route('/api/danmaku/check', methods=['POST'])
def check_danmaku():
    user_order = request.json.get('answer', [])
    exercise_id = request.json.get('exercise_id', 1)
    data = load_data()
    exercise = next((e for e in data.get('danmaku_exercises', []) if e['id'] == exercise_id), None)
    if not exercise:
        return jsonify({"success": False, "message": "题目未找到"}), 404
    is_correct = user_order == exercise['correct_order']
    message = f"🎉 洗练成功！弹幕化作笔直的光束——{' '.join(exercise['correct_order'])}（{exercise['meaning']}）" if is_correct else f"💢 弹幕暴走！正确语序应为：{' '.join(exercise['correct_order'])}"
    return jsonify({"success": True, "is_correct": is_correct, "message": message, "correct_order": exercise['correct_order']})

# ---------- 6. 神社文化 ----------

@app.route('/api/culture')
def culture():
    data = load_data()
    return jsonify({"success": True, "data": data.get('culture_points', []), "shrine_name": "博麗神社", "blessing": "愿幻想乡的众神保佑你。"})

# ==================== 用户系统 ====================

@app.route('/api/user/character_pool')
def character_pool():
    data = load_users_data()
    pool = data.get('character_pool', [])
    preview = [{"id": c['id'], "name": c['name'], "emoji": c['emoji'], "title": c['title']} for c in pool]
    return jsonify({"success": True, "data": preview, "total": len(pool)})

@app.route('/api/user/draw_character', methods=['POST'])
def draw_character():
    try:
        data = load_users_data()
        pool = data.get('character_pool', [])
        if not pool:
            return jsonify({"success": False, "message": "角色池为空"}), 500
        character = random.choice(pool)
        return jsonify({"success": True, "data": {
            "id": character['id'], "name": character['name'], "title": character['title'],
            "rarity": character['rarity'], "emoji": character['emoji'], "color": character['color'],
            "description": character['description'], "starter_card": character['starter_card'],
            "starter_currency": character['starter_currency']
        }})
    except Exception as e:
        return jsonify({"success": False, "message": f"抽取失败: {str(e)}"}), 500

@app.route('/api/user/register', methods=['POST'])
def register_user():
    character_data = request.json.get('character', {})
    custom_name = request.json.get('custom_name', '')
    if not character_data:
        return jsonify({"success": False, "message": "请先抽取角色"}), 400
    
    data = load_users_data()
    user_token = str(uuid.uuid4())
    display_name = custom_name.strip() if custom_name.strip() else character_data['name']
    
    new_user = {
        "token": user_token, "character_id": character_data['id'],
        "display_name": display_name, "character_name": character_data['name'],
        "character_title": character_data['title'], "character_emoji": character_data['emoji'],
        "character_color": character_data['color'], "character_rarity": character_data['rarity'],
        "level": 1, "exp": 0, "exp_to_next": 100,
        "joined_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "currencies": character_data['starter_currency'],
        "inventory": {
            "spell_cards": [{
                "id": "sc_init_001", "name": character_data['starter_card'],
                "rarity": character_data['rarity'], "type": "attack",
                "power": 300 if character_data['rarity'] == 'R' else (500 if character_data['rarity'] == 'SR' else 999),
                "description": f"{character_data['name']}的初始符卡",
                "obtained_date": datetime.datetime.now().strftime("%Y-%m-%d"), "equipped": True
            }],
            "items": [
                {"id": "item_init_001", "name": "博丽茶", "type": "consumable", "rarity": "R", "quantity": 3, "effect": "恢复50点灵力", "description": "博丽神社特产", "icon": "🍵"},
                {"id": "item_init_002", "name": "欢迎团子", "type": "consumable", "rarity": "R", "quantity": 5, "effect": "恢复30点灵力", "description": "白玉楼特制欢迎团子", "icon": "🍡"}
            ],
            "equipment": []
        },
        "stats": {"total_cards_collected": 1, "total_duels_won": 0, "total_items_used": 0, "login_count": 1, "last_login": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")}
    }
    
    data.setdefault('users', {})[user_token] = new_user
    save_users_data(data)
    
    return jsonify({"success": True, "message": f"欢迎 {display_name} 来到幻想乡！", "data": {"token": user_token, "display_name": display_name, "character_name": character_data['name'], "character_emoji": character_data['emoji'], "character_rarity": character_data['rarity']}})

@app.route('/api/user/login', methods=['POST'])
def login_user():
    user_token = request.json.get('token', '')
    data = load_users_data()
    if user_token in data.get('users', {}):
        user = data['users'][user_token]
        user['stats']['login_count'] += 1
        user['stats']['last_login'] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        save_users_data(data)
        return jsonify({"success": True, "message": f"欢迎回来，{user['display_name']}！", "data": {
            "token": user_token, "display_name": user['display_name'],
            "character_name": user['character_name'], "character_emoji": user['character_emoji'],
            "character_rarity": user['character_rarity'], "level": user['level'],
            "exp": user['exp'], "exp_to_next": user['exp_to_next'],
            "currencies": user['currencies'], "login_count": user['stats']['login_count']
        }})
    return jsonify({"success": False, "message": "用户未找到，请重新抽取角色"}), 404

@app.route('/api/user/profile')
def user_profile():
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    return jsonify({"success": True, "data": {
        "token": user['token'], "display_name": user['display_name'],
        "character_name": user['character_name'], "character_title": user['character_title'],
        "character_emoji": user['character_emoji'], "character_color": user['character_color'],
        "character_rarity": user['character_rarity'], "level": user['level'],
        "exp": user['exp'], "exp_to_next": user['exp_to_next'],
        "currencies": user['currencies'], "stats": user['stats']
    }})

@app.route('/api/user/currencies')
def user_currencies():
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    return jsonify({"success": True, "data": user['currencies']})

@app.route('/api/user/currencies/add', methods=['POST'])
def add_currency():
    user_token = request.json.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    currency_type = request.json.get('type', '')
    amount = request.json.get('amount', 0)
    if currency_type in user['currencies']:
        user['currencies'][currency_type] += amount
        save_users_data(data)
        return jsonify({"success": True, "message": f"获得 {amount} {currency_type}！", "data": user['currencies']})
    return jsonify({"success": False, "message": "未知货币类型"}), 400

# ---------- 背包 ----------

@app.route('/api/inventory/overview')
def inventory_overview():
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    inv = user['inventory']
    return jsonify({"success": True, "data": {
        "currencies": user['currencies'],
        "spell_cards_count": len(inv['spell_cards']),
        "items_count": sum(item['quantity'] for item in inv['items']),
        "equipment_count": len(inv['equipment']),
        "equipped_card": next((c for c in inv['spell_cards'] if c.get('equipped')), None)
    }})

@app.route('/api/inventory/spellcards')
def get_spellcards():
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    return jsonify({"success": True, "data": user['inventory']['spell_cards']})

@app.route('/api/inventory/spellcards/equip', methods=['POST'])
def equip_spellcard():
    user_token = request.json.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    card_id = request.json.get('card_id', '')
    equip = request.json.get('equip', True)
    for card in user['inventory']['spell_cards']:
        if card['id'] == card_id:
            card['equipped'] = equip
            save_users_data(data)
            return jsonify({"success": True, "message": f"符卡「{card['name']}」已{'装备' if equip else '卸下'}！"})
    return jsonify({"success": False, "message": "符卡未找到"}), 404

@app.route('/api/inventory/items')
def get_items():
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    return jsonify({"success": True, "data": user['inventory']['items']})

@app.route('/api/inventory/items/use', methods=['POST'])
def use_item():
    user_token = request.json.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    item_id = request.json.get('item_id', '')
    for item in user['inventory']['items']:
        if item['id'] == item_id and item['quantity'] > 0:
            item['quantity'] -= 1
            if item['quantity'] <= 0:
                user['inventory']['items'].remove(item)
            user['stats']['total_items_used'] += 1
            save_users_data(data)
            return jsonify({"success": True, "message": f"使用 {item['name']}：{item['effect']}！"})
    return jsonify({"success": False, "message": "道具使用失败"}), 400

@app.route('/api/inventory/equipment')
def get_equipment():
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    return jsonify({"success": True, "data": user['inventory']['equipment']})

# ---------- 收藏系统 ----------

@app.route('/api/favorites')
def get_favorites():
    """获取收藏列表"""
    user_token = request.args.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    return jsonify({"success": True, "data": user.get('favorites', [])})


@app.route('/api/favorites/add', methods=['POST'])
def add_favorite():
    user_token = request.json.get('token', '')
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    
    card_id = request.json.get('card_id')
    word = request.json.get('word', '')
    reading = request.json.get('reading', '')
    meaning = request.json.get('meaning', '')
    rarity = request.json.get('rarity', 'R')
    level = request.json.get('level', '')
    
    if 'favorites' not in user:
        user['favorites'] = []
    
    # 检查是否已收藏
    if any(str(f.get('card_id')) == str(card_id) for f in user['favorites']):
        return jsonify({"success": False, "message": "已收藏过此符卡"})
    
    user['favorites'].append({
        "card_id": card_id,
        "word": word,
        "reading": reading,
        "meaning": meaning,
        "rarity": rarity,
        "level": level,
        "favorited_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    })
    
    save_users_data(data)
    return jsonify({"success": True, "message": f"已收藏「{word}」！"})

    
@app.route('/api/favorites/remove', methods=['POST'])
def remove_favorite():
    """取消收藏"""
    user_token = request.json.get('token', '')
    card_id = request.json.get('card_id')
    
    data, user = get_or_create_user(user_token)
    if not user:
        return jsonify({"success": False, "message": "请先登录"}), 401
    
    if 'favorites' not in user:
        return jsonify({"success": False, "message": "收藏列表为空"})
    
    # 修复：统一转为字符串比较，确保匹配
    before_count = len(user['favorites'])
    user['favorites'] = [
        f for f in user['favorites'] 
        if str(f.get('card_id')) != str(card_id)
    ]
    after_count = len(user['favorites'])
    
    if after_count < before_count:
        save_users_data(data)
        return jsonify({"success": True, "message": "已取消收藏"})
    else:
        return jsonify({"success": False, "message": "未找到该收藏"})


# ==================== 搜索系统 ====================

@app.route('/api/search')
def search():
    """搜索词汇"""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"success": False, "message": "请输入搜索关键词"}), 400

    data = load_data()
    results = []
    query_lower = query.lower()

    for card in data.get('vocabulary_cards', []):
        # 在单词、读音、含义、分类、等级中搜索
        word = card.get('word', '')
        reading = card.get('reading', '')
        meaning = card.get('meaning', '')
        category = card.get('category', '')
        level = card.get('level', '')
        
        if (query_lower in word.lower() or
            query_lower in reading.lower() or
            query_lower in meaning.lower() or
            query_lower in category.lower() or
            query_lower in level.lower()):
            results.append({"type": "词汇符卡", "data": card})

    return jsonify({
        "success": True,
        "query": query,
        "results": results,
        "total": len(results)
    })


# ---------- 符卡查询 ----------

@app.route('/api/cards/search')
def search_cards():
    """查询符卡词汇（支持关键词和类型筛选）"""
    query = request.args.get('q', '').strip()
    include_jlpt = request.args.get('jlpt', 'true').lower() == 'true'
    
    data = load_data()
    cards = data.get('vocabulary_cards', [])
    
    results = []
    for card in cards:
        # 如果不包含JLPT，跳过JLPT词汇
        if not include_jlpt and card.get('category') == 'JLPT':
            continue
        
        # 关键词匹配
        if query:
            if (query.lower() in card.get('word', '').lower() or
                query.lower() in card.get('reading', '').lower() or
                query.lower() in card.get('meaning', '').lower() or
                query.lower() in card.get('level', '').lower() or
                query.lower() in card.get('category', '').lower()):
                results.append(card)
        else:
            results.append(card)
    
    return jsonify({
        "success": True,
        "query": query,
        "include_jlpt": include_jlpt,
        "results": results,
        "total": len(results)
    })


@app.route('/api/cards/filtered')
def filtered_cards():
    """根据设置返回过滤后的卡池"""
    include_jlpt = request.args.get('jlpt', 'true').lower() == 'true'
    
    data = load_data()
    cards = data.get('vocabulary_cards', [])
    
    if include_jlpt:
        filtered = cards
    else:
        filtered = [c for c in cards if c.get('category') != 'JLPT']
    
    return jsonify({
        "success": True,
        "total": len(filtered),
        "include_jlpt": include_jlpt
    })


@app.route('/api/card/random/filtered')
def random_filtered_card():
    """根据设置随机抽取符卡"""
    include_jlpt = request.args.get('jlpt', 'true').lower() == 'true'
    
    data = load_data()
    cards = data.get('vocabulary_cards', [])
    
    if not include_jlpt:
        cards = [c for c in cards if c.get('category') != 'JLPT']
    
    if not cards:
        return jsonify({"success": False, "message": "符卡池为空，请开启JLPT词汇"}), 500
    
    card = random.choice(cards)
    return jsonify({
        "success": True,
        "data": card,
        "message": f"🎴 抽到了 <{card['rarity']}> 级别的言灵！"
    })


@app.route('/api/search/stats')
def search_stats():
    """获取搜索统计信息"""
    data = load_data()
    cards = data.get('vocabulary_cards', [])
    
    stats = {
        "total": len(cards),
        "by_level": {},
        "by_rarity": {},
        "by_category": {}
    }
    
    for card in cards:
        level = card.get('level', '未知')
        rarity = card.get('rarity', '未知')
        category = card.get('category', '其他')
        
        stats["by_level"][level] = stats["by_level"].get(level, 0) + 1
        stats["by_rarity"][rarity] = stats["by_rarity"].get(rarity, 0) + 1
        stats["by_category"][category] = stats["by_category"].get(category, 0) + 1
    
    return jsonify({"success": True, "data": stats})



# ==================== 错误处理 ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"success": False, "message": "此路不通——也许你误入了未开辟的幻想乡区域"}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({"success": False, "message": "结界发生异常波动，请稍后再试"}), 500

# ==================== 启动 ====================

if __name__ == '__main__':
    print("""
╔══════════════════════════════════╗
║   🏮 幻想郷 言霊修行帳  🏮    ║
║  Touhou Japanese Learning API  ║
║  http://127.0.0.1:5000         ║
║  "言灵即是力量"                ║
╚══════════════════════════════════╝
    """)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)