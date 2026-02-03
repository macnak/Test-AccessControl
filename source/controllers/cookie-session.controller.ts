import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabase } from '../database/database.service';
import { sampleUsers } from '../config/sample-data';
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

    const db = getDatabase();
    const user = db.getUserByEmail(email);

    if (!user || user.password !== password) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    // Generate temporary token and verification code
    const tempToken = `temp-cookie-${crypto.randomBytes(16).toString('hex')}`;
    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store pending auth request
    db.createPendingAuth(tempToken, code, email, expiresAt);

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

    const db = getDatabase();
    const pending = db.getPendingAuth(token);

    if (!pending) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
    }

    // Check if expired
    if (new Date() > new Date(pending.expires_at)) {
      db.deletePendingAuth(token);
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

    // Get user
    const user = db.getUserByEmail(pending.email);
    if (!user) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    // Generate session cookie
    const sessionId = `session-${crypto.randomBytes(24).toString('hex')}`;
    const sessionExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    db.createSession(sessionId, user.id, user.email, sessionExpiresAt);

    // Clean up pending auth
    db.deletePendingAuth(token);

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
      const db = getDatabase();
      db.deleteSession(sessionCookie);
    }

    reply.clearCookie('sessionId', { path: '/' });

    return reply.send({
      success: true,
      message: 'Logged out successfully. Session cookie cleared.',
    });
  },

  // Helper to get session
  getSessionFromRequest(request: FastifyRequest) {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) return null;

    const db = getDatabase();
    return db.getSession(sessionId);
  },

  // JSON Response
  async getJson(_request: FastifyRequest, reply: FastifyReply) {
    const db = getDatabase();
    const products = db.getProducts({ limit: 2 });

    return reply.send({
      success: true,
      message: 'Authenticated with Session Cookie',
      data: { users: sampleUsers.slice(0, 2), products },
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
      .header('Content-Disposition', 'attachment; filename="data.bin"')
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
    const db = getDatabase();
    const product = db.getProductById(parseInt(productId));

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
    const db = getDatabase();
    const categoryItems = db.getProducts({ category, limit: 100 });

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
      ? `  <metadata>
    <timestamp>${new Date().toISOString()}</timestamp>
    <version>1.0</version>
  </metadata>\n`
      : '';

    const recordData = recordId
      ? `  <record id="${recordId}">
    <name>Sample Record</name>
    <status>active</status>
  </record>\n`
      : '';

    const xml =
      format === 'compact'
        ? `<?xml version="1.0" encoding="UTF-8"?><response><success>true</success>${metadata ? `<metadata><timestamp>${new Date().toISOString()}</timestamp><version>1.0</version></metadata>` : ''}${recordData ? `<record id="${recordId}"><name>Sample Record</name><status>active</status></record>` : ''}</response>`
        : `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
${metadata}${recordData}</response>`;

    return reply.type('application/xml').send(xml);
  },

  // ========== SHOPPING WORKFLOW ENDPOINTS (DATABASE-BACKED) ==========

  // Get list of products with pagination
  async getProducts(
    request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
        category?: string;
        sortBy?: 'price' | 'name';
        sortOrder?: 'asc' | 'desc';
      };
    }>,
    reply: FastifyReply,
  ) {
    const { page = 1, limit = 10, category, sortBy = 'name', sortOrder = 'asc' } = request.query;

    const db = getDatabase();
    const offset = (page - 1) * limit;

    const products = db.getProducts({
      category,
      sortBy,
      sortOrder,
      limit,
      offset,
    });

    const totalProducts = db.getProductCount(category);

    return reply.send({
      success: true,
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      products,
    });
  },

  // Get product by ID
  async getProduct(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const productId = parseInt(request.params.id);
    const db = getDatabase();
    const product = db.getProductById(productId);

    if (!product) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: `Product with ID ${productId} not found`,
      });
    }

    return reply.send({
      success: true,
      product,
    });
  },

  // Get shopping cart
  async getCart(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();
    const cartItems = db.getCart(sessionId);

    // Enrich cart items with product details
    const enrichedItems = cartItems.map((item) => {
      const product = db.getProductById(item.product_id);
      return {
        productId: item.product_id,
        quantity: item.quantity,
        addedAt: item.added_at,
        productName: product?.name,
        productPrice: product?.price,
        subtotal: product ? product.price * item.quantity : 0,
      };
    });

    const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return reply.send({
      success: true,
      cart: {
        items: enrichedItems,
        itemCount: cartItems.length,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total: parseFloat(total.toFixed(2)),
      },
    });
  },

  // Add item to cart
  async addToCart(
    request: FastifyRequest<{
      Body: {
        productId: number;
        quantity: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const { productId, quantity } = request.body;

    if (!productId || !quantity || quantity < 1) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Valid productId and quantity (>= 1) are required',
      });
    }

    const db = getDatabase();

    // Verify product exists
    const product = db.getProductById(productId);
    if (!product) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: `Product with ID ${productId} not found`,
      });
    }

    db.addToCart(sessionId, productId, quantity);
    const cartItems = db.getCart(sessionId);

    // Enrich cart items with product details
    const enrichedItems = cartItems.map((item) => {
      const prod = db.getProductById(item.product_id);
      return {
        productId: item.product_id,
        quantity: item.quantity,
        addedAt: item.added_at,
        productName: prod?.name,
        productPrice: prod?.price,
        subtotal: prod ? prod.price * item.quantity : 0,
      };
    });

    const total = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0);

    return reply.send({
      success: true,
      message: `Added ${quantity} x ${product.name} to cart`,
      cart: {
        items: enrichedItems,
        itemCount: cartItems.length,
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total: parseFloat(total.toFixed(2)),
      },
    });
  },

  // Update cart item quantity
  async updateCartItem(
    request: FastifyRequest<{
      Params: { productId: string };
      Body: { quantity: number };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const productId = parseInt(request.params.productId);
    const { quantity } = request.body;

    if (quantity === undefined || quantity < 0) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Valid quantity (>= 0) is required',
      });
    }

    const db = getDatabase();
    db.updateCartItem(sessionId, productId, quantity);

    return reply.send({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart item updated',
    });
  },

  // Remove item from cart
  async removeFromCart(
    request: FastifyRequest<{ Params: { productId: string } }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const productId = parseInt(request.params.productId);

    const db = getDatabase();
    db.removeFromCart(sessionId, productId);

    return reply.send({
      success: true,
      message: 'Item removed from cart',
    });
  },

  // Clear cart
  async clearCart(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();
    db.clearCart(sessionId);

    return reply.send({
      success: true,
      message: 'Cart cleared',
    });
  },

  // Checkout - create order
  async checkout(
    request: FastifyRequest<{
      Body: {
        paymentMethodId?: string;
        shippingAddress?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const user = db.getUserById(session.user_id);
    if (!user) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'User not found',
      });
    }

    const cartItems = db.getCart(sessionId);
    if (cartItems.length === 0) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Cart is empty',
      });
    }

    const { paymentMethodId, shippingAddress } = request.body;

    // Calculate order details
    const orderItems: Array<{
      productId: number;
      productName: string;
      quantity: number;
      price: number;
    }> = [];
    let total = 0;

    for (const item of cartItems) {
      const product = db.getProductById(item.product_id)!;
      orderItems.push({
        productId: item.product_id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
      total += product.price * item.quantity;
    }

    // Create order
    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const order = db.createOrder(
      orderId,
      user.id,
      parseFloat(total.toFixed(2)),
      paymentMethodId || 'default',
      shippingAddress || user.address || 'No address provided',
      orderItems,
    );

    // Clear cart after successful checkout
    db.clearCart(sessionId);

    // Get order items for response
    const dbOrderItems = db.getOrderItems(orderId);

    // Simulate payment processing
    setTimeout(() => {
      db.updateOrderStatus(orderId, 'completed');
    }, 100);

    return reply.send({
      success: true,
      message: 'Order placed successfully',
      order: {
        orderId: order.id,
        userId: order.user_id,
        total: order.total,
        status: order.status,
        paymentMethod: order.payment_method,
        shippingAddress: order.shipping_address,
        items: dbOrderItems.map((item) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
        })),
        itemCount: dbOrderItems.length,
        totalItems: dbOrderItems.reduce((sum, item) => sum + item.quantity, 0),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: order.created_at,
      },
    });
  },

  // Get order history
  async getOrderHistory(
    request: FastifyRequest<{
      Querystring: {
        page?: number;
        limit?: number;
        status?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const { page = 1, limit = 10, status } = request.query;
    const offset = (page - 1) * limit;

    const orders = db.getUserOrders(session.user_id, { status, limit, offset });
    const totalOrders = db.getUserOrderCount(session.user_id, status);

    return reply.send({
      success: true,
      page,
      limit,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      orders,
    });
  },

  // Get order by ID
  async getOrder(request: FastifyRequest<{ Params: { orderId: string } }>, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const order = db.getOrder(request.params.orderId);

    if (!order || order.user_id !== session.user_id) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Order not found',
      });
    }

    const items = db.getOrderItems(order.id);

    return reply.send({
      success: true,
      order: {
        ...order,
        items,
      },
    });
  },

  // Get user profile
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const user = db.getUserById(session.user_id);

    if (!user) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'User not found',
      });
    }

    return reply.send({
      success: true,
      profile: {
        email: user.email,
        name: user.name,
        address: user.address,
        phone: user.phone,
      },
    });
  },

  // Update user profile
  async updateProfile(
    request: FastifyRequest<{
      Body: {
        name?: string;
        address?: string;
        phone?: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const { name, address, phone } = request.body;

    db.updateUser(session.user_id, { name, address, phone });
    const user = db.getUserById(session.user_id)!;

    return reply.send({
      success: true,
      message: 'Profile updated successfully',
      profile: {
        email: user.email,
        name: user.name,
        address: user.address,
        phone: user.phone,
      },
    });
  },

  // Get payment methods
  async getPaymentMethods(request: FastifyRequest, reply: FastifyReply) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const methods = db.getUserPaymentMethods(session.user_id);

    return reply.send({
      success: true,
      paymentMethods: methods,
    });
  },

  // Add payment method
  async addPaymentMethod(
    request: FastifyRequest<{
      Body: {
        type: 'credit_card' | 'debit_card' | 'paypal';
        last4?: string;
        expiryMonth?: number;
        expiryYear?: number;
        isDefault?: boolean;
      };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const { type, last4, expiryMonth, expiryYear, isDefault = false } = request.body;

    if (!type) {
      return reply.code(400).send({
        success: false,
        error: 'Bad Request',
        message: 'Payment method type is required',
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      db.unsetDefaultPaymentMethods(session.user_id);
    }

    const paymentId = `pm-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const newMethod = db.addPaymentMethod(
      paymentId,
      session.user_id,
      type,
      last4,
      expiryMonth,
      expiryYear,
      isDefault,
    );

    return reply.send({
      success: true,
      message: 'Payment method added successfully',
      paymentMethod: newMethod,
    });
  },

  // Update payment method
  async updatePaymentMethod(
    request: FastifyRequest<{
      Params: { paymentMethodId: string };
      Body: {
        isDefault?: boolean;
        expiryMonth?: number;
        expiryYear?: number;
      };
    }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const method = db.getPaymentMethod(request.params.paymentMethodId);

    if (!method || method.user_id !== session.user_id) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Payment method not found',
      });
    }

    const { isDefault, expiryMonth, expiryYear } = request.body;

    if (isDefault) {
      db.unsetDefaultPaymentMethods(session.user_id);
    }

    db.updatePaymentMethod(request.params.paymentMethodId, {
      is_default: isDefault ? 1 : 0,
      expiry_month: expiryMonth,
      expiry_year: expiryYear,
    });

    const updatedMethod = db.getPaymentMethod(request.params.paymentMethodId)!;

    return reply.send({
      success: true,
      message: 'Payment method updated successfully',
      paymentMethod: updatedMethod,
    });
  },

  // Delete payment method
  async deletePaymentMethod(
    request: FastifyRequest<{ Params: { paymentMethodId: string } }>,
    reply: FastifyReply,
  ) {
    const sessionId = request.cookies.sessionId!;
    const db = getDatabase();

    const session = db.getSession(sessionId);
    if (!session) {
      return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Session not found',
      });
    }

    const method = db.getPaymentMethod(request.params.paymentMethodId);

    if (!method || method.user_id !== session.user_id) {
      return reply.code(404).send({
        success: false,
        error: 'Not Found',
        message: 'Payment method not found',
      });
    }

    db.deletePaymentMethod(request.params.paymentMethodId);

    return reply.send({
      success: true,
      message: 'Payment method deleted successfully',
    });
  },

  // Export credentials (for JMeter testing)
  async exportCredentials(_request: FastifyRequest, reply: FastifyReply) {
    const db = getDatabase();
    const users = db.getAllUsers(200);

    const csvContent =
      'email,password,name\n' + users.map((u) => `${u.email},${u.password},"${u.name}"`).join('\n');

    return reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', 'attachment; filename="users-credentials.csv"')
      .send(csvContent);
  },

  // Export products for JMeter testing
  exportProducts: async (_request: FastifyRequest, reply: FastifyReply) => {
    const db = getDatabase();
    const products = db.getAllProducts();

    const csvContent =
      'productId,name,category,price,stock\n' +
      products.map((p) => `${p.id},"${p.name}",${p.category},${p.price},${p.stock}`).join('\n');

    return reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', 'attachment; filename="products.csv"')
      .send(csvContent);
  },
};
