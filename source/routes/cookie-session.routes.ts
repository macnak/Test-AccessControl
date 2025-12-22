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

// Validation endpoints - GET with query parameters
const validateDatesSchema = {
  schema: {
    description: 'Test date parameter validation with multiple formats',
    tags: ['Cookie Session - Validation'],
    querystring: {
      type: 'object',
      properties: {
        isoDate: {
          type: 'string',
          format: 'date-time',
          description: 'ISO 8601 date-time format (e.g., 2024-12-21T10:30:00Z)',
        },
        dateOnly: {
          type: 'string',
          format: 'date',
          description: 'Date only format (e.g., 2024-12-21)',
        },
        timestamp: {
          type: 'integer',
          description: 'Unix timestamp in seconds',
          minimum: 0,
        },
        customFormat: {
          type: 'string',
          pattern: '^(0[1-9]|1[0-2])/(0[1-9]|[12][0-9]|3[01])/\\d{4}$',
          description: 'MM/DD/YYYY format',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
          parsed: { type: 'object' },
        },
      },
    },
  },
};

const validateNumbersSchema = {
  schema: {
    description: 'Test number parameter validation with constraints',
    tags: ['Cookie Session - Validation'],
    querystring: {
      type: 'object',
      properties: {
        integer: {
          type: 'integer',
          description: 'Standard integer',
        },
        positiveInt: {
          type: 'integer',
          minimum: 1,
          description: 'Positive integer (>= 1)',
        },
        rangeInt: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          description: 'Integer between 1 and 100',
        },
        decimal: {
          type: 'number',
          description: 'Decimal number',
        },
        percentage: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          multipleOf: 0.01,
          description: 'Percentage (0-100 with 2 decimal places)',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
          types: { type: 'object' },
        },
      },
    },
  },
};

const validateUuidSchema = {
  schema: {
    description: 'Test UUID validation in path and query',
    tags: ['Cookie Session - Validation'],
    params: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: 'UUID v4 format',
        },
      },
      required: ['id'],
    },
    querystring: {
      type: 'object',
      properties: {
        correlationId: {
          type: 'string',
          format: 'uuid',
          description: 'Optional correlation UUID',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          id: { type: 'string' },
          correlationId: { type: 'string' },
          isValidUuid: { type: 'boolean' },
        },
      },
    },
  },
};

const validateEnumsSchema = {
  schema: {
    description: 'Test enum validation for strings and integers',
    tags: ['Cookie Session - Validation'],
    querystring: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['pending', 'active', 'inactive', 'archived'],
          description: 'Status enum',
        },
        priority: {
          type: 'integer',
          enum: [1, 2, 3, 4, 5],
          description: 'Priority level (1-5)',
        },
        color: {
          type: 'string',
          enum: ['red', 'green', 'blue', 'yellow'],
          description: 'Color enum',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
        },
      },
    },
  },
};

const validateConstraintsSchema = {
  schema: {
    description: 'Test string constraints (length, pattern, format)',
    tags: ['Cookie Session - Validation'],
    querystring: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          format: 'email',
          description: 'Email address',
        },
        username: {
          type: 'string',
          minLength: 3,
          maxLength: 20,
          pattern: '^[a-zA-Z0-9_-]+$',
          description: 'Username (3-20 chars, alphanumeric with _ -)',
        },
        zipCode: {
          type: 'string',
          pattern: '^\\d{5}(-\\d{4})?$',
          description: 'US ZIP code (5 or 9 digits)',
        },
        url: {
          type: 'string',
          format: 'uri',
          description: 'Valid URL',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
          validated: { type: 'object' },
        },
      },
    },
  },
};

const validateArraysSchema = {
  schema: {
    description: 'Test array parameter validation',
    tags: ['Cookie Session - Validation'],
    querystring: {
      type: 'object',
      properties: {
        tags: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: 10,
          description: 'Array of tags (1-10 items)',
        },
        ids: {
          type: 'array',
          items: { type: 'integer' },
          uniqueItems: true,
          description: 'Array of unique integer IDs',
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
          counts: { type: 'object' },
        },
      },
    },
  },
};

// POST endpoints with body validation
const postValidateDatesSchema = {
  schema: {
    description: 'Test date validation in POST body',
    tags: ['Cookie Session - Validation'],
    body: {
      type: 'object',
      required: ['eventDate'],
      properties: {
        eventDate: {
          type: 'string',
          format: 'date-time',
          description: 'Event date-time',
        },
        startDate: {
          type: 'string',
          format: 'date',
        },
        endDate: {
          type: 'string',
          format: 'date',
        },
        timestamp: {
          type: 'integer',
          minimum: 0,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
          parsed: { type: 'object' },
        },
      },
    },
  },
};

