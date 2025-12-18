import { FastifyInstance } from 'fastify';
import { bearerTokenMiddleware } from '../middleware/bearer-token.middleware';
import { bearerTokenController } from '../controllers/bearer-token.controller';

const loginSchema = {
  schema: {
    description: 'Login with email and password to get temporary token and verification code',
    tags: ['Bearer Token'],
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          token: { type: 'string' },
          code: { type: 'string' },
          expiresIn: { type: 'number' },
        },
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      401: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const validateSchema = {
  schema: {
    description: 'Validate temporary token and code to receive bearer token',
    tags: ['Bearer Token'],
    body: {
      type: 'object',
      required: ['token', 'code'],
      properties: {
        token: { type: 'string' },
        code: { type: 'string' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          bearerToken: { type: 'string' },
          tokenType: { type: 'string' },
        },
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
      401: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
};

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
        type: 'string',
      },
    },
  },
};

const patchSchema = {
  schema: {
    description: 'Update data with Bearer Token (PATCH)',
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
          updatedData: { type: 'object' },
        },
      },
    },
  },
};

const deleteSchema = {
  schema: {
    description: 'Delete resource with Bearer Token (DELETE)',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          deletedId: { type: 'string' },
        },
      },
    },
  },
};

export default async function bearerTokenRoutes(fastify: FastifyInstance) {
  // Public auth endpoints (no middleware)
  fastify.post('/login', loginSchema, bearerTokenController.login);
  fastify.post('/validate', validateSchema, bearerTokenController.validate);

  // Protected endpoints (with bearer token middleware)
  fastify.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook('preHandler', bearerTokenMiddleware);

    authenticatedRoutes.get('/json', jsonResponseSchema, bearerTokenController.getJson);
    authenticatedRoutes.get('/text', textResponseSchema, bearerTokenController.getText);
    authenticatedRoutes.get('/xml', xmlResponseSchema, bearerTokenController.getXml);
    authenticatedRoutes.post('/json', postJsonSchema, bearerTokenController.postJson);
    authenticatedRoutes.post('/form', postFormSchema, bearerTokenController.postForm);
    authenticatedRoutes.post('/xml', postXmlSchema, bearerTokenController.postXml);
    authenticatedRoutes.patch('/data', patchSchema, bearerTokenController.patchData);
    authenticatedRoutes.delete('/data/:id', deleteSchema, bearerTokenController.deleteData);
  });
}
