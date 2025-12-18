import { FastifyRequest, FastifyReply } from 'fastify';
import { sampleUsers, sampleProducts } from '../config/sample-data';
import { userAccounts, pendingAuthRequests, validatedBearerTokens } from '../config/credentials';
import crypto from 'crypto';

interface LoginBody {
  email: string;
  password: string;
}

interface ValidateBody {
  token: string;
  code: string;
}

interface UpdateBody {
  name?: string;
  value?: string;
}

export const bearerTokenController = {
  // Login endpoint - no auth required
  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    // Find user account
    const user = userAccounts.find((u) => u.email === email && u.password === password);

    if (!user) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Generate temporary token and verification code
    const tempToken = `temp-${crypto.randomBytes(16).toString('hex')}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store pending auth request
    pendingAuthRequests.set(tempToken, {
      tempToken,
      code,
      email,
      expiresAt,
    });

    return reply.send({
      success: true,
      message: 'Login successful. Please validate with the provided code.',
      token: tempToken,
      code,
      expiresIn: 300, // seconds
    });
  },

  // Validate endpoint - validates temp token + code, returns real bearer token
  async validate(request: FastifyRequest<{ Body: ValidateBody }>, reply: FastifyReply) {
    const { token, code } = request.body;

    if (!token || !code) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Token and code are required',
      });
    }

    // Check if pending auth exists
    const pending = pendingAuthRequests.get(token);

    if (!pending) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Check if expired
    if (Date.now() > pending.expiresAt) {
      pendingAuthRequests.delete(token);
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Token has expired',
      });
    }

    // Validate code
    if (pending.code !== code) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid verification code',
      });
    }

    // Generate real bearer token
    const bearerToken = `bearer-${crypto.randomBytes(24).toString('hex')}`;
    validatedBearerTokens.add(bearerToken);

    // Clean up pending auth
    pendingAuthRequests.delete(token);

    return reply.send({
      success: true,
      message: 'Validation successful',
      bearerToken,
      tokenType: 'Bearer',
    });
  },

  // JSON Response
  async getJson(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Authenticated with Bearer Token',
      data: { users: sampleUsers.slice(0, 2), products: sampleProducts.slice(0, 2) },
    });
  },

  // Plain Text Response
  async getText(_request: FastifyRequest, reply: FastifyReply) {
    return reply
      .type('text/plain')
      .send('Successfully authenticated with Bearer Token - Plain Text Response');
  },

  // XML Response
  async getXml(_request: FastifyRequest, reply: FastifyReply) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>Authenticated with Bearer Token</message>
</response>`;
    return reply.type('application/xml').send(xml);
  },

  // POST with JSON Body
  async postJson(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Data received with Bearer Token',
      receivedData: request.body,
    });
  },

  // POST with Form URL Encoded
  async postForm(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Form data received with Bearer Token',
      receivedData: request.body,
    });
  },

  // POST with XML Body
  async postXml(request: FastifyRequest, reply: FastifyReply) {
    const receivedXml = request.body as string;
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>XML data received with Bearer Token</message>
  <receivedData><![CDATA[${receivedXml}]]></receivedData>
</response>`;
    return reply.type('application/xml').send(responseXml);
  },

  // PATCH - Update data
  async patchData(request: FastifyRequest<{ Body: UpdateBody }>, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Data updated with Bearer Token',
      updatedData: request.body,
    });
  },

  // DELETE - Delete resource
  async deleteData(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    return reply.send({
      success: true,
      message: `Resource ${id} deleted with Bearer Token`,
      deletedId: id,
    });
  },
};
