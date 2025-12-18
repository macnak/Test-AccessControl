import { FastifyRequest, FastifyReply } from 'fastify';
import { oauth2Tokens } from '../config/credentials';

export function oauth2Middleware(request: FastifyRequest, reply: FastifyReply, next: () => void) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'OAuth2 token required',
    });
  }

  const token = authHeader.split(' ')[1];

  const isValid = oauth2Tokens.includes(token);

  if (!isValid) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid OAuth2 token',
    });
  }

  // Authentication successful
  next();
  return;
}
