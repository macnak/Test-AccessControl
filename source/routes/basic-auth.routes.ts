import { FastifyInstance } from 'fastify';
import { basicAuthMiddleware } from '../middleware/basic-auth.middleware';
import { basicAuthController } from '../controllers/basic-auth.controller';

const jsonResponseSchema = {
  schema: {
    description: 'Get JSON response with Basic Auth',
    tags: ['Basic Auth'],
    security: [{ basicAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'array' },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const textResponseSchema = {
  schema: {
    description: 'Get plain text response with Basic Auth',
    tags: ['Basic Auth'],
    security: [{ basicAuth: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const xmlResponseSchema = {
  schema: {
    description: 'Get XML response with Basic Auth',
    tags: ['Basic Auth'],
    security: [{ basicAuth: [] }],
    consumes: ['application/xml'],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const postJsonSchema = {
  schema: {
    description: 'Post JSON data with Basic Auth',
    tags: ['Basic Auth'],
    security: [{ basicAuth: [] }],
    body: {
      type: 'object',
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          receivedData: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

const postFormSchema = {
  schema: {
    description: 'Post form data with Basic Auth',
    tags: ['Basic Auth'],
    security: [{ basicAuth: [] }],
    consumes: ['application/x-www-form-urlencoded'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          receivedData: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

const postXmlSchema = {
  schema: {
    description: 'Post XML data with Basic Auth',
    tags: ['Basic Auth'],
    security: [{ basicAuth: [] }],
    consumes: ['application/xml'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          receivedData: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

export default async function basicAuthRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', basicAuthMiddleware);

  fastify.get('/json', jsonResponseSchema, basicAuthController.getJson);
  fastify.get('/text', textResponseSchema, basicAuthController.getText);
  fastify.get('/xml', xmlResponseSchema, basicAuthController.getXml);
  fastify.post('/json', postJsonSchema, basicAuthController.postJson);
  fastify.post('/form', postFormSchema, basicAuthController.postForm);
  fastify.post('/xml', postXmlSchema, basicAuthController.postXml);
}
