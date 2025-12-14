import { FastifyRequest, FastifyReply } from 'fastify';
import { validCredentials } from '../config/credentials';

export function basicAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Basic authentication required',
    });
  }

  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const isValid = validCredentials.some(
      (cred) => cred.username === username && cred.password === password,
    );

    if (!isValid) {
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // Authentication successful
    return;
  } catch (error) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid authentication format',
    });
  }
}
