#!/usr/bin/env python3
"""从 vocab_reading.json 导入带读音的单词到 cards.json"""
import json
import random
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
JLPT_DIR = BASE_DIR / 'data' / 'JLPT'
CARDS_FILE = BASE_DIR / 'data' / 'cards.json'

def main():
    print('📥 导入带读音的 JLPT 单词')
    print('=' * 50)
    
    # 1. 收集所有带读音的单词
    all_words = []
    
    for level in ['N1', 'N2', 'N3', 'N4', 'N5']:
        folder = JLPT_DIR / level
        if not folder.exists():
            continue
        
        # 优先用 vocab_reading.json
        reading_file = folder / 'vocab_reading.json'
        if not reading_file.exists():
            continue
        
        data = json.loads(reading_file.read_text(encoding='utf-8'))
        
        for q in data.get('questions', []):
            target = q.get('target', '').strip()
            if not target:
                continue
            
            options = q.get('options', [])
            answer_idx = q.get('answer', 0)
            reading = options[answer_idx] if options and 0 <= answer_idx < len(options) else ''
            sentence = q.get('sentence', '')
            
            all_words.append({
                "word": target,
                "reading": reading,
                "level": level,
                "sentence": sentence
            })
    
    print(f'✅ 收集到 {len(all_words)} 个带读音的单词')
    
    # 2. 加载现有 cards.json
    cards_data = json.loads(CARDS_FILE.read_text(encoding='utf-8'))
    existing_words = {c['word'] for c in cards_data.get('vocabulary_cards', [])}
    max_id = max((c['id'] for c in cards_data.get('vocabulary_cards', [])), default=0)
    
    # 3. 去重后导入
    added = 0
    for w in all_words:
        if w['word'] in existing_words:
            continue
        
        max_id += 1
        rarity = random.choices(['SSR', 'SR', 'R'], weights=[0.1, 0.3, 0.6])[0]
        
        cards_data['vocabulary_cards'].append({
            "id": max_id,
            "word": w['word'],
            "reading": w['reading'],
            "meaning": '',  # 含义后面再补
            "rarity": rarity,
            "level": w['level'],
            "example": w['sentence'],
            "example_reading": '',
            "category": "JLPT"
        })
        existing_words.add(w['word'])
        added += 1
    
    # 4. 保存
    CARDS_FILE.write_text(json.dumps(cards_data, ensure_ascii=False, indent=2), encoding='utf-8')
    
    print(f'📊 导入结果:')
    print(f'  原有单词: {len(cards_data["vocabulary_cards"]) - added}')
    print(f'  新增带读音单词: {added}')
    print(f'  总计: {len(cards_data["vocabulary_cards"])}')
    print('\n✅ 完成！现在抽取的每张符卡都会显示读音')

if __name__ == '__main__':
    main()