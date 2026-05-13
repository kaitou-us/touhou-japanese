const AudioManager = (() => {
    var bgm = new Audio('/static/audio/bgm.mp3');
    bgm.loop = true; bgm.volume = 0.3;
    
    var battle1 = new Audio('/static/audio/battle1.mp3');
    battle1.loop = true; battle1.volume = 0.4;
    
    var battle2 = new Audio('/static/audio/battle2.mp3');
    battle2.loop = true; battle2.volume = 0.4;
    
    var damage = new Audio('/static/audio/damage.mp3');
    damage.volume = 0.5;
    
    var victory = new Audio('/static/audio/victory.mp3');
    victory.volume = 0.5;
    
    var current = null;

    function stopAll() {
        bgm.pause(); bgm.currentTime = 0;
        battle1.pause(); battle1.currentTime = 0;
        battle2.pause(); battle2.currentTime = 0;
        damage.pause(); damage.currentTime = 0;
        victory.pause(); victory.currentTime = 0;
        current = null;
    }

    function play(audio) {
        stopAll();
        audio.currentTime = 0;
        audio.play().catch(function(){});
        current = audio;
    }

    function playBGM()        { play(bgm); }
    function playBattle(id)   { play(id === 'yukari' ? battle2 : battle1); }
    function playDamage()     { damage.currentTime = 0; damage.play().catch(function(){}); }
    function playVictory()    { stopAll(); victory.currentTime = 0; victory.play().catch(function(){}); }

    return { playBGM, playBattleMusic: playBattle, playDamage, playVictory, stopAll };
})();
window.AudioManager = AudioManager;