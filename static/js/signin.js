const Signin = (() => {
    
    function getToken() {
        return localStorage.getItem('touhou_user_token') || '';
    }
    
    async function getStatus() {
        var token = getToken();
        if (!token) return null;
        try {
            var res = await fetch('/api/signin/status?token=' + encodeURIComponent(token));
            return await res.json();
        } catch(e) { return null; }
    }
    
    async function doSignin() {
        var token = getToken();
        if (!token) { Panels.showToast('💢', '请先登录', 'error'); return; }
        try {
            var res = await fetch('/api/signin', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token: token})
            });
            var data = await res.json();
            
            if (data.success) {
                showSigninPopup(data);
                if (window.loadUserHeader) window.loadUserHeader();
                updateButton(true);
            } else {
                Panels.showToast('💢', data.message, 'error');
            }
        } catch(e) { Panels.showToast('💢', '签到失败', 'error'); }
    }
    
    function showSigninPopup(data) {
        var popup = document.createElement('div');
        popup.className = 'signin-popup';
        var imgHTML = data.image ? '<img src="' + window.location.origin + '/static/images/signin/' + data.image + '" class="signin-image" alt="签到图">' : '';
        popup.innerHTML = '<span style="font-size:4em;">✅</span><div class="signin-title">签到成功</div>' + imgHTML + '<div class="signin-consecutive">连续签到第 ' + data.consecutive + ' 天</div><div class="signin-reward">💎 +' + data.reward.rei + ' 💰 +' + data.reward.saisen + '</div><button class="btn-close-popup" onclick="this.parentElement.remove()">确定</button>';
        document.body.appendChild(popup);
    }
    
    async function updateButton(signed) {
        var btn = document.getElementById('signinBtn');
        if (!btn) return;
        if (signed) {
            btn.textContent = '✅ 今日已签到';
            btn.disabled = true;
        } else {
            btn.textContent = '📅 每日签到';
            btn.disabled = false;
        }
    }
    
    async function init() {
        var status = await getStatus();
        if (status && status.success) {
            updateButton(status.signed_today);
        }
    }
    
    return { doSignin, init, updateButton };
})();

window.Signin = Signin;