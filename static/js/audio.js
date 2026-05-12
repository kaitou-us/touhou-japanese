const AudioManager = (() => {
    var current = null;
    var victorySFX = null;  // 单独追踪胜利音效

    function stopAll() {
        if (current) { current.pause(); current.currentTime = 0; current = null; }
        if (victorySFX) { victorySFX.pause(); victorySFX.currentTime = 0; victorySFX = null; }
    }

    function play(src, loop, vol) {
        stopAll();
        var a = new Audio(src);
        a.loop = !!loop;
        a.volume = vol || 0.4;
        a.play().catch(function(){});
        current = a;
    }

    function playBGM()    { play('/static/audio/bgm.mp3', true, 0.3); }
    function playBattle(id){ play(id==='yukari'?'/static/audio/battle2.mp3':'/static/audio/battle1.mp3', true, 0.4); }
    function playDamage() { new Audio('/static/audio/damage.mp3').play().catch(function(){}); }
    function playVictory(){ 
        var a = new Audio('/static/audio/victory.mp3');
        a.volume = 0.5;
        a.play().catch(function(){});
        victorySFX = a;
    }

    return { playBGM, playBattleMusic:playBattle, playDamage, playVictory, stopAll };
})();
window.AudioManager = AudioManager;