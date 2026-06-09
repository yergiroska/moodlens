import { GroqAnalysis } from '../types/mood';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export async function analyzeMood(text: string): Promise<GroqAnalysis> {
    const prompt = `Eres un asistente de bienestar emocional. Analiza el siguiente texto y detecta las emociones presentes.

Texto del usuario: "${text}"

Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin explicaciones. El formato debe ser exactamente este:
{
  "emotion": "nombre de la emoción dominante en español",
  "intensity": número del 1 al 10,
  "summary": "resumen en una frase de cómo se siente el usuario",
  "suggestion": "una actividad o consejo personalizado para el usuario",
  "secondary_emotions": ["emoción1", "emoción2"]
}`;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        throw new Error('Error al conectar con Groq API');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    try {
        const analysis: GroqAnalysis = JSON.parse(content);
        return analysis;
    } catch {
        throw new Error('Error al procesar la respuesta de la IA');
    }
}