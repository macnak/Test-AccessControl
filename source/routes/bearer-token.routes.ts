import { FastifyInstance } from 'fastify';
import { bearerTokenMiddleware } from '../middleware/bearer-token.middleware';
import { bearerTokenController } from '../controllers/bearer-token.controller';

const jsonResponseSchema = {
  schema: {
    description: 'Get JSON response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
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
    description: 'Get plain text response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const xmlResponseSchema = {
  schema: {
    description: 'Get XML response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const postJsonSchema = {
  schema: {
    description: 'Post JSON data with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        value: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          receivedData: { type: 'object' },
        },
      },
    },
  },
};

const postFormSchema = {
  schema: {
    description: 'Post form data with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    consumes: ['application/x-www-form-urlencoded'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          receivedData: { type: 'object' },
        },
      },
    },
  },
};

const postXmlSchema = {
  schema: {
    description: 'Post XML data with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    consumes: ['application/xml'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          receivedData: { type: 'object' },
        },
      },
    },
  },
};

export default async function bearerTokenRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', bearerTokenMiddleware);

  fastify.get('/json', jsonResponseSchema, bearerTokenController.getJson);
  fastify.get('/text', textResponseSchema, bearerTokenController.getText);
  fastify.get('/xml', xmlResponseSchema, bearerTokenController.getXml);
  fastify.post('/json', postJsonSchema, bearerTokenController.postJson);
  fastify.post('/form', postFormSchema, bearerTokenController.postForm);
  fastify.post('/xml', postXmlSchema, bearerTokenController.postXml);
}
