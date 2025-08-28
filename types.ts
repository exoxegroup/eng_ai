
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface SessionData {
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  countryOfOrigin: string | null;
  userLocation: string | null;
  originalPrompt: string | null;
  aiRefinedPrompt: string | null;
  aiSolution: string | null;
  userSatisfaction: 'Satisfied' | 'Unsatisfied' | 'Not provided';
  totalMessages: number;
  sessionDuration: number | null;
  aiInitiatedRefinements: number;
  userInitiatedRefinements: number;
  satisfactionSurveyInteractions: number;
  userEmotionalEngagementScore: 1 | 2 | 3;
  engagementRationale: string;
  userIntelligenceScore: 1 | 2 | 3;
  intelligenceRationale: string;
  keyTopics: string[];
  skillAreas: string[];
  nextSteps: string[];
}

export interface ReportData {
  userSatisfaction: 'Satisfied' | 'Unsatisfied' | 'Not provided';
  userEmotionalEngagementScore: 1 | 2 | 3;
  engagementRationale: string;
  userIntelligenceScore: 1 | 2 | 3;
  intelligenceRationale: string;
  aiInitiatedRefinements: number;
  userInitiatedRefinements: number;
  satisfactionSurveyInteractions: number;
  aiRefinedPrompt: string;
  aiSolution: string;
}