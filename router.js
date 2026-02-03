const Router = {
    async load(page) {
        console.log('Пытаюсь загрузить страницу:', page);
        try {
            const res = await fetch(page + '.html');
            
            if (!res.ok) {
                throw new Error(`Страница ${page}.html не найдена (ошибка ${res.status})`);
            }
            
            const html = await res.text();
            console.log('HTML получен, длина:', html.length);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Ищем элемент #page
            const pageElement = doc.querySelector('#page');
            if (!pageElement) {
                throw new Error('Элемент #page не найден в загруженном HTML');
            }
            
            document.querySelector('#app').innerHTML = pageElement.innerHTML;
            console.log('Страница успешно загружена');
            window.scrollTo(0, 0);
            
            // Инициализация страницы, если есть функция
            if (typeof initPageScripts === 'function') {
                initPageScripts(page);
            }
        } catch (error) {
            console.error('Ошибка загрузки страницы:', error);
            
            // Показываем сообщение об ошибке пользователю
            document.querySelector('#app').innerHTML = `
                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #000; color: white; padding: 20px;">
                    <div style="text-align: center; max-width: 300px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                        <h2 style="margin-bottom: 10px;">Ошибка загрузки</h2>
                        <p style="color: #999; margin-bottom: 30px;">${error.message}</p>
                        <button onclick="Router.load('auth')" style="
                            padding: 14px 24px;
                            background: #007AFF;
                            border: none;
                            border-radius: 12px;
                            color: white;
                            font-weight: bold;
                            cursor: pointer;
                        ">
                            Вернуться
                        </button>
                    </div>
                </div>
            `;
        }
    },
    
    go(page) {
        console.log('Переход на страницу:', page);
        history.pushState({}, '', page + '.html');
        Router.load(page);
    }
};

window.onpopstate = () => {
    const page = location.pathname.replace('.html','').replace('/','') || 'auth';
    Router.load(page);
};