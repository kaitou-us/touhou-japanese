/**
 * 幻想郷 言霊修行帳 - 特效系统
 * 粒子、背景、动画效果
 */

const Effects = (() => {
    
    /**
     * 创建浮动粒子系统
     */
    function createParticles() {
        const container = document.getElementById('particles-container');
        if (!container) return;
        
        const particleTypes = ['🦋', '🌸', '🍂', '✨', '💫', '🍃', '🏮', '💮'];
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.className = 'butterfly-particle';
            particle.textContent = particleTypes[Math.floor(Math.random() * particleTypes.length)];
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 15}s`;
            particle.style.animationDuration = `${8 + Math.random() * 15}s`;
            particle.style.fontSize = `${10 + Math.random() * 20}px`;
            particle.style.opacity = `${0.3 + Math.random() * 0.5}`;
            
            container.appendChild(particle);
        }
        
        // 添加蝴蝶粒子样式（如果还没有）
        if (!document.getElementById('particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                .butterfly-particle {
                    position: fixed;
                    pointer-events: none;
                    z-index: 0;
                    animation: floatUp linear infinite;
                    will-change: transform;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    /**
     * 创建弹幕飞行特效
     */
    function createDanmakuEffect(container, count = 8) {
        const colors = ['#e74c3c', '#d4a574', '#f0e6d3', '#c0392b', '#e8c9a0'];
        
        for (let i = 0; i < count; i++) {
            const bullet = document.createElement('div');
            const size = 4 + Math.random() * 8;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            bullet.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${color};
                box-shadow: 0 0 ${size * 2}px ${color};
                pointer-events: none;
                z-index: 1;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                --fly-x: ${(Math.random() - 0.5) * 200}px;
                --fly-y: ${(Math.random() - 0.5) * 200}px;
                animation: danmakuFly ${1 + Math.random() * 2}s ease-out forwards;
            `;
            
            container.appendChild(bullet);
            
            // 动画结束后移除
            setTimeout(() => bullet.remove(), 3000);
        }
    }
    
    /**
     * 洗练成功特效
     */
    function refinementSuccessEffect(element) {
        // 创建闪光粒子
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 15; i++) {
            const spark = document.createElement('div');
            spark.style.cssText = `
                position: fixed;
                left: ${centerX}px;
                top: ${centerY}px;
                width: 3px;
                height: 3px;
                background: #d4a574;
                border-radius: 50%;
                pointer-events: none;
                z-index: 999;
                box-shadow: 0 0 6px #d4a574;
                transition: all ${0.5 + Math.random() * 0.5}s ease-out;
            `;
            
            document.body.appendChild(spark);
            
            requestAnimationFrame(() => {
                spark.style.transform = `translate(${(Math.random() - 0.5) * 200}px, ${(Math.random() - 0.5) * 200}px) scale(0)`;
                spark.style.opacity = '0';
            });
            
            setTimeout(() => spark.remove(), 1000);
        }
    }
    
    /**
     * 抽卡翻转特效
     */
    function cardFlipEffect(element) {
        element.style.animation = 'none';
        element.offsetHeight; // 强制回流
        element.style.animation = 'cardFlip 0.6s ease-in-out';
    }
    
    /**
     * 灵力波动特效
     */
    function spiritPulseEffect(element) {
        element.classList.add('animate-spiritWave');
        setTimeout(() => element.classList.remove('animate-spiritWave'), 2000);
    }
    
    /**
     * 滚动到元素
     */
    function scrollToElement(element, offset = 80) {
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
    
    /**
     * 回到顶部
     */
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    // 初始化回到顶部按钮
    function initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        btn.addEventListener('click', scrollToTop);
    }
    
    return {
        createParticles,
        createDanmakuEffect,
        refinementSuccessEffect,
        cardFlipEffect,
        spiritPulseEffect,
        scrollToElement,
        scrollToTop,
        initBackToTop,
    };
})();