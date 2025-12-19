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
          receivedData: { type: 'object', additionalProperties: true },
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
          receivedData: { type: 'object', additionalProperties: true },
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
          updatedData: { type: 'object', additionalProperties: true },
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

// Additional GET endpoints with various response types
const htmlResponseSchema = {
  schema: {
    description: 'Get HTML response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const csvResponseSchema = {
  schema: {
    description: 'Get CSV response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const binaryResponseSchema = {
  schema: {
    description: 'Get binary/file response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const arrayResponseSchema = {
  schema: {
    description: 'Get array response with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
        },
      },
    },
  },
};

// POST endpoints with various JSON body structures
const postNestedJsonSchema = {
  schema: {
    description: 'Post nested JSON data with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            age: { type: 'number' },
          },
        },
        preferences: {
          type: 'object',
          properties: {
            theme: { type: 'string' },
            notifications: { type: 'boolean' },
          },
        },
      },
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

const postArrayJsonSchema = {
  schema: {
    description: 'Post array of items with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              quantity: { type: 'number' },
            },
          },
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          itemCount: { type: 'number' },
          receivedData: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

const postComplexJsonSchema = {
  schema: {
    description: 'Post complex JSON data with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    body: {
      type: 'object',
      properties: {
        metadata: {
          type: 'object',
          properties: {
            timestamp: { type: 'string' },
            version: { type: 'string' },
          },
        },
        payload: {
          type: 'object',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          processed: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

// Endpoints with path parameters
const getUserByIdSchema = {
  schema: {
    description: 'Get user by ID with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
      },
      required: ['userId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          user: { type: 'object' },
        },
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
      },
    },
  },
};

const getProductByIdSchema = {
  schema: {
    description: 'Get product by ID with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        productId: { type: 'string' },
      },
      required: ['productId'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          product: { type: 'object' },
        },
      },
      404: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
        },
      },
    },
  },
};

const updateResourceByIdSchema = {
  schema: {
    description: 'Update resource by ID with Bearer Token (PUT)',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        resourceId: { type: 'string' },
      },
      required: ['resourceId'],
    },
    body: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        status: { type: 'string' },
        data: { type: 'object', additionalProperties: true },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          resourceId: { type: 'string' },
          updatedData: { type: 'object', additionalProperties: true },
        },
      },
    },
  },
};

const getCategoryItemsSchema = {
  schema: {
    description: 'Get items by category with Bearer Token',
    tags: ['Bearer Token'],
    security: [{ bearerAuth: [] }],
    params: {
      type: 'object',
      properties: {
        category: { type: 'string' },
      },
      required: ['category'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          category: { type: 'string' },
          items: { type: 'array' },
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

    // Existing endpoints
    authenticatedRoutes.get('/json', jsonResponseSchema, bearerTokenController.getJson);
    authenticatedRoutes.get('/text', textResponseSchema, bearerTokenController.getText);
    authenticatedRoutes.get('/xml', xmlResponseSchema, bearerTokenController.getXml);
    authenticatedRoutes.post('/json', postJsonSchema, bearerTokenController.postJson);
    authenticatedRoutes.post('/form', postFormSchema, bearerTokenController.postForm);
    authenticatedRoutes.post('/xml', postXmlSchema, bearerTokenController.postXml);
    authenticatedRoutes.patch('/data', patchSchema, bearerTokenController.patchData);
    authenticatedRoutes.delete('/data/:id', deleteSchema, bearerTokenController.deleteData);

    // Additional GET endpoints with various response formats
    authenticatedRoutes.get('/html', htmlResponseSchema, bearerTokenController.getHtml);
    authenticatedRoutes.get('/csv', csvResponseSchema, bearerTokenController.getCsv);
    authenticatedRoutes.get('/binary', binaryResponseSchema, bearerTokenController.getBinary);
    authenticatedRoutes.get('/array', arrayResponseSchema, bearerTokenController.getArray);

    // Additional POST endpoints with various JSON body structures
    authenticatedRoutes.post(
      '/nested-json',
      postNestedJsonSchema,
      bearerTokenController.postNestedJson,
    );
    authenticatedRoutes.post(
      '/array-json',
      postArrayJsonSchema,
      bearerTokenController.postArrayJson,
    );
    authenticatedRoutes.post(
      '/complex-json',
      postComplexJsonSchema,
      bearerTokenController.postComplexJson,
    );

    // Endpoints with path parameters
    authenticatedRoutes.get('/users/:userId', getUserByIdSchema, bearerTokenController.getUserById);
    authenticatedRoutes.get(
      '/products/:productId',
      getProductByIdSchema,
      bearerTokenController.getProductById,
    );
    authenticatedRoutes.put(
      '/resources/:resourceId',
      updateResourceByIdSchema,
      bearerTokenController.updateResourceById,
    );
    authenticatedRoutes.get(
      '/categories/:category/items',
      getCategoryItemsSchema,
      bearerTokenController.getCategoryItems,
    );
  });
}
