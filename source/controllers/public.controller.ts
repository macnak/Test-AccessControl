import { FastifyRequest, FastifyReply } from 'fastify';

export const publicController = {
  // Health check endpoint - no auth required
  async healthCheck(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  },

  // Public info endpoint
  async getInfo(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      application: 'Test Access Control API',
      version: '1.0.0',
      description: 'API for testing various access control mechanisms',
      supportedAuthMethods: ['Basic Auth', 'API Key', 'Bearer Token', 'OAuth2'],
    });
  },
};
