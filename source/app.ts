import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import formbody from '@fastify/formbody';
import cookie from '@fastify/cookie';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { config } from './config/app.config';

// Import routes
import publicRoutes from './routes/public.routes';
import basicAuthRoutes from './routes/basic-auth.routes';
import apiKeyRoutes from './routes/api-key.routes';
import bearerTokenRoutes from './routes/bearer-token.routes';
import oauth2Routes from './routes/oauth2.routes';
import uploadRoutes from './routes/upload.routes';
import cookieSessionRoutes from './routes/cookie-session.routes';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  // Register CORS
  await app.register(cors, {
    origin: true,
  });

  // Register cookie support
  await app.register(cookie, {
    secret: 'my-secret-key-change-in-production', // Should be in environment variables in production
  });

  // Register formbody for application/x-www-form-urlencoded
  await app.register(formbody);

  // Register multipart for file uploads
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
  });

  // Add XML content type parser
  app.addContentTypeParser('application/xml', { parseAs: 'string' }, (_req, body, done) => {
    done(null, body);
  });

  // Register Swagger
  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Test Access Control API',
        description:
          'API for testing various access control mechanisms including Basic Auth, API Key, Bearer Token, OAuth2, and file uploads',
        version: '1.0.0',
      },
      host: `${config.host}:${config.port}`,
      schemes: ['http'],
      consumes: ['application/json', 'application/xml', 'application/x-www-form-urlencoded'],
      produces: ['application/json', 'application/xml', 'text/plain'],
      tags: [
        { name: 'Public', description: 'Public endpoints - no authentication required' },
        { name: 'Basic Auth', description: 'Endpoints requiring Basic Authentication' },
        { name: 'API Key', description: 'Endpoints requiring API Key authentication' },
        { name: 'Bearer Token', description: 'Endpoints requiring Bearer Token authentication' },
        { name: 'OAuth2', description: 'Endpoints requiring OAuth2 authentication' },
        { name: 'File Upload', description: 'File upload endpoints with multipart/form-data' },
      ],
      securityDefinitions: {
        basicAuth: {
          type: 'basic',
          description: 'Basic HTTP authentication. Use username and password.',
        },
        apiKey: {
          type: 'apiKey',
          name: 'x-api-key',
          in: 'header',
          description: 'API Key authentication via x-api-key header or apiKey query parameter',
        },
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Bearer token authentication. Format: Bearer <token>',
        },
        oauth2: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'OAuth2 token authentication. Format: Bearer <oauth2-token>',
        },
      },
    },
  });

  // Register Swagger UI
  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // Register routes
  await app.register(publicRoutes, { prefix: '/api/public' });
  await app.register(basicAuthRoutes, { prefix: '/api/basic-auth' });
  await app.register(apiKeyRoutes, { prefix: '/api/api-key' });
  await app.register(bearerTokenRoutes, { prefix: '/api/bearer-token' });
  await app.register(oauth2Routes, { prefix: '/api/oauth2' });
  await app.register(uploadRoutes, { prefix: '/api/upload' });
  await app.register(cookieSessionRoutes, { prefix: '/api/cookie-session' });

  return app;
}
