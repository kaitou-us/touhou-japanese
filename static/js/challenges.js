/**
 * 幻想郷 言霊修行帳 - 每日挑战系统
 */

const Challenges = (() => {
    
    function getToken() {
        return localStorage.getItem('touhou_user_token') || '';
    }
    
    /**
     * 获取今日挑战
     */
    async function getTodayChallenges() {
        const token = getToken();
        if (!token) return null;
        try {
            const res = await fetch(`${window.location.origin}/api/challenges?token=${encodeURIComponent(token)}`);
            return await res.json();
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 更新任务进度
     */
    async function updateProgress(taskType, amount = 1) {
        const token = getToken();
        if (!token) return;
        try {
            await fetch(`${window.location.origin}/api/challenges/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: token, task_type: taskType, amount: amount })
            });
        } catch (e) {
            console.log('上报进度失败:', e);
        }
    }
    /**
     * 领取奖励
     */
    async function claimReward(taskId) {
        const token = getToken();
        if (!token) return null;
        try {
            const res = await fetch(`${window.location.origin}/api/challenges/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, task_id: taskId })
            });
            return await res.json();
        } catch (e) {
            return null;
        }
    }
    
    /**
     * 渲染挑战面板
     */
    async function renderChallengePanel() {
        const result = await getTodayChallenges();
        if (!result || !result.success) {
            return `
                <div class="challenge-panel">
                    <div style="text-align:center;color:var(--text-muted);padding:20px;">
                        请先登录以查看每日挑战
                    </div>
                </div>`;
        }
        
        const challenges = result.data;
        const completed = challenges.filter(c => c.completed).length;
        const total = challenges.length;
        const allDone = completed === total;
        
        const tasksHTML = challenges.map(c => {
            const iconMap = { draw_card: '🎴', learn_word: '📖', test_word: '📝', duel: '⚔️' };
            const icon = iconMap[c.task_type] || '📋';
            const progressText = c.target > 1 ? ` (${c.current}/${c.target})` : '';
            
            return `
                <div class="challenge-item ${c.completed ? 'completed' : ''}">
                    <div class="challenge-icon">${icon}</div>
                    <div class="challenge-info">
                        <div class="challenge-name">${c.name}${progressText}</div>
                        <div class="challenge-desc">${c.description}</div>
                    </div>
                    <div class="challenge-reward">💎 +${c.reward_rei || 0} 💰 +${c.reward_saisen || 0}</div>
                    ${c.completed && !c.claimed ? 
                        `<button class="btn-claim" onclick="Challenges.claimAndRefresh('${c.id}')">领取</button>` :
                        c.claimed ?
                        '<span class="challenge-status done">✅</span>' :
                        '<span class="challenge-status pending">○</span>'
                    }
                </div>`;
        }).join('');
        
        return `
            <div class="challenge-panel">
                <div class="challenge-header">
                    <div class="challenge-title">🎯 每日修行</div>
                    <div class="challenge-date">${result.date}</div>
                </div>
                <div class="challenge-progress">
                    <div class="progress-bar-outer">
                        <div class="progress-bar-inner" style="width:${(completed/total*100).toFixed(0)}%"></div>
                    </div>
                    <div class="progress-text">${completed}/${total} 完成${allDone ? ' 🎉 全部完成！' : ''}</div>
                </div>
                <div class="challenge-list">
                    ${tasksHTML}
                </div>
            </div>`;
    }
    
    /**
     * 领取奖励并刷新
     */
async function claimAndRefresh(taskId) {
    const result = await claimReward(taskId);
    if (result && result.success) {
        Panels.showToast('🎁', '领取成功！ +' + (result.reward?.saisen || 0) + '賽錢', 'success');
        
        // 立即刷新面板
        const panel = document.getElementById('challengePanelContainer');
        if (panel) {
            const html = await renderChallengePanel();
            panel.innerHTML = html;
        }
        
        // 刷新货币
        if (window.loadUserHeader) {
            await window.loadUserHeader();
        }
    }
}
    /**
     * 显示奖励弹窗
     */
    function showRewardPopup(reward) {
        const popup = document.createElement('div');
        popup.className = 'reward-popup';
        popup.innerHTML = `
            <span class="reward-icon">🎁</span>
            <div class="reward-text">领取成功！</div>
            <div class="reward-amount">
                ${reward.rei ? `💎 靈珠 +${reward.rei}` : ''}
                ${reward.saisen ? ` 💰 賽錢 +${reward.saisen}` : ''}
            </div>
        `;
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.style.opacity = '0';
            popup.style.transition = 'opacity 0.5s';
            setTimeout(() => popup.remove(), 500);
        }, 2000);
    }
    
    return {
        getTodayChallenges,
        updateProgress,
        claimReward,
        renderChallengePanel,
        claimAndRefresh
    };
})();

window.Challenges = Challenges;