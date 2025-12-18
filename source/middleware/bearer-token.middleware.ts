import { FastifyRequest, FastifyReply } from 'fastify';
import { bearerTokens, validatedBearerTokens } from '../config/credentials';

export function bearerTokenMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  next: () => void,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Bearer token required',
    });
  }

  const token = authHeader.split(' ')[1];

  // Check both pre-configured tokens and validated tokens from login flow
  const isValid = bearerTokens.includes(token) || validatedBearerTokens.has(token);

  if (!isValid) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid bearer token',
    });
  }

  // Authentication successful
  next();
  return;
}