const postValidateNumbersSchema = {
  schema: {
    description: 'Test number validation in POST body with constraints',
    tags: ['Cookie Session - Validation'],
    body: {
      type: 'object',
      required: ['quantity', 'price'],
      properties: {
        quantity: {
          type: 'integer',
          minimum: 1,
          maximum: 1000,
          description: 'Order quantity',
        },
        price: {
          type: 'number',
          minimum: 0.01,
          description: 'Price (must be positive)',
        },
        discount: {
          type: 'number',
          minimum: 0,
          maximum: 100,
          multipleOf: 0.5,
          description: 'Discount percentage',
        },
        rating: {
          type: 'number',
          minimum: 0,
          maximum: 5,
          multipleOf: 0.1,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          calculated: { type: 'object' },
        },
      },
    },
  },
};

const postValidateComplexSchema = {
  schema: {
    description: 'Test complex object validation with nested structures',
    tags: ['Cookie Session - Validation'],
    body: {
      type: 'object',
      required: ['userId', 'profile'],
      properties: {
        userId: {
          type: 'string',
          format: 'uuid',
        },
        profile: {
          type: 'object',
          required: ['name', 'email'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
            },
            age: {
              type: 'integer',
              minimum: 18,
              maximum: 120,
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'pending'],
            },
          },
        },
        preferences: {
          type: 'object',
          properties: {
            notifications: { type: 'boolean' },
            theme: {
              type: 'string',
              enum: ['light', 'dark', 'auto'],
            },
          },
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          maxItems: 20,
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { type: 'object' },
          validated: { type: 'boolean' },
        },
      },
    },
  },
};

const postValidateEnumsSchema = {
  schema: {
    description: 'Test enum validation in POST body',
    tags: ['Cookie Session - Validation'],
    body: {
      type: 'object',
      required: ['status', 'priority'],
      properties: {
        status: {
          type: 'string',
          enum: ['draft', 'pending', 'approved', 'rejected', 'published'],
        },
        priority: {
          type: 'integer',
          enum: [1, 2, 3, 4, 5],
        },
        category: {
          type: 'string',
          enum: ['bug', 'feature', 'enhancement', 'documentation'],
        },
        severity: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
        },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          received: { type: 'object' },
        },
      },
    },
  },
};

// XML endpoints with validation
const postValidateXmlSchema = {
  schema: {
    description: 'Test XML body validation with constraints',
    tags: ['Cookie Session - Validation'],
    consumes: ['application/xml', 'text/xml'],
    body: {
      type: 'string',
      description: 'XML payload',
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          parsed: { type: 'object' },
          validated: { type: 'boolean' },
        },
      },
    },
  },
};

const getValidateXmlSchema = {
  schema: {
    description: 'Test XML response with query parameters',
    tags: ['Cookie Session - Validation'],
    produces: ['application/xml'],
    querystring: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['compact', 'pretty'],
          default: 'pretty',
        },
        includeMetadata: {
          type: 'boolean',
          default: false,
        },
        recordId: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
    response: {
      200: {
        type: 'string',
        description: 'XML response',
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

    // Validation endpoints - GET with query parameters
    authenticatedRoutes.get(
      '/validate/dates',
      validateDatesSchema,
      cookieSessionController.validateDates,
    );
    authenticatedRoutes.get(
      '/validate/numbers',
      validateNumbersSchema,
      cookieSessionController.validateNumbers,
    );
    authenticatedRoutes.get(
      '/validate/uuid/:id',
      validateUuidSchema,
      cookieSessionController.validateUuid,
    );
    authenticatedRoutes.get(
      '/validate/enums',
      validateEnumsSchema,
      cookieSessionController.validateEnums,
    );
    authenticatedRoutes.get(
      '/validate/constraints',
      validateConstraintsSchema,
      cookieSessionController.validateConstraints,
    );
    authenticatedRoutes.get(
      '/validate/arrays',
      validateArraysSchema,
      cookieSessionController.validateArrays,
    );

    // Validation endpoints - POST with body validation
    authenticatedRoutes.post(
      '/validate/dates',
      postValidateDatesSchema,
      cookieSessionController.postValidateDates,
    );
    authenticatedRoutes.post(
      '/validate/numbers',
      postValidateNumbersSchema,
      cookieSessionController.postValidateNumbers,
    );
    authenticatedRoutes.post(
      '/validate/complex',
      postValidateComplexSchema,
      cookieSessionController.postValidateComplex,
    );
    authenticatedRoutes.post(
      '/validate/enums',
      postValidateEnumsSchema,
      cookieSessionController.postValidateEnums,
    );

    // XML validation endpoints
    authenticatedRoutes.post(
      '/validate/xml',
      postValidateXmlSchema,
      cookieSessionController.postValidateXml,
    );
    authenticatedRoutes.get(
      '/validate/xml',
      getValidateXmlSchema,
      cookieSessionController.getValidateXml,
    );
  });
}
