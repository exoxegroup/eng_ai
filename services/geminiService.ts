import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage, ReportData } from '../types';
import { SATISFACTION_QUESTION, AI_ENGINEERING_PROMPT_QUESTION } from '../constants';

let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const getConversationHistoryText = (messages: ChatMessage[]): string => {
  return messages.map(m => `${m.sender === 'ai' ? 'AI Coach' : 'User'}: ${m.text}`).join('\n');
};

export const validateCountry = async (userInput: string): Promise<{ isValid: boolean; countryName: string | null }> => {
  const systemInstruction = `You are a country validation expert. Your only task is to determine if the user's input is a real country and respond in JSON.
- If the input is a valid country name, a common abbreviation, or a colloquial name for a country, respond with a JSON object: {"isValid": true, "countryName": "Standardized English Name"}. For example, if the input is "USA", "United States of America", or "America", you should return "United States".
- If the input is NOT a valid country, respond with a JSON object: {"isValid": false, "countryName": ""}.
- Your response must be ONLY the JSON object and nothing else.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      isValid: { type: Type.BOOLEAN, description: "True if the input is a valid country, otherwise false." },
      countryName: { type: Type.STRING, description: "The standardized English name of the country if valid, otherwise an empty string." },
    },
  };

  try {
    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Is "${userInput}" a valid country?`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    if (!result.isValid) {
        return { isValid: false, countryName: null };
    }
    
    // If valid but no countryName provided, use the original input as fallback
    if (result.isValid && (!result.countryName || result.countryName.trim() === '')) {
        return { isValid: true, countryName: userInput.trim() };
    }

    return { isValid: true, countryName: result.countryName };

  } catch (error) {
    console.error("Error validating country:", error);
    return { isValid: false, countryName: null };
  }
};

export const getAiCoachResponseStream = async (messages: ChatMessage[]) => {
  // Find the start of the actual engineering conversation, after the initial setup.
  let startIndex = 1; 
  const engineeringQuestionIndex = messages.findIndex(m => m.text.includes("What engineering problem/goal can I help you solve today?"));

  if (engineeringQuestionIndex !== -1) {
    startIndex = engineeringQuestionIndex + 1; // Start from the message *after* the question
  }
  
  const historyText = getConversationHistoryText(messages.slice(startIndex));

  const systemInstruction = `You are an Engineering AI Coach. Your expertise is strictly confined to engineering knowledge from textbooks, academic papers, and specialized databases. Your goal is to guide users in solving engineering problems. You must follow this protocol:
1. When the user states their initial problem, your primary goal is to help them refine it. Ask clarifying questions to make the prompt more specific, structured, and solvable from an engineering perspective. Propose a refined prompt once you have enough information.
2. Once a prompt is sufficiently refined, provide a comprehensive, technically sound engineering solution.
3. After EVERY response you give (whether it's a clarification, a refined prompt, or a solution), you MUST conclude your message with the exact phrase: "${SATISFACTION_QUESTION}"
Do not deviate from these rules. The user's latest message is the last one in the transcript.`;
  
  const contents = `Conversation History:
${historyText}
`;

  return getAI().models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });
};


export const generateSessionReport = async (
  messages: ChatMessage[],
  originalPrompt: string,
  currentMetrics: {
    satisfaction: 'Satisfied' | 'Unsatisfied' | 'Not provided',
    userRefinements: number,
    satisfactionInteractions: number
  }
): Promise<ReportData> => {
    const historyText = getConversationHistoryText(messages);

    const reportSchema = {
      type: Type.OBJECT,
      properties: {
        userSatisfaction: { type: Type.STRING, description: `The user's satisfaction. Based on the final user message, determine if they were 'Satisfied' or 'Unsatisfied'. Default to the provided value: ${currentMetrics.satisfaction}` },
        aiRefinedPrompt: { type: Type.STRING, description: "Extract the final 'AI Refined Prompt' the coach proposed. If none, state 'Not generated'."},
        aiSolution: { type: Type.STRING, description: "Extract the final engineering solution provided by the AI coach. If none, state 'Not provided'."},
        userEmotionalEngagementScore: { type: Type.INTEGER, description: "A score of 1, 2, or 3 based on the scoring criteria." },
        engagementRationale: { type: Type.STRING, description: "A brief explanation for the engagement score." },
        userIntelligenceScore: { type: Type.INTEGER, description: "A score of 1, 2, or 3 based on the scoring criteria." },
        intelligenceRationale: { type: Type.STRING, description: "A brief explanation for the intelligence score." },
        aiInitiatedRefinements: { type: Type.INTEGER, description: "Count how many times the AI proposed a 'Refined Prompt'." },
        userInitiatedRefinements: { type: Type.INTEGER, description: `The number of times the user provided clarifications. Use the provided value: ${currentMetrics.userRefinements}` },
        satisfactionSurveyInteractions: { type: Type.INTEGER, description: `Count of user responses to the satisfaction survey. Use the provided value: ${currentMetrics.satisfactionInteractions}` }
      },
    };
    
    const systemInstruction = `
    You are a data analysis bot. Your task is to analyze the following conversation transcript between an "AI Coach" and a "User" and generate a JSON report based on the provided schema.

    Scoring Criteria:
    - User Emotional Engagement Score:
      - 3 (High): User actively collaborates, asks insightful follow-up questions, and willingly provides context.
      - 2 (Moderate): User provides a decent prompt but does not engage in deep refinement or extensive follow-up.
      - 1 (Low): User provides vague prompts, shows minimal engagement, and treats the interaction like a simple search query.
    - User Intelligence Score:
      - 3 (High): Initial prompt is well-structured and specific. User's contributions to refinement are clear and logical.
      - 2 (Moderate): Initial prompt is understandable but lacks detail. User can follow along with AI-led refinement.
      - 1 (Low): Prompts are consistently ambiguous or contradictory. User struggles to articulate their needs even with guidance.
    `;
    
    const contents = `The user's original prompt was: "${originalPrompt}"
    
    Conversation Transcript:
    ${historyText}
    
    Analyze the transcript and output a valid JSON object matching the schema.
    `;

    const response = await getAI().models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: reportSchema,
      },
    });

    try {
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ReportData;
    } catch (e) {
        console.error("Failed to parse report JSON:", e);
        console.error("Raw text from AI:", response.text);
        throw new Error("Could not generate session report due to invalid JSON from AI.");
    }
};