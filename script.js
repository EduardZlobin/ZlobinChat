let inactivityTimer;

// Функция для сброса и запуска таймера
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        // Если пользователь молчит 30 секунд, отправляем "..."
        sendSilentMessage("...");
    }, 30000); // 30000 мс = 30 секунд
}

// Функция для отправки сообщения без отображения "..." в чате
async function sendSilentMessage(text) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        appendMessage(data.reply, 'bot-msg');
        resetInactivityTimer(); // Запускаем таймер снова после ответа Эдика
    } catch (e) {
        console.error("Эдик не смог достучаться...");
    }
}

// Обновим твою основную функцию отправки, чтобы она тоже сбрасывала таймер
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-msg');
    userInput.value = '';
    clearTimeout(inactivityTimer); // Останавливаем таймер, пока Эдик отвечает

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        const data = await response.json();
        appendMessage(data.reply, 'bot-msg');
        resetInactivityTimer(); // Снова запускаем таймер после того, как ответ получен
    } catch (e) {
        appendMessage('Ой , что-то связь прервалась ! Наверное , пенсия опять не проходит !', 'bot-msg');
    }
}

// Запускаем таймер при первой загрузке страницы
resetInactivityTimer();