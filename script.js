const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Функция для добавления сообщений в интерфейс
function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${className}`;
    msgDiv.innerText = text;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Автоскролл вниз
}

// Привязываем нажатие кнопки
sendBtn.onclick = sendMessage;

// Привязываем Enter
userInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

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
        speak(data.reply);
        resetInactivityTimer(); // Запускаем таймер снова после ответа Эдика
    } catch (e) {
        console.error("Эдик не смог достучаться...");
    }
}

let chatHistory = []; // Тут будет храниться наша переписка

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, 'user-msg');
    userInput.value = '';
    
    // Добавляем сообщение пользователя в историю
    chatHistory.push({ role: "user", parts: [{ text: text }] });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Отправляем и сообщение, и ВСЮ историю
            body: JSON.stringify({ message: text, history: chatHistory })
        });
        
        const data = await response.json();
        appendMessage(data.reply, 'bot-msg');

        // Добавляем ответ Эдика в историю, чтобы он помнил, что сказал
        chatHistory.push({ role: "model", parts: [{ text: data.reply }] });
        
    } catch (e) {
        appendMessage('Ой , что-то связь прервалась !', 'bot-msg');
    }
}


// Запускаем таймер при первой загрузке страницы
resetInactivityTimer();

function speak(text) {
    // Проверяем, поддерживает ли браузер синтез речи
    if (!window.speechSynthesis) return;

    // Останавливаем текущую озвучку, если она идет
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Настраиваем голос
    utterance.lang = 'ru-RU'; // Русский язык
    utterance.pitch = 0.9;    // Чуть ниже голос (для солидности)
    utterance.rate = 1.0;     // Скорость обычная

    // Пытаемся найти мужской голос, если он есть в системе
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(voice => voice.name.includes('Microsoft Pavel') || voice.name.includes('Google русский'));
    if (maleVoice) utterance.voice = maleVoice;

    window.speechSynthesis.speak(utterance);
}
