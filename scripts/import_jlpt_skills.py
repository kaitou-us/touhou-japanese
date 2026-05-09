#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 data/JLPT/N1~N5/ 导入 JLPT 词汇到 cards.json
数据格式: {"questions": [{"target": "知識", "sentence": "...", ...}]}
"""

import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
JLPT_DIR = BASE_DIR / 'data' / 'JLPT'
CARDS_FILE = BASE_DIR / 'data' / 'cards.json'

EXAMPLE_TEMPLATES = [
    ("{word}について勉強しています。", "正在学习「{word}」。"),
    ("{word}は大切な言葉です。", "「{word}」是很重要的词汇。"),
    ("毎日{word}を練習します。", "每天练习「{word}」。"),
]

RARITY_WEIGHTS = {
    'N1': {'SSR': 0.20, 'SR': 0.35, 'R': 0.45},
    'N2': {'SSR': 0.12, 'SR': 0.30, 'R': 0.58},
    'N3': {'SSR': 0.08, 'SR': 0.25, 'R': 0.67},
    'N4': {'SSR': 0.04, 'SR': 0.18, 'R': 0.78},
    'N5': {'SSR': 0.01, 'SR': 0.10, 'R': 0.89},
}


def assign_rarity(level):
    weights = RARITY_WEIGHTS.get(level, {'SSR': 0.05, 'SR': 0.15, 'R': 0.80})
    r = random.random()
    if r < weights['SSR']: return 'SSR'
    elif r < weights['SSR'] + weights['SR']: return 'SR'
    return 'R'


def extract_words_from_file(filepath, level):
    """从单个 JSON 文件中提取词汇"""
    words = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        return words
    
    # 主要数据在 questions 数组中
    questions = data.get('questions', [])
    
    for q in questions:
        if not isinstance(q, dict):
            continue
        
        target = q.get('target', '')
        sentence = q.get('sentence', '')
        explanation = q.get('explanation', '')
        
        if not target:
            continue
        
        # 从解释中提取含义
        meaning = ''
        if explanation:
            # 取「」中的内容作为含义
            if '「' in explanation and '」' in explanation:
                start = explanation.index('「') + 1
                end = explanation.index('」')
                meaning = explanation[start:end]
            # 或者取"意味："后面的内容
            elif '意味：' in explanation:
                meaning = explanation.split('意味：')[1].split('\n')[0].split('。')[0]
            # 或者取最后一段
            else:
                meaning = explanation.split('。')[0]
        
        if meaning:
            words.append({
                "word": target,
                "reading": "",
                "meaning": meaning,
                "level": level,
                "sentence": sentence
            })
    
    return words


def main():
    print('🏮 JLPT 词汇导入工具')
    print(f'📂 源目录: {JLPT_DIR}')
    print('=' * 60)
    
    if not JLPT_DIR.exists():
        print(f'❌ 目录不存在: {JLPT_DIR}')
        return
    
    # 加载现有数据
    try:
        with open(CARDS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except:
        data = {"vocabulary_cards": [], "shop_items": [], "danmaku_exercises": [], 
                "grammar_points": [], "culture_points": []}
    
    existing_words = {c['word'] for c in data.get('vocabulary_cards', [])}
    max_id = max((c['id'] for c in data.get('vocabulary_cards', [])), default=0)
    
    total_added = 0
    
    for level in ['N1', 'N2', 'N3', 'N4', 'N5']:
        folder = JLPT_DIR / level
        if not folder.exists():
            print(f'\n⚠️  {level}/ 文件夹不存在，跳过')
            continue
        
        json_files = list(folder.glob('*.json'))
        if not json_files:
            print(f'\n⚠️  {level}/ 中无 JSON 文件，跳过')
            continue
        
        print(f'\n🔄 处理 {level}/ ({len(json_files)} 个文件)...')
        level_added = 0
        
        for filepath in json_files:
            words = extract_words_from_file(filepath, level)
            file_added = 0
            
            for w in words:
                if w['word'] not in existing_words and w['word'].strip():
                    max_id += 1
                    rarity = assign_rarity(level)
                    example_jp, example_cn = random.choice(EXAMPLE_TEMPLATES)
                    
                    card = {
                        "id": max_id,
                        "word": w['word'],
                        "reading": w.get('reading', ''),
                        "meaning": w['meaning'],
                        "rarity": rarity,
                        "level": level,
                        "example": example_jp.format(word=w['word']),
                        "example_reading": example_cn.format(word=w['word']),
                        "category": "JLPT"
                    }
                    
                    data['vocabulary_cards'].append(card)
                    existing_words.add(w['word'])
                    file_added += 1
                    level_added += 1
            
            if file_added > 0:
                print(f'    {filepath.name}: +{file_added} 词')
        
        total_added += level_added
        print(f'  ✅ {level}: 新增 {level_added} 词')
    
    # 保存
    with open(CARDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f'\n{"=" * 60}')
    print(f'📊 导入完成!')
    print(f'  总计新增: {total_added} 词')
    print(f'  词汇总量: {len(data["vocabulary_cards"])} 词')
    print(f'  文件已保存: {CARDS_FILE}')


if __name__ == '__main__':
    main()