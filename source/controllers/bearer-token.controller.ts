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

  // Additional GET endpoints with various response formats
  async getHtml(_request: FastifyRequest, reply: FastifyReply) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Bearer Token Response</title>
</head>
<body>
  <h1>Successfully authenticated with Bearer Token</h1>
  <p>This is an HTML response demonstrating various content types.</p>
  <ul>
    <li>Status: Authenticated</li>
    <li>Method: GET</li>
    <li>Format: HTML</li>
  </ul>
</body>
</html>`;
    return reply.type('text/html').send(html);
  },

  async getCsv(_request: FastifyRequest, reply: FastifyReply) {
    const csv = `id,name,email,status
1,John Doe,john@example.com,active
2,Jane Smith,jane@example.com,active
3,Bob Johnson,bob@example.com,inactive
4,Alice Williams,alice@example.com,active`;
    return reply.type('text/csv').send(csv);
  },

  async getBinary(_request: FastifyRequest, reply: FastifyReply) {
    // Simulate a simple binary file (e.g., a small image or data)
    const buffer = Buffer.from(
      'This is simulated binary data for Bearer Token authentication',
      'utf-8',
    );
    return reply
      .type('application/octet-stream')
      .header('Content-Disposition', 'attachment; filename="data.bin"')
      .send(buffer);
  },

  async getArray(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send([
      { id: 1, name: 'Item One', category: 'electronics', price: 299.99 },
      { id: 2, name: 'Item Two', category: 'books', price: 19.99 },
      { id: 3, name: 'Item Three', category: 'clothing', price: 49.99 },
      { id: 4, name: 'Item Four', category: 'electronics', price: 599.99 },
    ]);
  },

  // Additional POST endpoints with various JSON body structures
  async postNestedJson(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    return reply.send({
      success: true,
      message: 'Nested JSON data received with Bearer Token',
      receivedData: data,
      summary: {
        hasUser: !!data.user,
        hasPreferences: !!data.preferences,
        userName: data.user?.name || 'unknown',
      },
    });
  },

  async postArrayJson(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    const items = data.items || [];
    return reply.send({
      success: true,
      message: 'Array data received with Bearer Token',
      itemCount: items.length,
      receivedData: data,
      totalQuantity: items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
    });
  },

  async postComplexJson(request: FastifyRequest, reply: FastifyReply) {
    const data = request.body as any;
    return reply.send({
      success: true,
      message: 'Complex JSON data processed with Bearer Token',
      processed: {
        receivedAt: new Date().toISOString(),
        metadata: data.metadata,
        payloadKeys: data.payload ? Object.keys(data.payload) : [],
        tagCount: data.tags ? data.tags.length : 0,
        originalData: data,
      },
    });
  },

  // Endpoints with path parameters
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

  // Validation endpoints - GET with query parameters
  async validateDates(
    request: FastifyRequest<{
      Querystring: {
        isoDate?: string;
        dateOnly?: string;
        timestamp?: number;
        customFormat?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { isoDate, dateOnly, timestamp, customFormat } = request.query;

    const parsed: any = {};
    if (isoDate) {
      parsed.isoDate = {
        original: isoDate,
        parsed: new Date(isoDate).toISOString(),
        valid: !isNaN(new Date(isoDate).getTime()),
      };
    }
    if (dateOnly) {
      parsed.dateOnly = {
        original: dateOnly,
        parsed: new Date(dateOnly).toISOString(),
        valid: !isNaN(new Date(dateOnly).getTime()),
      };
    }
    if (timestamp) {
      parsed.timestamp = {
        original: timestamp,
        parsed: new Date(timestamp * 1000).toISOString(),
        valid: timestamp > 0,
      };
    }
    if (customFormat) {
      const parts = customFormat.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (parts) {
        const date = new Date(`${parts[3]}-${parts[1]}-${parts[2]}`);
        parsed.customFormat = {
          original: customFormat,
          parsed: date.toISOString(),
          valid: !isNaN(date.getTime()),
        };
      }
    }

    return reply.send({
      success: true,
      received: { isoDate, dateOnly, timestamp, customFormat },
      parsed,
    });
  },

  async validateNumbers(
    request: FastifyRequest<{
      Querystring: {
        integer?: number;
        positiveInt?: number;
        rangeInt?: number;
        decimal?: number;
        percentage?: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { integer, positiveInt, rangeInt, decimal, percentage } = request.query;

    const types: any = {};
    if (integer !== undefined)
      types.integer = {
        value: integer,
        type: typeof integer,
        isInteger: Number.isInteger(integer),
      };
    if (positiveInt !== undefined)
      types.positiveInt = {
        value: positiveInt,
        type: typeof positiveInt,
        isInteger: Number.isInteger(positiveInt),
      };
    if (rangeInt !== undefined)
      types.rangeInt = {
        value: rangeInt,
        type: typeof rangeInt,
        isInteger: Number.isInteger(rangeInt),
      };
    if (decimal !== undefined) types.decimal = { value: decimal, type: typeof decimal };
    if (percentage !== undefined) types.percentage = { value: percentage, type: typeof percentage };

    return reply.send({
      success: true,
      received: { integer, positiveInt, rangeInt, decimal, percentage },
      types,
    });
  },

  async validateUuid(
    request: FastifyRequest<{
      Params: { id: string };
      Querystring: { correlationId?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { id } = request.params;
    const { correlationId } = request.query;

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isValidUuid = uuidRegex.test(id);
    const isValidCorrelationId = correlationId ? uuidRegex.test(correlationId) : null;

    return reply.send({
      success: true,
      id,
      correlationId: correlationId || null,
      isValidUuid,
      isValidCorrelationId,
    });
  },

  async validateEnums(
    request: FastifyRequest<{
      Querystring: {
        status?: string;
        priority?: number;
        color?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { status, priority, color } = request.query;

    return reply.send({
      success: true,
      received: {
        status,
        priority,
        color,
      },
    });
  },

  async validateConstraints(
    request: FastifyRequest<{
      Querystring: {
        email?: string;
        username?: string;
        zipCode?: string;
        url?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { email, username, zipCode, url } = request.query;

    const validated: any = {};
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      validated.email = { value: email, valid: emailRegex.test(email) };
    }
    if (username) {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      validated.username = {
        value: username,
        valid: usernameRegex.test(username),
        length: username.length,
      };
    }
    if (zipCode) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      validated.zipCode = { value: zipCode, valid: zipRegex.test(zipCode) };
    }
    if (url) {
      try {
        new URL(url);
        validated.url = { value: url, valid: true };
      } catch {
        validated.url = { value: url, valid: false };
      }
    }

    return reply.send({
      success: true,
      received: { email, username, zipCode, url },
      validated,
    });
  },

  async validateArrays(
    request: FastifyRequest<{
      Querystring: {
        tags?: string[];
        ids?: number[];
      };
    }>,
    reply: FastifyReply,
  ) {
    const { tags, ids } = request.query;

    const counts: any = {};
    if (tags) {
      counts.tags = { count: Array.isArray(tags) ? tags.length : 1, items: tags };
    }
    if (ids) {
      const idArray = Array.isArray(ids) ? ids : [ids];
      const unique = [...new Set(idArray)];
      counts.ids = { count: idArray.length, uniqueCount: unique.length, items: idArray };
    }

    return reply.send({
      success: true,
      received: { tags, ids },
      counts,
    });
  },

  // POST validation endpoints
  async postValidateDates(
    request: FastifyRequest<{
      Body: {
        eventDate: string;
        startDate?: string;
        endDate?: string;
        timestamp?: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { eventDate, startDate, endDate, timestamp } = request.body;

    const parsed: any = {
      eventDate: {
        original: eventDate,
        parsed: new Date(eventDate).toISOString(),
        dayOfWeek: new Date(eventDate).toLocaleDateString('en-US', { weekday: 'long' }),
      },
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      parsed.dateRange = {
        start: start.toISOString(),
        end: end.toISOString(),
        durationDays: diffDays,
      };
    }

    if (timestamp) {
      parsed.timestamp = {
        original: timestamp,
        parsed: new Date(timestamp * 1000).toISOString(),
      };
    }

    return reply.send({
      success: true,
      received: request.body,
      parsed,
    });
  },

  async postValidateNumbers(
    request: FastifyRequest<{
      Body: {
        quantity: number;
        price: number;
        discount?: number;
        rating?: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { quantity, price, discount, rating } = request.body;

    const subtotal = quantity * price;
    const discountAmount = discount ? (subtotal * discount) / 100 : 0;
    const total = subtotal - discountAmount;

    return reply.send({
      success: true,
      data: request.body,
      calculated: {
        subtotal: parseFloat(subtotal.toFixed(2)),
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        averageRating: rating || 0,
      },
    });
  },

  async postValidateComplex(
    request: FastifyRequest<{
      Body: {
        userId: string;
        profile: {
          name: string;
          email: string;
          age?: number;
          status?: string;
        };
        preferences?: {
          notifications?: boolean;
          theme?: string;
        };
        tags?: string[];
      };
    }>,
    reply: FastifyReply,
  ) {
    const data = request.body;

    return reply.send({
      success: true,
      data,
      validated: true,
      metadata: {
        userId: data.userId,
        profileComplete: !!(data.profile.name && data.profile.email && data.profile.age),
        hasPreferences: !!data.preferences,
        tagCount: data.tags?.length || 0,
      },
    });
  },

  async postValidateEnums(
    request: FastifyRequest<{
      Body: {
        status: string;
        priority: number;
        category?: string;
        severity?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    return reply.send({
      success: true,
      received: request.body,
    });
  },

  async postValidateXml(request: FastifyRequest<{ Body: string }>, reply: FastifyReply) {
    const xmlBody = request.body;

    // Simple XML parsing simulation
    const parsed: any = {
      receivedLength: xmlBody.length,
      contentType: request.headers['content-type'],
      isXml: xmlBody.includes('<?xml') || xmlBody.includes('<'),
    };

    // Try to extract some basic info
    const rootMatch = xmlBody.match(/<(\w+)[^>]*>/);
    if (rootMatch) {
      parsed.rootElement = rootMatch[1];
    }

    return reply.send({
      success: true,
      parsed,
      validated: parsed.isXml,
    });
  },

  async getValidateXml(
    request: FastifyRequest<{
      Querystring: {
        format?: string;
        includeMetadata?: boolean;
        recordId?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const { format, includeMetadata, recordId } = request.query;

    const metadata = includeMetadata
      ? `  <metadata>\n    <timestamp>${new Date().toISOString()}</timestamp>\n    <version>1.0</version>\n  </metadata>\n`
      : '';

    const recordData = recordId
      ? `  <record id="${recordId}">\n    <name>Sample Record</name>\n    <status>active</status>\n  </record>\n`
      : '';

    const xml =
      format === 'compact'
        ? `<?xml version="1.0" encoding="UTF-8"?><response><success>true</success>${metadata ? `<metadata><timestamp>${new Date().toISOString()}</timestamp><version>1.0</version></metadata>` : ''}${recordData ? `<record id="${recordId}"><name>Sample Record</name><status>active</status></record>` : ''}</response>`
        : `<?xml version="1.0" encoding="UTF-8"?>\n<response>\n  <success>true</success>\n${metadata}${recordData}</response>`;

    return reply.type('application/xml').send(xml);
  },
};
