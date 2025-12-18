import { FastifyRequest, FastifyReply } from 'fastify';
import { sampleUsers, sampleProducts } from '../config/sample-data';
import { userAccounts, pendingCookieAuth, validatedSessionCookies } from '../config/credentials';
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

export const cookieSessionController = {
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
    const tempToken = `temp-cookie-${crypto.randomBytes(16).toString('hex')}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store pending auth request
    pendingCookieAuth.set(tempToken, {
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

  // Validate endpoint - validates temp token + code, sets session cookie
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
    const pending = pendingCookieAuth.get(token);

    if (!pending) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Check if expired
    if (Date.now() > pending.expiresAt) {
      pendingCookieAuth.delete(token);
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

    // Generate session cookie
    const sessionId = `session-${crypto.randomBytes(24).toString('hex')}`;
    validatedSessionCookies.add(sessionId);

    // Clean up pending auth
    pendingCookieAuth.delete(token);

    // Set the session cookie
    reply.setCookie('sessionId', sessionId, {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      sameSite: 'lax',
      maxAge: 3600, // 1 hour
      path: '/',
    });

    return reply.send({
      success: true,
      message: 'Validation successful. Session cookie has been set.',
      sessionId,
      cookieName: 'sessionId',
    });
  },

  // Logout endpoint - clears session cookie
  async logout(request: FastifyRequest, reply: FastifyReply) {
    const sessionCookie = request.cookies.sessionId;

    if (sessionCookie) {
      validatedSessionCookies.delete(sessionCookie);
    }

    reply.clearCookie('sessionId', { path: '/' });

    return reply.send({
      success: true,
      message: 'Logged out successfully. Session cookie cleared.',
    });
  },

  // JSON Response
  async getJson(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Authenticated with Session Cookie',
      data: { users: sampleUsers.slice(0, 2), products: sampleProducts.slice(0, 2) },
    });
  },

  // Plain Text Response
  async getText(_request: FastifyRequest, reply: FastifyReply) {
    return reply
      .type('text/plain')
      .send('Successfully authenticated with Session Cookie - Plain Text Response');
  },

  // XML Response
  async getXml(_request: FastifyRequest, reply: FastifyReply) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>Authenticated with Session Cookie</message>
</response>`;
    return reply.type('application/xml').send(xml);
  },

  // HTML Response
  async getHtml(_request: FastifyRequest, reply: FastifyReply) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Session Cookie Response</title>
</head>
<body>
  <h1>Successfully authenticated with Session Cookie</h1>
  <p>This is an HTML response demonstrating cookie-based authentication.</p>
  <ul>
    <li>Status: Authenticated</li>
    <li>Method: GET</li>
    <li>Format: HTML</li>
    <li>Auth Type: Session Cookie</li>
  </ul>
</body>
</html>`;
    return reply.type('text/html').send(html);
  },

  // CSV Response
  async getCsv(_request: FastifyRequest, reply: FastifyReply) {
    const csv = `id,name,email,status
1,John Doe,john@example.com,active
2,Jane Smith,jane@example.com,active
3,Bob Johnson,bob@example.com,inactive
4,Alice Williams,alice@example.com,active`;
    return reply.type('text/csv').send(csv);
  },

  // Binary Response
  async getBinary(_request: FastifyRequest, reply: FastifyReply) {
    const buffer = Buffer.from(
      'This is simulated binary data for Cookie Session authentication',
      'utf-8',
    );
    return reply
      .type('application/octet-stream')
      .header('Content-Disposition', 'attachment; filename=\"data.bin\"')
      .send(buffer);
  },

  // Array Response
  async getArray(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send([
      { id: 1, name: 'Item One', category: 'electronics', price: 299.99 },
      { id: 2, name: 'Item Two', category: 'books', price: 19.99 },
      { id: 3, name: 'Item Three', category: 'clothing', price: 49.99 },
      { id: 4, name: 'Item Four', category: 'electronics', price: 599.99 },
    ]);
  },

  // POST with JSON Body
  async postJson(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Data received with Session Cookie',
      receivedData: request.body,
    });
  },

  // POST with Nested JSON
  async postNestedJson(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    return reply.send({
      success: true,
      message: 'Nested JSON data received with Session Cookie',
      receivedData: data,
      summary: {
        hasUser: !!data.user,
        hasPreferences: !!data.preferences,
        userName: data.user?.name || 'unknown',
      },
    });
  },

  // POST with Array JSON
  async postArrayJson(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    const items = data.items || [];
    return reply.send({
      success: true,
      message: 'Array data received with Session Cookie',
      itemCount: items.length,
      receivedData: data,
      totalQuantity: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
    });
  },

  // POST with Complex JSON
  async postComplexJson(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    return reply.send({
      success: true,
      message: 'Complex JSON data processed with Session Cookie',
      processed: {
        receivedAt: new Date().toISOString(),
        metadata: data.metadata,
        payloadKeys: data.payload ? Object.keys(data.payload) : [],
        tagCount: data.tags ? data.tags.length : 0,
        originalData: data,
      },
    });
  },

  // POST with Form Data
  async postForm(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Form data received with Session Cookie',
      receivedData: request.body,
    });
  },

  // POST with XML Body
  async postXml(request: FastifyRequest, reply: FastifyReply) {
    const receivedXml = request.body as string;
    const responseXml = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>XML data received with Session Cookie</message>
  <receivedData><![CDATA[${receivedXml}]]></receivedData>
</response>`;
    return reply.type('application/xml').send(responseXml);
  },

  // PATCH - Update data
  async patchData(request: FastifyRequest<{ Body: UpdateBody }>, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Data updated with Session Cookie',
      updatedData: request.body,
    });
  },

  // DELETE - Delete resource
  async deleteData(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;
    return reply.send({
      success: true,
      message: `Resource ${id} deleted with Session Cookie`,
      deletedId: id,
    });
  },

  // Get user by ID
  async getUserById(request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
    const { userId } = request.params;
    const user = sampleUsers.find((u) => u.id.toString() === userId);

    if (!user) {
      return reply.code(404).send({
        success: false,
        error: `User with ID ${userId} not found`,
      });
    }

    return reply.send({
      success: true,
      user,
    });
  },

  // Get product by ID
  async getProductById(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    const { productId } = request.params;
    const product = sampleProducts.find((p) => p.id.toString() === productId);

    if (!product) {
      return reply.code(404).send({
        success: false,
        error: `Product with ID ${productId} not found`,
      });
    }

    return reply.send({
      success: true,
      product,
    });
  },

  // Update resource by ID
  async updateResourceById(
    request: FastifyRequest<{ Params: { resourceId: string }; Body: any }>,
    reply: FastifyReply,
  ) {
    const { resourceId } = request.params;
    const updateData = request.body;

    return reply.send({
      success: true,
      message: `Resource ${resourceId} updated successfully`,
      resourceId,
      updatedData: updateData,
      timestamp: new Date().toISOString(),
    });
  },

  // Get items by category
  async getCategoryItems(
    request: FastifyRequest<{ Params: { category: string } }>,
    reply: FastifyReply,
  ) {
    const { category } = request.params;
    const categoryItems = sampleProducts.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase(),
    );

    return reply.send({
      success: true,
      category,
      items: categoryItems,
      count: categoryItems.length,
    });
  },
};
