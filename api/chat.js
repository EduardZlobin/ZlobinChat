export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { message } = req.body;
    const agentId = "agent_8501kp3ynwgce99r1ep4gtkxgnkc"; // Твой ID агента

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}/response`, {
            method: "POST",
            headers: {
                "xi-api-key": process.env.ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: message
            })
        });

        const data = await response.json();
        
        // ElevenLabs возвращает ответ в поле agent_response
        const edikReply = data.agent_output || data.reply || "Ой, в голове зашумело...";

        res.status(200).json({ reply: edikReply });

    } catch (error) {
        console.error('ElevenLabs Error:', error);
        res.status(500).json({ reply: "Связь с Рабочей прервалась , грех какой-то..." });
    }
}
