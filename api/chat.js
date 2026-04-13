export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, xi-api-key');

    if (req.method === 'OPTIONS') return res.status(200).end();

    const { message } = req.body;
    const agentId = "agent_8501kp3ynwgce99r1ep4gtkxgnkc"; 
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ reply: "Ошибка: Ключ API не настроен в Vercel." });
    }

    try {
        // Используем эндпоинт для текстового диалога
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/response`, {
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

        if (!response.ok) {
            console.error("Full Error Data:", JSON.stringify(data));
            return res.status(response.status).json({ 
                reply: `Ошибка: ${response.status}. Проверь, включен ли агент и есть ли токены.` 
            });
        }

        // В этом API ответ лежит в поле agent_output
        const edikReply = data.agent_output || "Эдик молчит...";

        res.status(200).json({ reply: edikReply });

    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ reply: "Технический сбой на сервере." });
    }
}
