import dotenv from 'dotenv';

dotenv.config();

export const config = {
  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  queues: {
    healthCheckJobs: 'health-check-jobs',
    healthCheckResults: 'health-check-results',
  },
  healthCheckPort: parseInt(process.env.HEALTH_CHECK_PORT || '3001', 10),
};