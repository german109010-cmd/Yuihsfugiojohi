// init.js - функция инициализации страниц
function initPageScripts(page) {
    console.log('Инициализация страницы:', page);
    
    // Проверяем, что VaultApp доступен
    if (typeof VaultApp !== 'undefined') {
        VaultApp.initPage(page);
    }
    
    // Инициализируем навигацию
    const navButtons = document.querySelectorAll('.nav');
    if (navButtons.length > 0) {
        navButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-nav');
                console.log('Навигация на:', page);
                Router.go(page);
            });
        });
    }
    
    // Инициализируем Airdrop страницу
    if (page === 'airdrop' && typeof Airdrop !== 'undefined') {
        try {
            Airdrop.checkAndResetDailyAirdrop();
            Airdrop.updateDailyAirdropCounter();
            
            const claimBtn = document.getElementById('claimDailyBtn');
            if (claimBtn) {
                claimBtn.addEventListener('click', async () => {
                    const user = auth.currentUser;
                    if (user) {
                        await Airdrop.claimDailyAirdrop(user.uid);
                    } else {
                        if (typeof VaultApp !== 'undefined') {
                            VaultApp.showToast('Пожалуйста, войдите в систему');
                        } else {
                            alert('Пожалуйста, войдите в систему');
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Ошибка инициализации Airdrop:', error);
        }
    }
    
    // Инициализируем кнопку Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await auth.signOut();
                console.log('Пользователь вышел');
                Router.load('auth');
            } catch (error) {
                console.error('Ошибка выхода:', error);
            }
        });
    }
}