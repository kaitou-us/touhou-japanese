#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
将所有单词的读音全部用平假名注音
策略：
1. 从 vocab_reading.json 获取「汉字→假名」映射
2. 从 vocab_kanji.json 反向获取「汉字→假名」映射
3. 假名词保留原样
4. 仍未匹配的用内建字典兜底
"""

import json
import re
from pathlib import Path

BASE = Path(__file__).parent
CARDS = BASE / 'data' / 'cards.json'
JLPT = BASE / 'data' / 'JLPT'

# ==================== 内建读音字典（兜底） ====================
FALLBACK = {
    # N1
    "知識": "ちしき", "隠蔽": "いんぺい", "真相": "しんそう", "報酬": "ほうしゅう",
    "傲慢": "ごうまん", "軽蔑": "けいべつ", "過酷": "かこく", "純粋": "じゅんすい",
    "渇望": "かつぼう", "偏見": "へんけん", "局限": "きょくげん", "雑貨": "ざっか",
    "冷蔵": "れいぞう", "油絵": "あぶらえ", "粗筋": "あらすじ", "軍備": "ぐんび",
    "主催": "しゅさい", "不服": "ふふく", "応募": "おうぼ", "横綱": "よこづな",
    "心得": "こころえ", "定年": "ていねん", "武力": "ぶりょく", "開拓": "かいたく",
    "一帯": "いったい", "多様": "たよう", "浮力": "ふりょく", "両立": "りょうりつ",
    "文化財": "ぶんかざい", "登校": "とうこう", "下地": "したじ", "多数決": "たすうけつ",
    "器官": "きかん", "講習": "こうしゅう", "火星": "かせい", "主食": "しゅしょく",
    "残金": "ざんきん", "任務": "にんむ", "降水": "こうすい", "獲物": "えもの",
    "等級": "とうきゅう", "拘束": "こうそく", "交易": "こうえき", "生理": "せいり",
    "喫茶": "きっさ", "錯誤": "さくご", "提供": "ていきょう", "歯磨": "はみがき",
    "電線": "でんせん", "賃金": "ちんぎん", "決議": "けつぎ", "過労": "かろう",
    "名称": "めいしょう", "前例": "ぜんれい", "残酷": "ざんこく", "役職": "やくしょく",
    "所在": "しょざい", "酪農": "らくのう", "平行": "へいこう", "移行": "いこう",
    "発言": "はつげん", "兼用": "けんよう", "始末": "しまつ", "倒産": "とうさん",
    "巧妙": "こうみょう", "謝絶": "しゃぜつ", "分離": "ぶんり", "補足": "ほそく",
    "世帯": "せたい", "弁論": "べんろん", "用件": "ようけん", "破裂": "はれつ",
    "軍事": "ぐんじ", "経路": "けいろ", "運営": "うんえい", "幹部": "かんぶ",
    "弁護": "べんご", "転勤": "てんきん", "勤務": "きんむ", "共産": "きょうさん",
    "風習": "ふうしゅう", "厳密": "げんみつ", "封鎖": "ふうさ", "有益": "ゆうえき",
    "理論": "りろん", "距離": "きょり", "親善": "しんぜん", "農地": "のうち",
    "光熱費": "こうねつひ", "総合": "そうごう", "埋蔵": "まいぞう", "分業": "ぶんぎょう",
    "国交": "こっこう", "創刊": "そうかん", "選挙": "せんきょ", "文書": "ぶんしょ",
    "不可欠": "ふかけつ", "生死": "せいし", "悪化": "あっか", "成果": "せいか",
    "根底": "こんてい", "陰気": "いんき", "憤慨": "ふんがい", "派遣": "はけん",
    "磁気": "じき", "光沢": "こうたく", "静的": "せいてき", "負債": "ふさい",
    "選考": "せんこう", "長大": "ちょうだい", "暗殺": "あんさつ", "君主": "くんしゅ",
    "着目": "ちゃくもく", "個々": "ここ", "花粉": "かふん", "温和": "おんわ",
    "怪獣": "かいじゅう", "武装": "ぶそう", "調停": "ちょうてい", "富豪": "ふごう",
    "城下": "じょうか", "青春": "せいしゅん", "沈没": "ちんぼつ", "忠告": "ちゅうこく",
    "沈黙": "ちんもく", "製法": "せいほう", "成年": "せいねん", "誠実": "せいじつ",
    "忠実": "ちゅうじつ", "貯蓄": "ちょちく", "詳細": "しょうさい", "署名": "しょめい",
    "疾病": "しっぺい", "皆無": "かいむ", "几帳面": "きちょうめん", "清濁": "せいだく",
    "姓名": "せいめい", "更迭": "こうてつ", "老舗": "しにせ", "是非": "ぜひ",
    "起伏": "きふく", "先行": "せんこう", "呆然": "ぼうぜん", "採決": "さいけつ",
    "没収": "ぼっしゅう", "採択": "さいたく", "勧告": "かんこく", "概要": "がいよう",
    "制裁": "せいさい", "独裁": "どくさい", "共鳴": "きょうめい", "反射": "はんしゃ",
    "思考": "しこう", "動機": "どうき", "規範": "きはん", "模範": "もはん",
    "権威": "けんい", "意向": "いこう", "本音": "ほんね", "手法": "しゅほう",
    "良識": "りょうしき", "了解": "りょうかい", "了承": "りょうしょう", "是非": "ぜひ",
    "生涯": "しょうがい", "樹立": "じゅりつ", "樹木": "じゅもく", "樹脂": "じゅし",
    # N2
    "油断": "ゆだん", "素直": "すなお", "我慢": "がまん", "緊張": "きんちょう",
    "複雑": "ふくざつ", "単純": "たんじゅん", "努力": "どりょく", "挑戦": "ちょうせん",
    "成長": "せいちょう", "解決": "かいけつ", "確認": "かくにん", "連絡": "れんらく",
    "予定": "よてい", "突然": "とつぜん", "冷静": "れいせい", "貴重": "きちょう",
    "協力": "きょうりょく", "変更": "へんこう", "確実": "かくじつ", "深刻": "しんこく",
    "豊富": "ほうふ", "快適": "かいてき", "順調": "じゅんちょう", "贅沢": "ぜいたく",
    "矛盾": "むじゅん", "妥協": "だきょう", "具体的": "ぐたいてき", "積極的": "せっきょくてき",
    "消極的": "しょうきょくてき",
    # N3
    "記憶": "きおく", "想像": "そうぞう", "感動": "かんどう", "安心": "あんしん",
    "心配": "しんぱい", "約束": "やくそく", "準備": "じゅんび", "説明": "せつめい",
    "発見": "はっけん", "理解": "りかい", "経験": "けいけん", "成功": "せいこう",
    "失敗": "しっぱい", "希望": "きぼう", "尊敬": "そんけい", "夢中": "むちゅう",
    "仲間": "なかま", "感心": "かんしん",
    # N4/N5
    "学校": "がっこう", "先生": "せんせい", "学生": "がくせい", "友達": "ともだち",
    "家族": "かぞく", "食べ物": "たべもの", "飲み物": "のみもの", "図書館": "としょかん",
    "公園": "こうえん", "駅": "えき", "病院": "びょういん", "電話": "でんわ",
    "手紙": "てがみ", "買い物": "かいもの", "勉強": "べんきょう", "料理": "りょうり",
    "天気": "てんき", "旅行": "りょこう", "音楽": "おんがく", "映画": "えいが",
    "仕事": "しごと", "生活": "せいかつ", "練習": "れんしゅう", "健康": "けんこう",
    "誕生日": "たんじょうび", "掃除": "そうじ", "洗濯": "せんたく", "昼寝": "ひるね",
    "卒業": "そつぎょう", "入学": "にゅうがく", "試験": "しけん", "合格": "ごうかく",
    "趣味": "しゅみ", "散歩": "さんぽ", "食事": "しょくじ", "宿題": "しゅくだい",
    "手伝い": "てつだい",
}


def is_kana(s):
    """判断字符串是否全是假名"""
    return all(('\u3040' <= ch <= '\u309f') or ('\u30a0' <= ch <= '\u30ff') or ch in 'ー・'
               for ch in s)


def has_kanji(s):
    """判断字符串是否包含汉字"""
    return any('\u4e00' <= ch <= '\u9fff' for ch in s)


def extract_readings_from_reading_json():
    """从 vocab_reading.json 提取「汉字→假名」"""
    mapping = {}
    for lvl in ['N1', 'N2', 'N3', 'N4', 'N5']:
        f = JLPT / lvl / 'vocab_reading.json'
        if not f.exists():
            continue
        for q in json.loads(f.read_text(encoding='utf-8')).get('questions', []):
            target = q['target'].strip()
            opts = q.get('options', [])
            aidx = q.get('answer', 0)
            if opts and 0 <= aidx < len(opts) and has_kanji(target):
                if target not in mapping:
                    mapping[target] = opts[aidx]
    return mapping


def extract_readings_from_kanji_json():
    """从 vocab_kanji.json 反向提取「汉字→假名」"""
    mapping = {}
    for lvl in ['N1', 'N2', 'N3', 'N4', 'N5']:
        f = JLPT / lvl / 'vocab_kanji.json'
        if not f.exists():
            continue
        for q in json.loads(f.read_text(encoding='utf-8')).get('questions', []):
            target = q['target'].strip()  # 这是假名
            opts = q.get('options', [])
            aidx = q.get('answer', 0)
            if opts and 0 <= aidx < len(opts) and is_kana(target):
                kanji_word = opts[aidx]
                if has_kanji(kanji_word) and kanji_word not in mapping:
                    mapping[kanji_word] = target
    return mapping


def main():
    print('🔧 全部平假名注音')
    print('=' * 50)

    # 1. 构建完整读音映射
    all_readings = {}

    # 从 vocab_reading.json
    r1 = extract_readings_from_reading_json()
    all_readings.update(r1)
    print(f'✅ vocab_reading.json: {len(r1)} 个')

    # 从 vocab_kanji.json
    r2 = extract_readings_from_kanji_json()
    for k, v in r2.items():
        if k not in all_readings:
            all_readings[k] = v
    print(f'✅ vocab_kanji.json: {len(r2)} 个（新增）')

    # 内建字典
    for k, v in FALLBACK.items():
        if k not in all_readings:
            all_readings[k] = v
    print(f'✅ 内建字典: {len(FALLBACK)} 个')
    print(f'✅ 总映射: {len(all_readings)} 个')

    # 2. 更新 cards.json
    cards_data = json.loads(CARDS.read_text(encoding='utf-8'))
    fixed = 0

    for card in cards_data['vocabulary_cards']:
        word = card['word'].strip()
        old_reading = card.get('reading', '')

        # 如果是假名词，reading = word 即可
        if is_kana(word):
            card['reading'] = word
            continue

        # 汉字词，找假名读音
        if word in all_readings:
            new_reading = all_readings[word]
            if new_reading != old_reading:
                card['reading'] = new_reading
                fixed += 1

    # 3. 保存
    CARDS.write_text(json.dumps(cards_data, ensure_ascii=False, indent=2), encoding='utf-8')

    # 4. 统计
    total = len(cards_data['vocabulary_cards'])
    has_kanji_in_reading = sum(1 for c in cards_data['vocabulary_cards']
                                if has_kanji(c.get('reading', '')))

    print(f'\n📊 结果:')
    print(f'  词汇总数: {total}')
    print(f'  本次修复: {fixed}')
    print(f'  读音含汉字: {has_kanji_in_reading}')

    if has_kanji_in_reading > 0:
        print(f'\n⚠️  仍含汉字的读音:')
        for c in cards_data['vocabulary_cards']:
            if has_kanji(c.get('reading', '')):
                print(f'    {c["word"]} → {c["reading"]}')
                has_kanji_in_reading -= 1
                if has_kanji_in_reading == 0:
                    break

    print(f'\n✅ 完成！')


if __name__ == '__main__':
    main()