document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram WebApp
    const tgApp = window.Telegram.WebApp;
    tgApp.expand();

    // Применение цветовой схемы Telegram
    document.body.className = tgApp.colorScheme;
    applyTelegramTheme();

    // Получаем элементы DOM
    const verificationForm = document.getElementById('verification-form');
    const statusDisplay = document.getElementById('status-display');
    const requestsList = document.getElementById('requests-list');
    const submitBtn = document.getElementById('submit-btn');
    const newRequestBtn = document.getElementById('new-request-btn');
    const title = document.getElementById('title');

    // Определение языка пользователя
    const userLanguage = tgApp.initDataUnsafe.user?.language_code || 'ru';

    // Перевод интерфейса
    localizeUI(userLanguage);

    // Определение, показывать ли форму или статус запросов
    checkUserRequests();

    // Обработчик отправки формы
    submitBtn.addEventListener('click', function() {
        if (validateForm()) {
            submitVerificationRequest();
        }
    });

    // Обработчик кнопки создания нового запроса
    newRequestBtn.addEventListener('click', function() {
        showVerificationForm();
    });

    // Инициализация и сообщение о готовности приложения
    tgApp.ready();

    // Функции приложения

    // Применение цветовой схемы Telegram
    function applyTelegramTheme() {
        // Добавляем CSS переменные из Telegram WebApp
        document.documentElement.style.setProperty('--tg-theme-bg-color', tgApp.themeParams.bg_color);
        document.documentElement.style.setProperty('--tg-theme-text-color', tgApp.themeParams.text_color);
        document.documentElement.style.setProperty('--tg-theme-hint-color', tgApp.themeParams.hint_color);
        document.documentElement.style.setProperty('--tg-theme-link-color', tgApp.themeParams.link_color);
        document.documentElement.style.setProperty('--tg-theme-button-color', tgApp.themeParams.button_color);
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tgApp.themeParams.button_text_color);
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tgApp.themeParams.secondary_bg_color);
    }

    // Проверка и отображение запросов пользователя
    function checkUserRequests() {
        // В реальном приложении здесь будет запрос статуса предыдущих заявок через бота
        // Для демонстрации просто показываем форму по умолчанию
        showVerificationForm();

        // Пример запроса статуса через Telegram WebApp
        // tgApp.sendData(JSON.stringify({
        //     action: "get_user_requests",
        //     user_id: tgApp.initDataUnsafe.user.id
        // }));
    }

    // Показать форму запроса верификации
    function showVerificationForm() {
        statusDisplay.classList.add('hidden');
        verificationForm.classList.remove('hidden');
        title.textContent = userLanguage === 'en' ? "Verification Request" : "Запрос верификации";
    }

    // Показать статус запросов
    function showStatusDisplay(requests) {
        verificationForm.classList.add('hidden');
        statusDisplay.classList.remove('hidden');
        title.textContent = userLanguage === 'en' ? "Your Requests" : "Ваши запросы";

        // Очищаем список запросов
        requestsList.innerHTML = '';

        // Если есть запросы, показываем их
        if (requests && requests.length > 0) {
            requests.forEach(request => {
                const requestCard = createRequestCard(request);
                requestsList.appendChild(requestCard);
            });
        } else {
            // Если запросов нет
            requestsList.innerHTML = userLanguage === 'en'
                ? '<p>You have no verification requests yet.</p>'
                : '<p>У вас пока нет запросов на верификацию.</p>';
        }
    }

    // Создание карточки запроса
    function createRequestCard(request) {
        const card = document.createElement('div');
        card.className = 'request-card';

        let statusClass = '';
        let statusText = '';

        if (userLanguage === 'en') {
            statusText = request.status || 'PENDING';
            if (statusText === 'PENDING') statusClass = 'status-pending';
            else if (statusText === 'APPROVED') statusClass = 'status-approved';
            else if (statusText === 'REJECTED') statusClass = 'status-rejected';
        } else {
            statusText = request.status || 'ОЖИДАЕТ ПРОВЕРКИ';
            if (statusText === 'ОЖИДАЕТ ПРОВЕРКИ') statusClass = 'status-pending';
            else if (statusText === 'ОДОБРЕНО') statusClass = 'status-approved';
            else if (statusText === 'ОТКЛОНЕНО') statusClass = 'status-rejected';
        }

        const requestType = userLanguage === 'en'
            ? (request.verification_type === 'channel' ? 'Channel' : 'User')
            : (request.verification_type === 'channel' ? 'Канал' : 'Пользователь');

        let cardHTML = `
            <h3>${request.name}</h3>
            <div class="request-date">${request.date || ''}</div>
            <p><strong>${userLanguage === 'en' ? 'Type' : 'Тип'}:</strong> ${requestType}</p>
            <span class="status-badge ${statusClass}">${statusText}</span>
        `;

        // Добавляем токен, если запрос одобрен
        if ((statusText === 'APPROVED' || statusText === 'ОДОБРЕНО') && request.verification_token) {
            cardHTML += `
                <div>
                    <p><strong>${userLanguage === 'en' ? 'Verification token' : 'Токен верификации'}:</strong></p>
                    <div class="token-box">${request.verification_token}</div>
                </div>
            `;
        }

        card.innerHTML = cardHTML;
        return card;
    }

    // Проверка формы перед отправкой
    function validateForm() {
        const name = document.getElementById('name').value;
        const description = document.getElementById('description').value;
        const followers = document.getElementById('followers').value;
        const contact = document.getElementById('contact').value;

        if (!name || !description || !followers || !contact) {
                const errorMessage = userLanguage === 'en'
                    ? 'Please fill in all fields'
                    : 'Пожалуйста, заполните все поля';

                tgApp.showPopup({
                    title: userLanguage === 'en' ? 'Error' : 'Ошибка',
                    message: errorMessage,
                    buttons: [{text: 'OK'}]
                });
                return;
            }