export default async function handler(req, res) {
    // Настройка заголовков для работы чата
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, xi-api-key');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { message } = req.body;
    const agentId = "agent_8501kp3ynwgce99r1ep4gtkxgnkc"; 
    const apiKey = process.env.ELEVENLABS_API_KEY;

    // Проверка наличия ключа в системе
    if (!apiKey) {
        console.error("ОШИБКА: Переменная ELEVENLABS_API_KEY не найдена в Vercel!");
        return res.status(500).json({ reply: "В системе нет ключа доступа. Проверь настройки Vercel." });
    }

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/get_response-text`, {
            method: "POST",
            headers: {
                "xi-api-key": apiKey,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: message
            })
        });

        const data = await response.json();

        // Если ElevenLabs вернул ошибку
        if (!response.ok) {
            console.error("ElevenLabs API Error:", data);
            return res.status(response.status).json({ 
                reply: `Ошибка ElevenLabs: ${data.detail?.status || 'неизвестно'}. Проверь права ключа.` 
            });
        }

        // Пытаемся достать текст из разных полей (зависит от версии API)
        const edikReply = data.agent_output || data.reply || data.text || "Эдик задумался и не ответил...";

        res.status(200).json({ reply: edikReply });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ reply: "Произошла техническая ошибка на сервере." });
    }
}
