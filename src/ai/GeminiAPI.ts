export interface GeminiSuggestion {
    move: string;
    explain: string;
  }
  
  export const getGeminiSuggestion = async (fen: string, apiKey: string, modelName: string): Promise<GeminiSuggestion | null> => {
    const prompt = `Based on the following FEN string, what is the best move for the current player? Please provide your answer in JSON format with two fields: "move" (in algebraic notation, e.g., "e4", "Nf3") and "explain" (a brief explanation of why it's a good move).

FEN: ${fen}`;
  
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt,
            }],
          }],
        }),
      });
  
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      const jsonText = text.match(/```json\n(.*\n)```/s)?.[1] || text;
      const suggestion = JSON.parse(jsonText);
      return suggestion;
    } catch (error) {
      console.error('Error getting suggestion from Gemini:', error);
      return null;
    }
  };