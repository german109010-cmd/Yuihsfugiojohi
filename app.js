// app.js - инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM полностью загружен');
    
    // Ждем 500мс для гарантии загрузки Firebase
    setTimeout(() => {
        // Проверяем доступность Firebase
        if (!auth) {
            console.error('Firebase Auth не доступен');
            Router.load('auth');
            return;
        }
        
        console.log('Начинаем проверку авторизации...');
        
        // Проверяем, авторизован ли пользователь
        auth.onAuthStateChanged(async (user) => {
            console.log('Статус авторизации изменен:', user ? `Пользователь: ${user.email}` : 'Нет пользователя');
            
            if (user && user.emailVerified) {
                console.log('Пользователь авторизован и email подтвержден');
                
                try {
                    if (typeof VaultApp !== 'undefined') {
                        await VaultApp.loadUserData(user);
                        VaultApp.updateUI();
                    }
                    
                    // Используем Router для перехода
                    Router.go('wallet');
                    
                } catch (error) {
                    console.error('Ошибка загрузки данных пользователя:', error);
                    Router.load('auth');
                }
            } else {
                console.log('Пользователь не авторизован, показываем auth страницу');
                Router.load('auth');
            }
        });
        
        // Проверяем текущего пользователя сразу
        const currentUser = auth.currentUser;
        if (!currentUser) {
            console.log('Нет текущего пользователя, показываем auth');
            // Router.load('auth'); - уже вызвано выше в onAuthStateChanged
        }
    }, 500);
});