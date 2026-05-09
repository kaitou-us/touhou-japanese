#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 JLPT JSON 文件中提取读音，同步到 cards.json
直接从 vocab_reading.json 等文件的 options[answer] 获取正确读音
"""

import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
JLPT_DIR = BASE_DIR / 'data' / 'JLPT'
CARDS_FILE = BASE_DIR / 'data' / 'cards.json'


def extract_readings_from_jlpt():
    """从 JLPT 文件夹中提取所有单词的读音"""
    readings = {}
    
    for level in ['N1', 'N2', 'N3', 'N4', 'N5']:
        folder = JLPT_DIR / level
        if not folder.exists():
            continue
        
        for json_file in folder.glob('*.json'):
            try:
                with open(json_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            except:
                continue
            
            questions = data.get('questions', [])
            for q in questions:
                target = q.get('target', '').strip()
                if not target or target in readings:
                    continue
                
                answer_idx = q.get('answer', 0)
                options = q.get('options', [])
                
                # 从选项中获取正确读音
                if options and 0 <= answer_idx < len(options):
                    correct_reading = options[answer_idx]
                    
                    # 清理读音（去掉干扰项后缀）
                    # 有些选项带 "い" "お" 后缀作为干扰
                    readings[target] = correct_reading
    
    return readings


def main():
    print('📝 从 JLPT JSON 同步读音')
    print('=' * 60)
    
    # 1. 提取读音
    print('📂 扫描 JLPT 文件...')
    readings = extract_readings_from_jlpt()
    print(f'✅ 提取到 {len(readings)} 个读音')
    
    # 2. 加载 cards.json
    print(f'\n📖 加载 {CARDS_FILE}...')
    with open(CARDS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cards = data.get('vocabulary_cards', [])
    
    # 3. 补全读音
    filled = 0
    skipped = 0
    
    for card in cards:
        word = card.get('word', '').strip()
        
        # 已有读音，跳过
        if card.get('reading', '').strip():
            skipped += 1
            continue
        
        # 查找读音
        if word in readings:
            card['reading'] = readings[word]
            filled += 1
    
    # 4. 保存
    with open(CARDS_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 5. 统计
    still_missing = sum(1 for c in cards if not c.get('reading', '').strip())
    
    print(f'\n📊 同步结果:')
    print(f'  词汇总量: {len(cards)}')
    print(f'  已有读音: {skipped}')
    print(f'  本次补全: {filled}')
    print(f'  仍缺读音: {still_missing}')
    
    if still_missing > 0:
        print(f'\n⚠️  仍有 {still_missing} 个词汇缺少读音')
        print('  示例:')
        for c in cards:
            if not c.get('reading', '').strip():
                print(f'    - {c["word"]}')
                still_missing -= 1
                if still_missing == 0:
                    break
    
    print(f'\n✅ 完成！')


if __name__ == '__main__':
    main()