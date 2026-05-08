# -*- coding: utf-8 -*-
"""
幻想郷 言霊修行帳 — Flask 后端
Touhou Project Japanese Learning Platform
"""

import json
import random
from pathlib import Path
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# 加载数据
DATA_FILE = Path(__file__).parent / 'data' / 'cards.json'

def load_data():
    """加载JSON数据文件"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

# ==================== 页面路由 ====================

@app.route('/')
def index():
    """主页面 — 幻想乡入口"""
    return render_template('index.html')


# ==================== API 路由 ====================

@app.route('/api/panels')
def get_panels():
    """获取六大板块信息"""
    panels = [
        {
            "id": 1,
            "icon": "🈶",
            "number": "其の壹",
            "title": "词汇符卡 — 言灵収集",
            "endpoint": "/api/card/random",
            "description": "收集散落的言灵，构建你的专属词汇库",
            "featured": False
        },
        {
            "id": 2,
            "icon": "⚔️",
            "number": "其の弐",
            "title": "符卡对决 — 宣告之战",
            "endpoint": "/api/duel",
            "description": "言灵即是力量。抽出符卡，大声读出单词",
            "featured": False
        },
        {
            "id": 3,
            "icon": "🏮",
            "number": "其の参",
            "title": "河童杂货铺 — 买卖修行",
            "endpoint": "/api/shop",
            "description": "在河童的机械杂货铺里，用日语购物",
            "featured": False
        },
        {
            "id": 4,
            "icon": "🧭",
            "number": "其の四",
            "title": "迷路竹林文法罗盘",
            "endpoint": "/api/grammar",
            "description": "谓语在最后，助词是指针。走出语序竹林",
            "featured": True
        },
        {
            "id": 5,
            "icon": "💥",
            "number": "其の五",
            "title": "弹幕洗练 — 句子重组",
            "endpoint": "/api/danmaku/random",
            "description": "在弹幕地狱中冷静重组语法",
            "featured": False
        },
        {
            "id": 6,
            "icon": "⛩️",
            "number": "其の陸",
            "title": "神社点 — 神话与文化",
            "endpoint": "/api/culture",
            "description": "每一座神社都是一部活着的古事记",
            "featured": False
        }
    ]
    return jsonify({"success": True, "data": panels})


# ---------- 1. 词汇符卡 ----------

@app.route('/api/card/random')
def random_card():
    """随机抽取一张词汇符卡"""
    data = load_data()
    card = random.choice(data['vocabulary_cards'])
    return jsonify({
        "success": True,
        "data": card,
        "message": f"🎴 抽到了 <{card['rarity']}> 级别的言灵！"
    })


@app.route('/api/cards')
def all_cards():
    """获取所有词汇符卡"""
    data = load_data()
    return jsonify({
        "success": True,
        "data": data['vocabulary_cards'],
        "total": len(data['vocabulary_cards'])
    })


@app.route('/api/card/<int:card_id>')
def get_card(card_id):
    """获取指定ID的符卡"""
    data = load_data()
    card = next((c for c in data['vocabulary_cards'] if c['id'] == card_id), None)
    if card:
        return jsonify({"success": True, "data": card})
    return jsonify({"success": False, "message": "符卡未找到"}), 404


# ---------- 2. 符卡对决 ----------

@app.route('/api/duel', methods=['GET', 'POST'])
def duel():
    """符卡对决"""
    data = load_data()
    if request.method == 'POST':
        # 接收用户宣告的符卡名
        user_input = request.json.get('spell_name', '') if request.is_json else ''
        # 模拟判定
        power = random.randint(100, 999)
        outcome = random.choice([
            "完美发音！对手受到重创！",
            "发音可辨，弹幕互相抵消！",
            "言灵之力觉醒，胜利！"
        ])
        return jsonify({
            "success": True,
            "user_spell": user_input,
            "power": power,
            "outcome": outcome
        })

    # GET 请求：返回对决信息
    duel_info = {
        "player1": {"name": "灵梦", "spell": "霊符「夢想封印」", "emoji": "🧙‍♀️"},
        "player2": {"name": "蕾米莉亚", "spell": "紅符「不夜城レッド」", "emoji": "🧛"},
        "instruction": "请大声宣告你的符卡名称，以灵力震动结界"
    }
    return jsonify({"success": True, "data": duel_info})


# ---------- 3. 河童杂货铺 ----------

@app.route('/api/shop')
def shop():
    """获取杂货铺商品列表"""
    data = load_data()
    return jsonify({
        "success": True,
        "data": data['shop_items'],
        "greeting": "いらっしゃいませ！欢迎光临河童杂货铺！",
        "shopkeeper": "河城荷取"
    })


@app.route('/api/shop/buy', methods=['POST'])
def buy_item():
    """模拟购买商品"""
    item_name = request.json.get('item_name', '')
    if not item_name:
        return jsonify({"success": False, "message": "请指定要购买的商品"}), 400

    responses = [
        f"「{item_name}」をください！— 好的，这是您的{item_name}！",
        f"ありがとうございます！{item_name}一共XXX円。",
        f"感谢惠顾！{item_name}请收好~"
    ]
    return jsonify({
        "success": True,
        "message": random.choice(responses),
        "item": item_name
    })


# ---------- 4. 文法罗盘 ----------

@app.route('/api/grammar')
def grammar():
    """获取语法知识点"""
    data = load_data()
    return jsonify({
        "success": True,
        "data": data['grammar_points'],
        "compass_口诀": "主语 → は/が → 宾语 → を → 谓语(永远在最后!)"
    })


# ---------- 5. 弹幕洗练 ----------

@app.route('/api/danmaku/random')
def random_danmaku():
    """获取随机弹幕洗练题目"""
    data = load_data()
    exercise = random.choice(data['danmaku_exercises'])
    # 打乱词序
    shuffled = exercise['words'][:]
    random.shuffle(shuffled)
    return jsonify({
        "success": True,
        "data": {
            "id": exercise['id'],
            "shuffled_words": shuffled,
            "meaning": exercise['meaning']
        }
    })


@app.route('/api/danmaku/check', methods=['POST'])
def check_danmaku():
    """检查弹幕洗练答案"""
    user_order = request.json.get('answer', [])
    exercise_id = request.json.get('exercise_id', 1)

    data = load_data()
    exercise = next((e for e in data['danmaku_exercises'] if e['id'] == exercise_id), None)

    if not exercise:
        return jsonify({"success": False, "message": "题目未找到"}), 404

    is_correct = user_order == exercise['correct_order']

    if is_correct:
        message = f"🎉 洗练成功！弹幕化作笔直的光束——{' '.join(exercise['correct_order'])}（{exercise['meaning']}）"
    else:
        message = f"💢 弹幕暴走！正确语序应为：{' '.join(exercise['correct_order'])}"

    return jsonify({
        "success": True,
        "is_correct": is_correct,
        "message": message,
        "correct_order": exercise['correct_order']
    })


@app.route('/api/danmaku/exercises')
def all_exercises():
    """获取所有弹幕洗练题目"""
    data = load_data()
    return jsonify({
        "success": True,
        "data": data['danmaku_exercises']
    })


# ---------- 6. 神社文化 ----------

@app.route('/api/culture')
def culture():
    """获取神社文化信息"""
    data = load_data()
    return jsonify({
        "success": True,
        "data": data['culture_points'],
        "shrine_name": "博麗神社",
        "blessing": "愿幻想乡的众神保佑你。"
    })


# ---------- 综合搜索 ----------

@app.route('/api/search')
def search():
    """搜索词汇"""
    query = request.args.get('q', '').strip()
    if not query:
        return jsonify({"success": False, "message": "请输入搜索关键词"}), 400

    data = load_data()
    results = []

    # 在词汇卡中搜索
    for card in data['vocabulary_cards']:
        if (query in card['word'] or
            query in card['reading'] or
            query in card['meaning'] or
            query in card['category']):
            results.append({"type": "词汇符卡", "data": card})

    return jsonify({
        "success": True,
        "query": query,
        "results": results,
        "total": len(results)
    })


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
    app.run(debug=True, host='0.0.0.0', port=5000)