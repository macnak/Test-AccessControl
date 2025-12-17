import { FastifyRequest, FastifyReply } from 'fastify';
import { validCredentials } from '../config/credentials';

export function basicAuthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  next: () => void,
) {
  console.log('Basic auth middleware called');
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log('No auth header or not Basic');
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
      console.log('Invalid credentials');
      return reply.code(401).send({
        error: 'Unauthorized',
        message: 'Invalid credentials',
      });
    }

    // Authentication successful - allow request to continue
    console.log('Auth successful');
    next();
    return;
  } catch (error) {
    console.log('Error in auth:', error);
    return reply.code(401).send({
      error: 'Unauthorized',
      message: 'Invalid authentication format',
    });
  }
}
