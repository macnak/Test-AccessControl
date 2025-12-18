import { FastifyInstance } from 'fastify';
import { apiKeyMiddleware } from '../middleware/api-key.middleware';
import { uploadController } from '../controllers/upload.controller';

export default async function uploadRoutes(fastify: FastifyInstance) {
  // Using API Key authentication for upload endpoints
  fastify.addHook('preHandler', apiKeyMiddleware);

  fastify.post(
    '/single',
    {
      schema: {
        description: 'Upload a single file',
        tags: ['File Upload'],
        security: [{ apiKey: [] }],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              file: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    uploadController.uploadSingle,
  );

  fastify.post(
    '/multiple',
    {
      schema: {
        description: 'Upload multiple files',
        tags: ['File Upload'],
        security: [{ apiKey: [] }],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              files: { type: 'array' },
            },
          },
        },
      },
    },
    uploadController.uploadMultiple,
  );

  fastify.post(
    '/with-fields',
    {
      schema: {
        description: 'Upload files with additional form fields',
        tags: ['File Upload'],
        security: [{ apiKey: [] }],
        consumes: ['multipart/form-data'],
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              fields: { type: 'object', additionalProperties: true },
              files: { type: 'array' },
            },
          },
        },
      },
    },
    uploadController.uploadWithFields,
  );
}
