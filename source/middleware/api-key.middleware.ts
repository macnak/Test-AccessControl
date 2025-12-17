import { FastifyRequest, FastifyReply } from 'fastify';
import { apiKeys } from '../config/credentials';

export function apiKeyMiddleware(request: FastifyRequest, reply: FastifyReply, next: () => void) {
  const apiKey = (request.headers['x-api-key'] as string) || (request.query as any)?.apiKey;

  if (!apiKey) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'API key required',
    });
  }

  const isValid = apiKeys.includes(apiKey);

  if (!isValid) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid API key',
    });
  }

  // Authentication successful
  next();
  return;
}
