#!/usr/bin/env python3
"""清理 cards.json 中格式错误的词汇"""
import json
import re
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
CARDS_FILE = BASE_DIR / 'data' / 'cards.json'

def clean_card(card):
    """清理单个卡片数据"""
    # 修复等级
    if 'level' in card:
        card['level'] = card['level'].replace('Nl', 'N1').replace('Nl', 'N1').strip()
        # 确保是有效等级
        if card['level'] not in ['N1', 'N2', 'N3', 'N4', 'N5']:
            card['level'] = 'N3'  # 默认
    
    # 清理 meaning（去掉多余换行和空格）
    if 'meaning' in card:
        meaning = card['meaning']
        # 替换换行为空格
        meaning = meaning.replace('\n', ' ').replace('\r', ' ')
        # 多个空格合并为一个
        meaning = re.sub(r'\s+', ' ', meaning)
        # 去掉首尾空格
        meaning = meaning.strip()
        # 限制长度
        if len(meaning) > 100:
            meaning = meaning[:100] + '...'
        card['meaning'] = meaning
    
    # 清理 word
    if 'word' in card:
        card['word'] = card['word'].strip()
    
    # 清理 reading（如果为空，尝试从 word 推断）
    if 'reading' in card and not card['reading']:
        # 保留空读法，这是正常的（很多单词没有标假名）
        pass
    
    return card


def main():
    print('🧹 清理词汇数据')
    
    with open(CARDS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cards = data.get('vocabulary_cards', [])
    cleaned = []
    seen = set()
    
    for card in cards:
        # 去重
        word = card.get('word', '').strip()
        if not word or word in seen:
            continue
        seen.add(word)
        
        # 清理
        card = clean_card(card)
        cleaned.append(card)
    
    # 重新分配 ID
    for i, card in enumerate(cleaned):
        card['id'] = i + 1
    
    data['vocabulary_cards'] = cleaned
    
    with open(CARDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 统计
    levels = {}
    for c in cleaned:
        lvl = c.get('level', '未知')
        levels[lvl] = levels.get(lvl, 0) + 1
    
    print(f'\n📊 清理结果:')
    print(f'  清理前: {len(cards)} 词')
    print(f'  清理后: {len(cleaned)} 词')
    print(f'  去除重复: {len(cards) - len(cleaned)} 词')
    print(f'\n  等级分布:')
    for lvl in ['N1', 'N2', 'N3', 'N4', 'N5']:
        print(f'    {lvl}: {levels.get(lvl, 0)} 词')
    print(f'\n✅ 清理完成！')


if __name__ == '__main__':
    main()