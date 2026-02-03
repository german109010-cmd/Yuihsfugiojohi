const Airdrop = {
    async checkAndResetDailyAirdrop() {
        const now = new Date();
        const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
        const today = nyTime.toDateString();

        const lastReset = localStorage.getItem('lastAirdropReset');
        if (lastReset !== today) {
            localStorage.setItem('dailyAirdropCount', '0');
            localStorage.setItem('lastAirdropReset', today);
        }
    },

    loadDailyAirdropCount() {
        const count = localStorage.getItem('dailyAirdropCount') || '0';
        return parseInt(count, 10);
    },

    updateDailyAirdropCounter() {
        const count = this.loadDailyAirdropCount();
        document.getElementById('dailyCount').textContent = `${count}/1000`;
    },

    canClaimDailyAirdrop(userId) {
        const today = new Date().toDateString();
        const lastClaim = localStorage.getItem(`lastAirdropClaim_${userId}`);
        if (lastClaim === today) {
            return false;
        }

        const count = this.loadDailyAirdropCount();
        return count < 1000;
    },

    async claimDailyAirdrop(userId) {
        if (!this.canClaimDailyAirdrop(userId)) {
            VaultApp.showToast('You have already claimed today or airdrop limit reached');
            return false;
        }

        const count = this.loadDailyAirdropCount();
        localStorage.setItem('dailyAirdropCount', (count + 1).toString());

        const today = new Date().toDateString();
        localStorage.setItem(`lastAirdropClaim_${userId}`, today);

        if (typeof VaultApp !== 'undefined') {
            await VaultApp.updateUserBalance(500, 'Daily airdrop');
        }

        this.updateDailyAirdropCounter();
        VaultApp.showToast('Daily airdrop claimed! 500 Vault added to your balance.');
        return true;
    }
};