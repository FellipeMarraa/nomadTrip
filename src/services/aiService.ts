const GROQ_API_KEY = import.meta.env.VITE_GROQ_KEY;

interface AIContext {
    destination: string;
    tripType: 'SINGLE' | 'MULTI';
    arrival: { time: string; location: string };
    departure: { time: string; location: string };
    hotel: string;
    totalDays: number;
}

export const generateTripContent = async (context: AIContext) => {
    const { destination, arrival, departure, hotel, totalDays } = context;

    const prompt = `
    Aja como um concierge de luxo local, especialista em geografia urbana e crítico gastronômico.
    Gere um roteiro de ${totalDays} dias estritamente para a cidade de: ${destination}.

    REGRAS DE OURO (GEOGRAFIA E VERACIDADE):
    1. PROIBIDO SAIR DA CIDADE: Não sugira locais fora dos limites municipais de ${destination}. Se o usuário digitou "João Pessoa", não sugira "Cabedelo" ou "Conde" (mesmo que sejam vizinhas). Se for "São Paulo", não sugira "Santos".
    2. RAIO DE DISTÂNCIA: Priorize locais em um raio de até 10km do centro ou da hospedagem informada (${hotel}).
    3. EXISTÊNCIA REAL: Sugira APENAS estabelecimentos (restaurantes e pontos turísticos) mundialmente famosos e verificáveis no Google Maps/TripAdvisor. Se tiver dúvida se o local ainda existe, NÃO sugira.
    4. FOCO EM LITORAL: Se ${destination} possuir mar, a atividade das 10:00 às 15:00 deve ser obrigatoriamente uma praia urbana da própria cidade.
    5. DETALHAMENTO: No campo title, inclua obrigatoriamente [Nome do Local] + [Bairro] + [Breve descrição real].

    CONTEXTO LOGÍSTICO:
    - Chegada: Dia 1 às ${arrival.time}. Se for após as 18:00, sugira apenas jantar num bairro nobre central.
    - Partida: Último dia às ${departure.time}. Planeje o trajeto para o local de saída 3h antes.

    ESTRUTURA JSON (RESPOSTA APENAS O JSON):
    {
      "checklist": [{ "task": "string", "category": "Roupas|Documentos|Higiene|Eletrônicos" }],
      "itinerary": [
        {
          "dayNumber": number,
          "city": "${destination}",
          "activities": [
            { 
              "time": "HH:MM", 
              "title": "NOME DO LOCAL - BAIRRO - Descrição verídica", 
              "type": "FOOD|CULTURE|LEISURE|TRANSPORT" 
            }
          ]
        }
      ]
    }
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-70b-versatile", // MUDANÇA: Use o modelo 70B se disponível, ele é MUITO mais inteligente que o 8B para nomes reais
                messages: [
                    {
                        role: "system",
                        content: `Você é um GPS humano de ${destination}. Você conhece as fronteiras exatas da cidade. Você odeia sugestões genéricas e locais fictícios. Você só recomenda o que está no TOP 10 da própria cidade.`
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.2, // REDUÇÃO: 0.2 para minimizar alucinações e criatividade. Queremos fatos, não ficção.
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error("Erro na resposta do Groq");

        const data = await response.json();
        const text = data.choices[0].message.content;
        const parsedData = JSON.parse(text);

        return {
            checklist: parsedData.checklist || [],
            itinerary: parsedData.itinerary || []
        };

    } catch (error) {
        console.error("Falha crítica no Groq:", error);
        return { checklist: [], itinerary: [] };
    }
};