import { PrismaClient, MessageRole, SessionStatus } from '@prisma/client';

export class SessionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  // Get all sessions
  async getAllSessions() {
    const sessions = await this.prisma.session.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    // Convert integer satisfaction values back to text
    return sessions.map(session => ({
      ...session,
      userSatisfaction: session.userSatisfaction === 1 ? 'Satisfied' :
                      session.userSatisfaction === 0 ? 'Unsatisfied' :
                      'Not provided',
    }));
  }

  // Get specific session by sessionId
  async getSessionBySessionId(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { sessionId },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
      },
    });

    if (!session) return null;

    // Convert integer satisfaction value back to text
    return {
      ...session,
      userSatisfaction: session.userSatisfaction === 1 ? 'Satisfied' :
                      session.userSatisfaction === 0 ? 'Unsatisfied' :
                      'Not provided',
    };
  }

  // Create new session
  async createSession(sessionData: any) {
    const { messages, ...sessionFields } = sessionData;

    // Convert string satisfaction to integer
    let userSatisfactionInt: number | null = null;
    if (sessionFields.userSatisfaction) {
      switch (sessionFields.userSatisfaction) {
        case 'Satisfied':
          userSatisfactionInt = 1;
          break;
        case 'Unsatisfied':
          userSatisfactionInt = 0;
          break;
        case 'Not provided':
        default:
          userSatisfactionInt = null;
          break;
      }
    }

    // Ensure required fields have proper types
    const sessionDuration = sessionFields.sessionDuration ? 
      parseInt(sessionFields.sessionDuration.toString()) : null;

    const createdSession = await this.prisma.session.create({
      data: {
        sessionId: sessionFields.sessionId || this.generateSessionId(),
        userId: sessionFields.userId || null,
        countryOfOrigin: sessionFields.countryOfOrigin || null,
        userLocation: sessionFields.userLocation || null,
        originalPrompt: sessionFields.originalPrompt || null,
        aiRefinedPrompt: sessionFields.aiRefinedPrompt || null,
        aiSolution: sessionFields.aiSolution || null,
        userSatisfaction: userSatisfactionInt,
        totalMessages: sessionFields.totalMessages || 0,
        sessionDuration: sessionDuration,
        aiInitiatedRefinements: sessionFields.aiInitiatedRefinements || 0,
        userInitiatedRefinements: sessionFields.userInitiatedRefinements || 0,
        satisfactionSurveyInteractions: sessionFields.satisfactionSurveyInteractions || 0,
        userEmotionalEngagementScore: sessionFields.userEmotionalEngagementScore?.toString() || "1",
        engagementRationale: sessionFields.engagementRationale || null,
        userIntelligenceScore: sessionFields.userIntelligenceScore?.toString() || "1",
        intelligenceRationale: sessionFields.intelligenceRationale || null,
        keyTopics: Array.isArray(sessionFields.keyTopics) ? sessionFields.keyTopics : [],
        skillAreas: Array.isArray(sessionFields.skillAreas) ? sessionFields.skillAreas : [],
        nextSteps: Array.isArray(sessionFields.nextSteps) ? sessionFields.nextSteps : [],
        messages: messages ? {
          create: messages.map((msg: any) => ({
            role: msg.role as MessageRole || (msg.sender === 'user' ? MessageRole.USER : MessageRole.ASSISTANT),
            content: msg.content || msg.text,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          })),
        } : undefined,
      },
      include: {
        messages: true,
      },
    });

    // Convert integer satisfaction value back to text
    return {
      ...createdSession,
      userSatisfaction: createdSession.userSatisfaction === 1 ? 'Satisfied' :
                       createdSession.userSatisfaction === 0 ? 'Unsatisfied' :
                       'Not provided',
    };
  }

  // Update session
  async updateSession(sessionId: string, updateData: any) {
    const { messages, ...sessionFields } = updateData;

    // Convert string satisfaction to integer if provided
    let userSatisfactionInt: number | null | undefined = undefined;
    if (sessionFields.userSatisfaction !== undefined) {
      switch (sessionFields.userSatisfaction) {
        case 'Satisfied':
          userSatisfactionInt = 1;
          break;
        case 'Unsatisfied':
          userSatisfactionInt = 0;
          break;
        case 'Not provided':
        case null:
          userSatisfactionInt = null;
          break;
        default:
          userSatisfactionInt = sessionFields.userSatisfaction;
          break;
      }
    }

    const updatedSession = await this.prisma.session.update({
      where: { sessionId },
      data: {
        ...(sessionFields.userId && { userId: sessionFields.userId }),
        ...(sessionFields.countryOfOrigin && { countryOfOrigin: sessionFields.countryOfOrigin }),
        ...(sessionFields.userLocation && { userLocation: sessionFields.userLocation }),
        ...(sessionFields.originalPrompt && { originalPrompt: sessionFields.originalPrompt }),
        ...(sessionFields.aiRefinedPrompt && { aiRefinedPrompt: sessionFields.aiRefinedPrompt }),
        ...(sessionFields.aiSolution && { aiSolution: sessionFields.aiSolution }),
        ...(userSatisfactionInt !== undefined && { userSatisfaction: userSatisfactionInt }),
        ...(sessionFields.totalMessages && { totalMessages: parseInt(sessionFields.totalMessages.toString()) }),
        ...(sessionFields.sessionDuration && { sessionDuration: parseInt(sessionFields.sessionDuration.toString()) }),
        ...(sessionFields.aiInitiatedRefinements && { aiInitiatedRefinements: parseInt(sessionFields.aiInitiatedRefinements.toString()) }),
        ...(sessionFields.userInitiatedRefinements && { userInitiatedRefinements: parseInt(sessionFields.userInitiatedRefinements.toString()) }),
        ...(sessionFields.satisfactionSurveyInteractions && { satisfactionSurveyInteractions: parseInt(sessionFields.satisfactionSurveyInteractions.toString()) }),
        ...(sessionFields.userEmotionalEngagementScore && { userEmotionalEngagementScore: sessionFields.userEmotionalEngagementScore.toString() }),
        ...(sessionFields.engagementRationale && { engagementRationale: sessionFields.engagementRationale }),
        ...(sessionFields.userIntelligenceScore && { userIntelligenceScore: sessionFields.userIntelligenceScore.toString() }),
        ...(sessionFields.intelligenceRationale && { intelligenceRationale: sessionFields.intelligenceRationale }),
        ...(sessionFields.keyTopics && { keyTopics: Array.isArray(sessionFields.keyTopics) ? sessionFields.keyTopics : [] }),
        ...(sessionFields.skillAreas && { skillAreas: Array.isArray(sessionFields.skillAreas) ? sessionFields.skillAreas : [] }),
        ...(sessionFields.nextSteps && { nextSteps: Array.isArray(sessionFields.nextSteps) ? sessionFields.nextSteps : [] }),
        ...(sessionFields.status && { status: sessionFields.status }),
        ...(sessionFields.endTime && { endTime: new Date(sessionFields.endTime) }),
      },
      include: {
        messages: true,
      },
    });

    // Convert integer satisfaction value back to text
    return {
      ...updatedSession,
      userSatisfaction: updatedSession.userSatisfaction === 1 ? 'Satisfied' :
                       updatedSession.userSatisfaction === 0 ? 'Unsatisfied' :
                       'Not provided',
    };
  }

  // Delete session
  async deleteSession(sessionId: string) {
    const result = await this.prisma.session.delete({
      where: { sessionId },
    });
    return !!result;
  }

  // Get all messages for a session
  async getSessionMessages(sessionId: string) {
    return this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'asc' },
    });
  }

  // Add message to session
  async addMessage(sessionId: string, messageData: any) {
    // Ensure session exists
    const session = await this.prisma.session.findUnique({
      where: { sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        sessionId,
        role: messageData.role as MessageRole || (messageData.sender === 'user' ? MessageRole.USER : MessageRole.ASSISTANT),
        content: messageData.content || messageData.text,
        timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
      },
    });

    // Update session's totalMessages count
    await this.prisma.session.update({
      where: { sessionId },
      data: {
        totalMessages: {
          increment: 1,
        },
      },
    });

    return message;
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Close database connection
  async disconnect() {
    await this.prisma.$disconnect();
  }
}