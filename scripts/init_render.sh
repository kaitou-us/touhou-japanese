#!/bin/bash
# Render 部署初始化脚本

echo "🏮 幻想乡初始化..."

# 如果 users.json 不存在，创建一个带默认角色池的
if [ ! -f /opt/render/project/src/data/users.json ]; then
    echo '{"character_pool":[{"id":"reimu","name":"博麗霊夢","title":"楽園の素敵な巫女","rarity":"SSR","emoji":"🧙‍♀️","color":"#e74c3c","description":"博丽神社的巫女","starter_card":"霊符「夢想封印」","starter_currency":{"靈珠":120,"賽錢":300,"信仰ポイント":80}},{"id":"marisa","name":"霧雨魔理沙","title":"普通の魔法使い","rarity":"SSR","emoji":"🧹","color":"#f39c12","description":"普通的魔法使","starter_card":"恋符「マスタースパーク」","starter_currency":{"靈珠":100,"賽錢":250,"信仰ポイント":60}},{"id":"cirno","name":"チルノ","title":"湖上の氷精","rarity":"R","emoji":"❄️","color":"#00bcd4","description":"雾之湖的冰之妖精","starter_card":"氷符「アイシクルフォール」","starter_currency":{"靈珠":30,"賽錢":100,"信仰ポイント":15}}],"users":{}}' > /opt/render/project/src/data/users.json
    echo "✅ 创建默认 users.json"
else
    echo "✅ users.json 已存在，跳过初始化"
fi