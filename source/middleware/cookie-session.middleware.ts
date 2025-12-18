import { FastifyRequest, FastifyReply } from 'fastify';
import { validatedSessionCookies } from '../config/credentials';

export function cookieSessionMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  next: () => void,
) {
  const sessionCookie = request.cookies.sessionId;

  if (!sessionCookie) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Session cookie required',
    });
  }

  // Check if the session cookie is valid
  const isValid = validatedSessionCookies.has(sessionCookie);

  if (!isValid) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired session',
    });
  }

  // Authentication successful
  next();
  return;
}
