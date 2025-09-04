import express from 'express';
import { PrismaClient } from '@prisma/client';
import EmailService from '../services/EmailService';

const router = express.Router();
const prisma = new PrismaClient();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Email service health check
router.get('/email', async (req, res) => {
  try {
    const EmailService = require('../services/EmailService').default;
    const emailHealthy = await EmailService.verifySmtpConnection();
    
    res.json({
      status: emailHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      email: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
        host: process.env.SMTP_HOST || 'not configured',
        port: process.env.SMTP_PORT || 'not configured',
        user: process.env.SMTP_USER ? 'configured' : 'not configured',
        secure: process.env.SMTP_PORT === '465',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Email service check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Detailed health check with database connection
router.get('/detailed', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check email service
    const emailHealthy = await EmailService.verifySmtpConnection();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        type: 'postgresql',
      },
      email: {
        status: emailHealthy ? 'healthy' : 'unhealthy',
        host: process.env.SMTP_HOST || 'not configured',
        port: process.env.SMTP_PORT || 'not configured',
        user: process.env.SMTP_USER ? 'configured' : 'not configured',
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service health check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;