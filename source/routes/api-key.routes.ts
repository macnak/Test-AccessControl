import { FastifyInstance } from 'fastify';
import { apiKeyMiddleware } from '../middleware/api-key.middleware';
import { apiKeyController } from '../controllers/api-key.controller';

const jsonResponseSchema = {
  schema: {
    description: 'Get JSON response with API Key',
    tags: ['API Key'],
    security: [{ apiKey: [] }],
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
    description: 'Get plain text response with API Key',
    tags: ['API Key'],
    security: [{ apiKey: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const xmlResponseSchema = {
  schema: {
    description: 'Get XML response with API Key',
    tags: ['API Key'],
    security: [{ apiKey: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const postJsonSchema = {
  schema: {
    description: 'Post JSON data with API Key',
    tags: ['API Key'],
    security: [{ apiKey: [] }],
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
    description: 'Post form data with API Key',
    tags: ['API Key'],
    security: [{ apiKey: [] }],
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
    description: 'Post XML data with API Key',
    tags: ['API Key'],
    security: [{ apiKey: [] }],
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

export default async function apiKeyRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', apiKeyMiddleware);

  fastify.get('/json', jsonResponseSchema, apiKeyController.getJson);
  fastify.get('/text', textResponseSchema, apiKeyController.getText);
  fastify.get('/xml', xmlResponseSchema, apiKeyController.getXml);
  fastify.post('/json', postJsonSchema, apiKeyController.postJson);
  fastify.post('/form', postFormSchema, apiKeyController.postForm);
  fastify.post('/xml', postXmlSchema, apiKeyController.postXml);
}
