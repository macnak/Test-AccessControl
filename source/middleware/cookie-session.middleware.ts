import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../database/database.service';

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

  const db = getDatabase();
  const session = db.getSession(sessionCookie);

  if (!session) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid or expired session',
    });
  }

  // Check if session has expired
  if (new Date() > new Date(session.expires_at)) {
    db.deleteSession(sessionCookie);
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Session has expired',
    });
  }

  // Authentication successful
  next();
  return;
}
