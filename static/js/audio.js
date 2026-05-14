const AudioManager = (() => {
    var bgm = null;
    var battle1 = null;
    var battle2 = null;
    var damage = null;
    var victory = null;
    var current = null;
    var ending = null;

    function stopAll() {
        if (current) { current.pause(); current.currentTime = 0; current = null; }
    }

    function playBGM() {
        if (!bgm) { bgm = new Audio('/static/audio/bgm.mp3'); bgm.loop = true; bgm.volume = 0.3; }
        stopAll(); bgm.currentTime = 0; bgm.play().catch(function(){}); current = bgm;
    }

    function playBattle(id) {
        var src = id === 'yukari' ? '/static/audio/battle2.mp3' : '/static/audio/battle1.mp3';
        var a = new Audio(src); a.loop = true; a.volume = 0.4;
        stopAll(); a.play().catch(function(){}); current = a;
    }

    function playDamage() { var a = new Audio('/static/audio/damage.mp3'); a.volume = 0.5; a.play().catch(function(){}); }

    function playVictory() { stopAll(); var a = new Audio('/static/audio/victory.mp3'); a.volume = 0.5; a.play().catch(function(){}); }

    function playVoice(cid) { var a = new Audio('/static/audio/voices/' + cid + '.m4a'); a.volume = 0.6; a.play().catch(function(){}); }

    function playEndingBGM() {
        if (!ending) { ending = new Audio('/static/audio/ending.mp3'); ending.loop = false; ending.volume = 0.5; }
        stopAll();
        ending.currentTime = 0;
        ending.play().catch(function(){});
        current = ending;
    }


    return { playBGM, playBattleMusic: playBattle, playDamage, playVictory, stopAll, playVoice, playEndingBGM};
})();
window.AudioManager = AudioManager;