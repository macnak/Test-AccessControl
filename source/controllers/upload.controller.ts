import { FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export const uploadController = {
  // Single file upload
  async uploadSingle(request: FastifyRequest, reply: FastifyReply) {
    await ensureUploadDir();

    // Type assertion for multipart request
    const data = await (request as any).file();

    if (!data) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'No file uploaded',
      });
    }

    const filename = `${Date.now()}-${data.filename}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    await pipeline(data.file, createWriteStream(filepath));

    return reply.send({
      success: true,
      message: 'File uploaded successfully',
      file: {
        filename: data.filename,
        savedAs: filename,
        mimetype: data.mimetype,
        encoding: data.encoding,
      },
    });
  },

  // Multiple files upload
  async uploadMultiple(request: FastifyRequest, reply: FastifyReply) {
    await ensureUploadDir();

    // Type assertion for multipart request
    const parts = (request as any).parts();
    const uploadedFiles: any[] = [];

    for await (const part of parts) {
      if (part.type === 'file') {
        const filename = `${Date.now()}-${part.filename}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await pipeline(part.file, createWriteStream(filepath));

        uploadedFiles.push({
          filename: part.filename,
          savedAs: filename,
          mimetype: part.mimetype,
          encoding: part.encoding,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'No files uploaded',
      });
    }

    return reply.send({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles,
    });
  },

  // Upload with form fields
  async uploadWithFields(request: FastifyRequest, reply: FastifyReply) {
    await ensureUploadDir();

    // Type assertion for multipart request
    const parts = (request as any).parts();
    const uploadedFiles: any[] = [];
    const fields: Record<string, any> = {};

    for await (const part of parts) {
      if (part.type === 'file') {
        const filename = `${Date.now()}-${part.filename}`;
        const filepath = path.join(UPLOAD_DIR, filename);

        await pipeline(part.file, createWriteStream(filepath));

        uploadedFiles.push({
          filename: part.filename,
          savedAs: filename,
          mimetype: part.mimetype,
        });
      } else {
        // It's a field
        fields[part.fieldname] = (part as any).value;
      }
    }

    return reply.send({
      success: true,
      message: 'Data and files processed',
      fields,
      files: uploadedFiles,
    });
  },
};
