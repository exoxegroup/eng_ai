import express from 'express';
import { SessionController } from '../controllers/SessionController';

const router = express.Router();
const sessionController = new SessionController();

// GET /api/v1/sessions - Get all sessions
router.get('/', sessionController.getAllSessions);

// GET /api/v1/sessions/:sessionId - Get specific session
router.get('/:sessionId', sessionController.getSession);

// POST /api/v1/sessions - Create new session
router.post('/', sessionController.createSession);

// PUT /api/v1/sessions/:sessionId - Update session
router.put('/:sessionId', sessionController.updateSession);

// DELETE /api/v1/sessions/:sessionId - Delete session
router.delete('/:sessionId', sessionController.deleteSession);

// GET /api/v1/sessions/:sessionId/messages - Get all messages for session
router.get('/:sessionId/messages', sessionController.getSessionMessages);

// POST /api/v1/sessions/:sessionId/messages - Add message to session
router.post('/:sessionId/messages', sessionController.addMessage);

export default router;