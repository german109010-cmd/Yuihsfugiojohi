// Уберите HTML теги из этого файла - он должен содержать только JavaScript

const VaultApp = {
    userData: null,

    init() {
        // Инициализация при загрузке приложения
        const page = window.location.pathname.split('/').pop().replace('.html', '') || 'auth';
        this.initPage(page);
    },

    initPage(page) {
        console.log('Initializing page:', page);
        switch (page) {
            case 'airdrop':
                this.initAirdropPage();
                break;
            case 'wallet':
                this.initWalletPage();
                break;
            // Добавьте инициализацию других страниц по необходимости
        }
    },

    initAirdropPage() {
        if (typeof Airdrop !== 'undefined') {
            Airdrop.checkAndResetDailyAirdrop();
            Airdrop.updateDailyAirdropCounter();
            const claimBtn = document.getElementById('claimDailyBtn');
            if (claimBtn) {
                claimBtn.addEventListener('click', async () => {
                    const user = auth.currentUser;
                    if (user) {
                        await Airdrop.claimDailyAirdrop(user.uid);
                    } else {
                        this.showToast('Please login first');
                    }
                });
            }
        }
    },

    initWalletPage() {
        // Инициализация кошелька
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.updateUI());
        }
    },

    async loadUserData(user) {
        const userDoc = await db.collection('vault_users').doc(user.uid).get();
        if (userDoc.exists) {
            this.userData = userDoc.data();
            console.log('User data loaded:', this.userData);
        }
    },

    updateUI() {
        // Обновление интерфейса на основе this.userData
        if (this.userData) {
            // Пример: обновление баланса на странице кошелька
            const balanceElement = document.getElementById('balanceAmount');
            if (balanceElement) {
                balanceElement.textContent = this.userData.vaultBalance || 0;
            }
        }
    },

    showToast(message) {
        // Временное решение - alert, в реальном приложении замените на toast
        alert(message);
    },

    async updateUserBalance(amount, description) {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = db.collection('vault_users').doc(user.uid);
        await userRef.update({
            vaultBalance: firebase.firestore.FieldValue.increment(amount),
            totalEarned: firebase.firestore.FieldValue.increment(amount)
        });

        // Добавляем транзакцию
        const transaction = {
            amount: amount,
            type: 'airdrop',
            description: description,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        await userRef.collection('transactions').add(transaction);

        // Обновляем локальные данные
        if (this.userData) {
            this.userData.vaultBalance = (this.userData.vaultBalance || 0) + amount;
            this.userData.totalEarned = (this.userData.totalEarned || 0) + amount;
        }

        this.updateUI();
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('VaultApp загружен');
    
    // Даем время на загрузку других скриптов
    setTimeout(function() {
        if (typeof firebase !== 'undefined' && firebase.apps.length > 0) {
            console.log('VaultApp инициализирован с Firebase');
        }
    }, 1000);
});
