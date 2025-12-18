import { FastifyInstance } from 'fastify';
import { cookieSessionMiddleware } from '../middleware/cookie-session.middleware';
import { cookieSessionController } from '../controllers/cookie-session.controller';

const loginSchema = {
  schema: {
    description: 'Login with email and password to get temporary token and verification code',
    tags: ['Cookie Session'],
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
    description: 'Validate temporary token and code to receive session cookie',
    tags: ['Cookie Session'],
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
          sessionId: { type: 'string' },
          cookieName: { type: 'string' },
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

const logoutSchema = {
  schema: {
    description: 'Logout and clear session cookie',
    tags: ['Cookie Session'],
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
    },
  },
};

const jsonResponseSchema = {
  schema: {
    description: 'Get JSON response with Session Cookie',
    tags: ['Cookie Session'],
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
    description: 'Get plain text response with Session Cookie',
    tags: ['Cookie Session'],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const xmlResponseSchema = {
  schema: {
    description: 'Get XML response with Session Cookie',
    tags: ['Cookie Session'],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const htmlResponseSchema = {
  schema: {
    description: 'Get HTML response with Session Cookie',
    tags: ['Cookie Session'],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const csvResponseSchema = {
  schema: {
    description: 'Get CSV response with Session Cookie',
    tags: ['Cookie Session'],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const binaryResponseSchema = {
  schema: {
    description: 'Get binary/file response with Session Cookie',
    tags: ['Cookie Session'],
    response: {
      200: {
        type: 'string',
      },
    },
  },
};

const arrayResponseSchema = {
  schema: {
    description: 'Get array response with Session Cookie',
    tags: ['Cookie Session'],
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

const postJsonSchema = {
  schema: {
    description: 'Post JSON data with Session Cookie',
    tags: ['Cookie Session'],
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

const postNestedJsonSchema = {
  schema: {
    description: 'Post nested JSON data with Session Cookie',
    tags: ['Cookie Session'],
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
          receivedData: { type: 'object' },
        },
      },
    },
  },
};

const postArrayJsonSchema = {
  schema: {
    description: 'Post array of items with Session Cookie',
    tags: ['Cookie Session'],
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
          receivedData: { type: 'object' },
        },
      },
    },
  },
};

const postComplexJsonSchema = {
  schema: {
    description: 'Post complex JSON data with Session Cookie',
    tags: ['Cookie Session'],
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
          processed: { type: 'object' },
        },
      },
    },
  },
};

const postFormSchema = {
  schema: {
    description: 'Post form data with Session Cookie',
    tags: ['Cookie Session'],
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
    description: 'Post XML data with Session Cookie',
    tags: ['Cookie Session'],
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
    description: 'Update data with Session Cookie (PATCH)',
    tags: ['Cookie Session'],
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
    description: 'Delete resource with Session Cookie (DELETE)',
    tags: ['Cookie Session'],
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

const getUserByIdSchema = {
  schema: {
    description: 'Get user by ID with Session Cookie',
    tags: ['Cookie Session'],
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
    description: 'Get product by ID with Session Cookie',
    tags: ['Cookie Session'],
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
    description: 'Update resource by ID with Session Cookie (PUT)',
    tags: ['Cookie Session'],
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
        data: { type: 'object' },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          resourceId: { type: 'string' },
          updatedData: { type: 'object' },
        },
      },
    },
  },
};

const getCategoryItemsSchema = {
  schema: {
    description: 'Get items by category with Session Cookie',
    tags: ['Cookie Session'],
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

export default async function cookieSessionRoutes(fastify: FastifyInstance) {
  // Public auth endpoints (no middleware)
  fastify.post('/login', loginSchema, cookieSessionController.login);
  fastify.post('/validate', validateSchema, cookieSessionController.validate);
  fastify.post('/logout', logoutSchema, cookieSessionController.logout);

  // Protected endpoints (with cookie session middleware)
  fastify.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook('preHandler', cookieSessionMiddleware);

    // GET endpoints with various response formats
    authenticatedRoutes.get('/json', jsonResponseSchema, cookieSessionController.getJson);
    authenticatedRoutes.get('/text', textResponseSchema, cookieSessionController.getText);
    authenticatedRoutes.get('/xml', xmlResponseSchema, cookieSessionController.getXml);
    authenticatedRoutes.get('/html', htmlResponseSchema, cookieSessionController.getHtml);
    authenticatedRoutes.get('/csv', csvResponseSchema, cookieSessionController.getCsv);
    authenticatedRoutes.get('/binary', binaryResponseSchema, cookieSessionController.getBinary);
    authenticatedRoutes.get('/array', arrayResponseSchema, cookieSessionController.getArray);

    // POST endpoints with various JSON body structures
    authenticatedRoutes.post('/json', postJsonSchema, cookieSessionController.postJson);
    authenticatedRoutes.post(
      '/nested-json',
      postNestedJsonSchema,
      cookieSessionController.postNestedJson,
    );
    authenticatedRoutes.post(
      '/array-json',
      postArrayJsonSchema,
      cookieSessionController.postArrayJson,
    );
    authenticatedRoutes.post(
      '/complex-json',
      postComplexJsonSchema,
      cookieSessionController.postComplexJson,
    );
    authenticatedRoutes.post('/form', postFormSchema, cookieSessionController.postForm);
    authenticatedRoutes.post('/xml', postXmlSchema, cookieSessionController.postXml);

    // Update and delete operations
    authenticatedRoutes.patch('/data', patchSchema, cookieSessionController.patchData);
    authenticatedRoutes.delete('/data/:id', deleteSchema, cookieSessionController.deleteData);

    // Endpoints with path parameters
    authenticatedRoutes.get(
      '/users/:userId',
      getUserByIdSchema,
      cookieSessionController.getUserById,
    );
    authenticatedRoutes.get(
      '/products/:productId',
      getProductByIdSchema,
      cookieSessionController.getProductById,
    );
    authenticatedRoutes.put(
      '/resources/:resourceId',
      updateResourceByIdSchema,
      cookieSessionController.updateResourceById,
    );
    authenticatedRoutes.get(
      '/categories/:category/items',
      getCategoryItemsSchema,
      cookieSessionController.getCategoryItems,
    );
  });
}
