import { FastifyRequest, FastifyReply } from 'fastify';
import { bearerTokens } from '../config/credentials';

export function bearerTokenMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Bearer token required',
    });
  }

  const token = authHeader.split(' ')[1];

  const isValid = bearerTokens.includes(token);

  if (!isValid) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid bearer token',
    });
  }

  // Authentication successful
  return;
}
