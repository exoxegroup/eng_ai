import { Request, Response } from 'express';
import { SessionService } from '../services/SessionService';

export class SessionController {
  private sessionService: SessionService;

  constructor() {
    this.sessionService = new SessionService();
  }

  // Get all sessions
  getAllSessions = async (req: Request, res: Response) => {
    try {
      const sessions = await this.sessionService.getAllSessions();
      res.json({
        success: true,
        data: sessions,
        count: sessions.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch sessions',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Get specific session
  getSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const session = await this.sessionService.getSessionBySessionId(sessionId);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        });
        return;
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Create new session
  createSession = async (req: Request, res: Response) => {
    try {
      const sessionData = req.body;
      const newSession = await this.sessionService.createSession(sessionData);

      res.status(201).json({
        success: true,
        data: newSession,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to create session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Update session
  updateSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const updateData = req.body;

      const updatedSession = await this.sessionService.updateSession(sessionId, updateData);

      if (!updatedSession) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        });
        return;
      }

      res.json({
        success: true,
        data: updatedSession,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to update session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Delete session
  deleteSession = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const deleted = await this.sessionService.deleteSession(sessionId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Session not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Session deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to delete session',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Get all messages for a session
  getSessionMessages = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messages = await this.sessionService.getSessionMessages(sessionId);

      res.json({
        success: true,
        data: messages,
        count: messages.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch messages',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Add message to session
  addMessage = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messageData = req.body;

      const newMessage = await this.sessionService.addMessage(sessionId, messageData);

      res.status(201).json({
        success: true,
        data: newMessage,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: 'Failed to add message',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}