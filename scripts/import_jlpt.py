#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JLPT 词汇导入脚本
从内建词库导入 N1-N5 词汇到 cards.json
"""

import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CARDS_FILE = BASE_DIR / 'data' / 'cards.json'

# ==================== 完整 N1-N5 词汇库 ====================

JLPT_WORDS = {
    "N1": [
        {"word": "抽象的", "reading": "ちゅうしょうてき", "meaning": "抽象的"},
        {"word": "曖昧", "reading": "あいまい", "meaning": "暧昧，模糊"},
        {"word": "飽和", "reading": "ほうわ", "meaning": "饱和"},
        {"word": "打開", "reading": "だかい", "meaning": "打开，打破局面"},
        {"word": "頻繁", "reading": "ひんぱん", "meaning": "频繁"},
        {"word": "懸念", "reading": "けねん", "meaning": "担心，忧虑"},
        {"word": "錯覚", "reading": "さっかく", "meaning": "错觉"},
        {"word": "執着", "reading": "しゅうちゃく", "meaning": "执着，贪恋"},
        {"word": "奔放", "reading": "ほんぽう", "meaning": "奔放，豪放"},
        {"word": "葛藤", "reading": "かっとう", "meaning": "纠葛，内心矛盾"},
        {"word": "繁栄", "reading": "はんえい", "meaning": "繁荣"},
        {"word": "没落", "reading": "ぼつらく", "meaning": "没落，衰败"},
        {"word": "普遍", "reading": "ふへん", "meaning": "普遍"},
        {"word": "啓発", "reading": "けいはつ", "meaning": "启发，启迪"},
        {"word": "窮地", "reading": "きゅうち", "meaning": "困境，绝境"},
        {"word": "傑出", "reading": "けっしゅつ", "meaning": "杰出"},
        {"word": "克明", "reading": "こくめい", "meaning": "细致，详细"},
        {"word": "是正", "reading": "ぜせい", "meaning": "纠正，改正"},
        {"word": "低迷", "reading": "ていめい", "meaning": "低迷，不景气"},
        {"word": "迫真", "reading": "はくしん", "meaning": "逼真"},
        {"word": "錯綜", "reading": "さくそう", "meaning": "错综复杂"},
        {"word": "耽溺", "reading": "たんでき", "meaning": "沉溺，沉迷"},
        {"word": "逡巡", "reading": "しゅんじゅん", "meaning": "逡巡，犹豫不决"},
        {"word": "蹂躙", "reading": "じゅうりん", "meaning": "蹂躏，践踏"},
        {"word": "刹那", "reading": "せつな", "meaning": "刹那，瞬间"},
        {"word": "陶冶", "reading": "とうや", "meaning": "陶冶，培养"},
        {"word": "淘汰", "reading": "とうた", "meaning": "淘汰"},
        {"word": "発露", "reading": "はつろ", "meaning": "表露，显露"},
        {"word": "福音", "reading": "ふくいん", "meaning": "福音，好消息"},
        {"word": "包括的", "reading": "ほうかつてき", "meaning": "全面的，包括的"},
    ],
    "N2": [
        {"word": "油断", "reading": "ゆだん", "meaning": "疏忽，大意"},
        {"word": "素直", "reading": "すなお", "meaning": "坦率，老实"},
        {"word": "無理", "reading": "むり", "meaning": "无理，勉强"},
        {"word": "我慢", "reading": "がまん", "meaning": "忍耐"},
        {"word": "緊張", "reading": "きんちょう", "meaning": "紧张"},
        {"word": "複雑", "reading": "ふくざつ", "meaning": "复杂"},
        {"word": "単純", "reading": "たんじゅん", "meaning": "单纯"},
        {"word": "積極的", "reading": "せっきょくてき", "meaning": "积极的"},
        {"word": "消極的", "reading": "しょうきょくてき", "meaning": "消极的"},
        {"word": "具体的", "reading": "ぐたいてき", "meaning": "具体的"},
        {"word": "努力", "reading": "どりょく", "meaning": "努力"},
        {"word": "協力", "reading": "きょうりょく", "meaning": "协力，合作"},
        {"word": "挑戦", "reading": "ちょうせん", "meaning": "挑战"},
        {"word": "成長", "reading": "せいちょう", "meaning": "成长"},
        {"word": "解決", "reading": "かいけつ", "meaning": "解决"},
        {"word": "確認", "reading": "かくにん", "meaning": "确认"},
        {"word": "連絡", "reading": "れんらく", "meaning": "联络，联系"},
        {"word": "予定", "reading": "よてい", "meaning": "预定，计划"},
        {"word": "変更", "reading": "へんこう", "meaning": "变更，改变"},
        {"word": "突然", "reading": "とつぜん", "meaning": "突然"},
        {"word": "確実", "reading": "かくじつ", "meaning": "确实，可靠"},
        {"word": "冷静", "reading": "れいせい", "meaning": "冷静"},
        {"word": "深刻", "reading": "しんこく", "meaning": "深刻，严重"},
        {"word": "豊富", "reading": "ほうふ", "meaning": "丰富"},
        {"word": "貴重", "reading": "きちょう", "meaning": "贵重，珍贵"},
        {"word": "快適", "reading": "かいてき", "meaning": "舒适"},
        {"word": "順調", "reading": "じゅんちょう", "meaning": "顺利"},
        {"word": "贅沢", "reading": "ぜいたく", "meaning": "奢侈，奢华"},
        {"word": "矛盾", "reading": "むじゅん", "meaning": "矛盾"},
        {"word": "妥協", "reading": "だきょう", "meaning": "妥协"},
    ],
    "N3": [
        {"word": "記憶", "reading": "きおく", "meaning": "记忆"},
        {"word": "想像", "reading": "そうぞう", "meaning": "想象"},
        {"word": "感動", "reading": "かんどう", "meaning": "感动"},
        {"word": "安心", "reading": "あんしん", "meaning": "安心，放心"},
        {"word": "心配", "reading": "しんぱい", "meaning": "担心，忧虑"},
        {"word": "約束", "reading": "やくそく", "meaning": "约定"},
        {"word": "準備", "reading": "じゅんび", "meaning": "准备"},
        {"word": "説明", "reading": "せつめい", "meaning": "说明"},
        {"word": "発見", "reading": "はっけん", "meaning": "发现"},
        {"word": "理解", "reading": "りかい", "meaning": "理解"},
        {"word": "経験", "reading": "けいけん", "meaning": "经验"},
        {"word": "成功", "reading": "せいこう", "meaning": "成功"},
        {"word": "失敗", "reading": "しっぱい", "meaning": "失败"},
        {"word": "希望", "reading": "きぼう", "meaning": "希望"},
        {"word": "夢中", "reading": "むちゅう", "meaning": "热衷，沉迷"},
        {"word": "仲間", "reading": "なかま", "meaning": "伙伴，同伴"},
        {"word": "我慢", "reading": "がまん", "meaning": "忍耐"},
        {"word": "尊敬", "reading": "そんけい", "meaning": "尊敬"},
        {"word": "感心", "reading": "かんしん", "meaning": "佩服，钦佩"},
    ],
    "N4": [
        {"word": "卒業", "reading": "そつぎょう", "meaning": "毕业"},
        {"word": "入学", "reading": "にゅうがく", "meaning": "入学"},
        {"word": "試験", "reading": "しけん", "meaning": "考试"},
        {"word": "合格", "reading": "ごうかく", "meaning": "合格，及格"},
        {"word": "生活", "reading": "せいかつ", "meaning": "生活"},
        {"word": "仕事", "reading": "しごと", "meaning": "工作"},
        {"word": "旅行", "reading": "りょこう", "meaning": "旅行"},
        {"word": "料理", "reading": "りょうり", "meaning": "料理，烹饪"},
        {"word": "音楽", "reading": "おんがく", "meaning": "音乐"},
        {"word": "映画", "reading": "えいが", "meaning": "电影"},
        {"word": "天気", "reading": "てんき", "meaning": "天气"},
        {"word": "練習", "reading": "れんしゅう", "meaning": "练习"},
        {"word": "勉強", "reading": "べんきょう", "meaning": "学习"},
        {"word": "健康", "reading": "けんこう", "meaning": "健康"},
        {"word": "趣味", "reading": "しゅみ", "meaning": "爱好，兴趣"},
        {"word": "散歩", "reading": "さんぽ", "meaning": "散步"},
        {"word": "買い物", "reading": "かいもの", "meaning": "购物"},
        {"word": "食事", "reading": "しょくじ", "meaning": "吃饭，用餐"},
        {"word": "宿題", "reading": "しゅくだい", "meaning": "作业"},
        {"word": "手伝い", "reading": "てつだい", "meaning": "帮忙，帮助"},
    ],
    "N5": [
        {"word": "学校", "reading": "がっこう", "meaning": "学校"},
        {"word": "先生", "reading": "せんせい", "meaning": "老师"},
        {"word": "学生", "reading": "がくせい", "meaning": "学生"},
        {"word": "友達", "reading": "ともだち", "meaning": "朋友"},
        {"word": "家族", "reading": "かぞく", "meaning": "家人，家族"},
        {"word": "食べ物", "reading": "たべもの", "meaning": "食物"},
        {"word": "飲み物", "reading": "のみもの", "meaning": "饮料"},
        {"word": "図書館", "reading": "としょかん", "meaning": "图书馆"},
        {"word": "公園", "reading": "こうえん", "meaning": "公园"},
        {"word": "駅", "reading": "えき", "meaning": "车站"},
        {"word": "病院", "reading": "びょういん", "meaning": "医院"},
        {"word": "電話", "reading": "でんわ", "meaning": "电话"},
        {"word": "手紙", "reading": "てがみ", "meaning": "信"},
        {"word": "買い物", "reading": "かいもの", "meaning": "购物"},
        {"word": "料理", "reading": "りょうり", "meaning": "料理，做菜"},
        {"word": "掃除", "reading": "そうじ", "meaning": "打扫"},
        {"word": "洗濯", "reading": "せんたく", "meaning": "洗衣服"},
        {"word": "昼寝", "reading": "ひるね", "meaning": "午睡"},
        {"word": "誕生日", "reading": "たんじょうび", "meaning": "生日"},
        {"word": "天気", "reading": "てんき", "meaning": "天气"},
    ],
}

# 稀有度分配权重
RARITY_WEIGHTS = {
    'N1': {'SSR': 0.20, 'SR': 0.35, 'R': 0.45},
    'N2': {'SSR': 0.12, 'SR': 0.30, 'R': 0.58},
    'N3': {'SSR': 0.08, 'SR': 0.25, 'R': 0.67},
    'N4': {'SSR': 0.04, 'SR': 0.18, 'R': 0.78},
    'N5': {'SSR': 0.02, 'SR': 0.10, 'R': 0.88},
}

# 例句模板
EXAMPLE_TEMPLATES = [
    ("{word}について勉強しています。", "正在学习关于{meaning}的知识。"),
    ("{word}はとても大切です。", "{meaning}是非常重要的。"),
    ("毎日{word}を覚えています。", "每天都在记{meaning}。"),
    ("{word}の意味を調べました。", "查了{meaning}的意思。"),
    ("先生が{word}を説明しました。", "老师解释了{meaning}。"),
]


def assign_rarity(level):
    """根据等级分配稀有度"""
    weights = RARITY_WEIGHTS.get(level, {'SSR': 0.05, 'SR': 0.20, 'R': 0.75})
    r = random.random()
    if r < weights['SSR']:
        return 'SSR'
    elif r < weights['SSR'] + weights['SR']:
        return 'SR'
    else:
        return 'R'


def generate_example(word, meaning):
    """生成例句"""
    template_jp, template_cn = random.choice(EXAMPLE_TEMPLATES)
    return template_jp.format(word=word, meaning=meaning), template_cn.format(word=word, meaning=meaning)


def classify_word(word, meaning):
    """自动分类"""
    categories = {
        '抽象概念': ['的', '性', '化', '概念', '理論', '思想'],
        '人际关系': ['人', '友', '家族', '親', '仲間', '恋', '愛'],
        '日常生活': ['食', '飲', '買', '売', '住', '着', '旅行', '料理'],
        '学习工作': ['勉強', '試験', '仕事', '研究', '練習', '学校'],
        '情感心理': ['感', '心', '気', '思', '想', '怒', '楽', '悲'],
        '自然': ['天気', '花', '木', '山', '川', '海', '空'],
    }
    
    combined = word + meaning
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in combined:
                return cat
    return '其他'


def main():
    print('🏮 JLPT 词汇导入工具')
    print('=' * 50)
    
    # 加载现有数据
    try:
        with open(CARDS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {"vocabulary_cards": [], "shop_items": [], "danmaku_exercises": [], 
                "grammar_points": [], "culture_points": []}
    
    existing_words = {card['word'] for card in data.get('vocabulary_cards', [])}
    max_id = max((card['id'] for card in data.get('vocabulary_cards', [])), default=0)
    
    total_added = 0
    stats = {}
    
    for level, words in JLPT_WORDS.items():
        level_added = 0
        for w in words:
            if w['word'] not in existing_words:
                max_id += 1
                example_jp, example_cn = generate_example(w['word'], w['meaning'])
                
                card = {
                    "id": max_id,
                    "word": w['word'],
                    "reading": w['reading'],
                    "meaning": w['meaning'],
                    "rarity": assign_rarity(level),
                    "level": level,
                    "example": example_jp,
                    "example_reading": example_cn,
                    "category": classify_word(w['word'], w['meaning'])
                }
                
                data['vocabulary_cards'].append(card)
                existing_words.add(w['word'])
                level_added += 1
                total_added += 1
        
        stats[level] = level_added
    
    # 保存
    with open(CARDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 输出统计
    print(f'\n📊 导入结果:')
    print(f'  原有词汇: {len(data["vocabulary_cards"]) - total_added} 个')
    for level in ['N1', 'N2', 'N3', 'N4', 'N5']:
        print(f'  新增{level}: {stats.get(level, 0)} 个')
    print(f'  总计新增: {total_added} 个')
    print(f'  词汇总数: {len(data["vocabulary_cards"])} 个')
    
    # 统计稀有度分布
    rarity_count = {'SSR': 0, 'SR': 0, 'R': 0}
    for card in data['vocabulary_cards']:
        rarity_count[card['rarity']] = rarity_count.get(card['rarity'], 0) + 1
    print(f'\n  稀有度分布:')
    print(f'    SSR: {rarity_count["SSR"]} 个')
    print(f'    SR:  {rarity_count["SR"]} 个')
    print(f'    R:   {rarity_count["R"]} 个')
    
    print(f'\n✅ 导入完成！文件已保存到: {CARDS_FILE}')


if __name__ == '__main__':
    main()