import { FastifyInstance } from 'fastify';
import { oauth2Middleware } from '../middleware/oauth2.middleware';
import { oauth2Controller } from '../controllers/oauth2.controller';

const jsonResponseSchema = {
  schema: {
    description: 'Get JSON response with OAuth2',
    tags: ['OAuth2'],
    security: [{ oauth2: [] }],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          tokenInfo: { type: 'object' },
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
    description: 'Get plain text response with OAuth2',
    tags: ['OAuth2'],
    security: [{ oauth2: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const xmlResponseSchema = {
  schema: {
    description: 'Get XML response with OAuth2',
    tags: ['OAuth2'],
    security: [{ oauth2: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const postJsonSchema = {
  schema: {
    description: 'Post JSON data with OAuth2',
    tags: ['OAuth2'],
    security: [{ oauth2: [] }],
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
    description: 'Post form data with OAuth2',
    tags: ['OAuth2'],
    security: [{ oauth2: [] }],
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
    description: 'Post XML data with OAuth2',
    tags: ['OAuth2'],
    security: [{ oauth2: [] }],
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

export default async function oauth2Routes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', oauth2Middleware);

  fastify.get('/json', jsonResponseSchema, oauth2Controller.getJson);
  fastify.get('/text', textResponseSchema, oauth2Controller.getText);
  fastify.get('/xml', xmlResponseSchema, oauth2Controller.getXml);
  fastify.post('/json', postJsonSchema, oauth2Controller.postJson);
  fastify.post('/form', postFormSchema, oauth2Controller.postForm);
  fastify.post('/xml', postXmlSchema, oauth2Controller.postXml);
}
