import { FastifyInstance } from 'fastify';
import { publicController } from '../controllers/public.controller';

export default async function publicRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['Public'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
            },
          },
        },
      },
    },
    publicController.healthCheck,
  );

  fastify.get(
    '/info',
    {
      schema: {
        description: 'API information endpoint',
        tags: ['Public'],
        response: {
          200: {
            type: 'object',
            properties: {
              application: { type: 'string' },
              version: { type: 'string' },
              description: { type: 'string' },
              supportedAuthMethods: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    publicController.getInfo,
  );
}
