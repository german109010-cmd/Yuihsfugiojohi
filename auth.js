// Добавьте эти функции в начало auth.js, перед const Auth = {

function generateSeedPhrase() {
    const words = [
        "abandon", "ability", "able", "about", "above", "absent", 
        "absorb", "abstract", "absurd", "abuse", "access", "accident"
    ];
    return words.slice(0, 12).join(' ');
}

function showSeedPhrase(seedPhrase, email, secretWord) {
    console.log('Seed Phrase:', seedPhrase);
    alert(`SAVE YOUR SEED PHRASE!\n\n${seedPhrase}\n\nAlso remember your secret word: ${secretWord}\n\nEmail: ${email}`);
}

const Auth = {
    showMessage(text, type) {
        const msg = document.getElementById('authMessage');
        msg.textContent = text;
        msg.className = `auth-message auth-${type}`;
        msg.style.display = 'block';
        
        setTimeout(() => {
            msg.style.display = 'none';
        }, 3000);
    },

    showLoginForm() {
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('registerTab').classList.remove('active');
        
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'none';
    },

    showRegisterForm() {
        document.getElementById('registerTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
        
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'none';
        
        this.updateSteps(1);
    },

    showForgotPassword() {
        document.getElementById('forgotPasswordForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('userInfo').style.display = 'none';
    },

    updateSteps(step) {
        const steps = ['step1', 'step2', 'step3'];
        steps.forEach((stepId, index) => {
            const stepEl = document.getElementById(stepId);
            if (index + 1 <= step) {
                stepEl.classList.add('completed');
                stepEl.classList.remove('active');
            } else {
                stepEl.classList.remove('completed', 'active');
            }
        });
        
        if (step >= 1 && step <= 3) {
            document.getElementById(`step${step}`).classList.add('active');
        }
    },

    showUserInfo(user) {
        document.getElementById('userEmail').textContent = user.email;
        this.updateEmailStatus(user.emailVerified);
    },

    updateEmailStatus(isVerified) {
        const emailStatus = document.getElementById('emailStatus');
        if (isVerified) {
            emailStatus.textContent = 'Verified';
            emailStatus.className = 'status-badge status-verified';
            this.updateSteps(3);
            document.getElementById('continueBtn').style.display = 'block';
        } else {
            emailStatus.textContent = 'Not Verified';
            emailStatus.className = 'status-badge status-not-verified';
        }
    },

    async sendVerificationEmail() {
        const user = auth.currentUser;
        const resendBtn = document.getElementById('resendBtn');
        
        if (!user) {
            this.showMessage('User not found', 'error');
            return;
        }
        
        if (user.emailVerified) {
            this.showMessage('Email already verified', 'info');
            return;
        }
        
        try {
            resendBtn.disabled = true;
            resendBtn.textContent = 'Sending...';
            
            await user.sendEmailVerification();
            this.showMessage('📧 Verification email sent! Check your email.', 'success');
            
            let seconds = 60;
            const interval = setInterval(() => {
                resendBtn.textContent = `Resend (${seconds}s)`;
                seconds--;
                
                if (seconds <= 0) {
                    clearInterval(interval);
                    resendBtn.disabled = false;
                    resendBtn.textContent = 'Resend Email';
                }
            }, 1000);
            
        } catch (error) {
            console.error('❌ Email send error:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
            resendBtn.disabled = false;
            resendBtn.textContent = 'Resend Email';
        }
    },

    async checkEmailVerification() {
        const user = auth.currentUser;
        const checkBtn = document.getElementById('checkBtn');
        
        if (!user) {
            this.showMessage('User not found', 'error');
            return;
        }
        
        try {
            checkBtn.disabled = true;
            checkBtn.textContent = 'Checking...';
            
            await user.reload();
            
            if (user.emailVerified) {
                this.updateEmailStatus(true);
                this.showMessage('✅ Email verified successfully!', 'success');
            } else {
                this.showMessage('Email not yet verified. Check your email.', 'info');
            }
            
        } catch (error) {
            console.error('❌ Verification check error:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
            
        } finally {
            checkBtn.disabled = false;
            checkBtn.textContent = 'Check Verification';
        }
    },

    continueToApp() {
        document.getElementById('auth').classList.remove('active');
        document.getElementById('wallet-screen').classList.add('active');
        
        setTimeout(() => {
            document.getElementById('bottomNav').classList.add('visible');
        }, 300);
        
        document.querySelectorAll('.nav').forEach(n => n.classList.remove('active'));
        document.querySelector('.nav[data-screen="wallet"]').classList.add('active');
    },

    async loginUser() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const secretWord = document.getElementById('loginSecret').value.trim();
        const loginBtn = document.getElementById('loginBtn');
        const loginBtnText = document.getElementById('loginBtnText');
        const loginBtnLoader = document.getElementById('loginBtnLoader');
        
        if (!email || !password || !secretWord) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        loginBtn.disabled = true;
        loginBtnText.textContent = 'Logging in...';
        loginBtnLoader.style.display = 'inline-block';
        
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                this.showMessage('Please verify your email first', 'error');
                await auth.signOut();
                return;
            }
            
            const userDoc = await db.collection('vault_users').doc(user.uid).get();
            if (!userDoc.exists) {
                this.showMessage('User not found. Please register first.', 'error');
                await auth.signOut();
                return;
            }
            
            const userData = userDoc.data();
            if (userData.secretWord !== secretWord) {
                this.showMessage('Invalid secret word', 'error');
                await auth.signOut();
                return;
            }
            
            this.showMessage('✅ Login successful!', 'success');
            
            await VaultApp.loadUserData(user);
            
            document.getElementById('auth').classList.remove('active');
            document.getElementById('wallet-screen').classList.add('active');
            
            VaultApp.updateUI();
            
            setTimeout(() => {
                document.getElementById('bottomNav').classList.add('visible');
            }, 300);
            
        } catch (error) {
            console.error('❌ Login error:', error);
            
            let errorMessage = 'Login failed: ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'User not found. Please register first.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Account disabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Try again later.';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
            
        } finally {
            loginBtn.disabled = false;
            loginBtnText.textContent = 'Login';
            loginBtnLoader.style.display = 'none';
        }
    },

    async registerUser() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const secretWord = document.getElementById('secretWord').value.trim();
        const registerBtn = document.getElementById('registerBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        
        if (!email || !password || !secretWord) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }
        
        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        if (secretWord.length < 3) {
            this.showMessage('Secret word must be at least 3 characters', 'error');
            return;
        }
        
        registerBtn.disabled = true;
        btnText.textContent = 'Registering...';
        btnLoader.style.display = 'inline-block';
        
        try {
            this.showMessage('Creating account...', 'info');
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            this.updateSteps(2);
            
            const seedPhrase = generateSeedPhrase();
            const walletAddress = TEST_WALLET_ADDRESSES[email] || 
                '0x' + Math.random().toString(16).substring(2, 42);
            
            await db.collection('vault_users').doc(user.uid).set({
                email: user.email,
                secretWord: secretWord,
                seedPhrase: seedPhrase,
                walletAddress: walletAddress,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                vaultBalance: 100,
                usdtBalance: 0,
                stakedBalance: 0,
                totalEarned: 0,
                totalStakingRewards: 0,
                emailVerified: false,
                transactions: [],
                connectedWallets: {
                    metamask: false,
                    telegram: false
                },
                completedTasks: [],
                referralCode: 'VAULT-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                rating: 5,
                tradeCount: 0
            });
            
            this.showMessage('Sending verification email...', 'info');
            await user.sendEmailVerification();
            
            setTimeout(() => {
                showSeedPhrase(seedPhrase, email, secretWord);
            }, 500);
            
            this.showUserInfo(user);
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('userInfo').style.display = 'block';
            
            this.showMessage(`✅ Registration successful! Check ${email} for verification.`, 'success');
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            
            let errorMessage = 'Registration error: ';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email is already registered';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'Email registration is disabled';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Weak password. Minimum 6 characters.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
            
        } finally {
            registerBtn.disabled = false;
            btnText.textContent = 'Register';
            btnLoader.style.display = 'none';
        }
    },

    async resetPassword() {
        const email = document.getElementById('resetEmail').value.trim();
        const resetBtn = document.getElementById('resetBtn');
        const resetBtnText = document.getElementById('resetBtnText');
        const resetBtnLoader = document.getElementById('resetBtnLoader');
        
        if (!email) {
            this.showMessage('Please enter your email', 'error');
            return;
        }
        
        resetBtn.disabled = true;
        resetBtnText.textContent = 'Sending...';
        resetBtnLoader.style.display = 'inline-block';
        
        try {
            await auth.sendPasswordResetEmail(email);
            this.showMessage('Password reset link sent to your email!', 'success');
            
            setTimeout(() => {
                this.showLoginForm();
            }, 3000);
            
        } catch (error) {
            console.error('❌ Reset password error:', error);
            
            let errorMessage = 'Error sending reset link: ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'User not found';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email';
                    break;
                default:
                    errorMessage = error.message;
            }
            
            this.showMessage(errorMessage, 'error');
            resetBtn.disabled = false;
            resetBtnText.textContent = 'Send Reset Link';
            resetBtnLoader.style.display = 'none';
        }
    }
};