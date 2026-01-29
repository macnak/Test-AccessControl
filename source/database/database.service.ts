import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

export interface DbUser {
  id: number;
  email: string;
  password: string;
  name: string;
  address?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DbSession {
  id: string;
  user_id: number;
  email: string;
  expires_at: string;
  created_at: string;
}

export interface DbPendingAuth {
  temp_token: string;
  code: string;
  email: string;
  expires_at: string;
  created_at: string;
}

export interface DbCartItem {
  id: number;
  session_id: string;
  product_id: number;
  quantity: number;
  added_at: string;
}

export interface DbOrder {
  id: string;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  payment_method?: string;
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: number;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface DbPaymentMethod {
  id: string;
  user_id: number;
  type: 'credit_card' | 'debit_card' | 'paypal';
  last4?: string;
  expiry_month?: number;
  expiry_year?: number;
  is_default: number;
  created_at: string;
  updated_at: string;
}

class DatabaseService {
  private db: Database.Database;
  private dbPath: string;

  constructor() {
    // Use environment variable for DB path, default to data directory
    const dataDir = process.env.DB_PATH || path.join(process.cwd(), 'data');

    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.dbPath = path.join(dataDir, 'shopping.db');

    // Check if database exists
    const dbExists = fs.existsSync(this.dbPath);

    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL'); // Better concurrency
    this.db.pragma('foreign_keys = ON');

    if (!dbExists) {
      console.log('Database not found. Initializing schema...');
      this.initializeSchema();
    } else {
      console.log(`Using existing database at: ${this.dbPath}`);
    }
  }

  private initializeSchema(): void {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
    console.log('Database schema initialized');
  }

  // User operations
  createUser(
    email: string,
    password: string,
    name: string,
    address?: string,
    phone?: string,
  ): DbUser {
    const stmt = this.db.prepare(`
      INSERT INTO users (email, password, name, address, phone)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(email, password, name, address || null, phone || null);
    return this.getUserById(result.lastInsertRowid as number)!;
  }

  getUserById(id: number): DbUser | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as DbUser | undefined;
  }

  getUserByEmail(email: string): DbUser | undefined {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as DbUser | undefined;
  }

  getAllUsers(limit: number = 100, offset: number = 0): DbUser[] {
    const stmt = this.db.prepare('SELECT * FROM users LIMIT ? OFFSET ?');
    return stmt.all(limit, offset) as DbUser[];
  }

  getUserCount(): number {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM users');
    return (stmt.get() as { count: number }).count;
  }

  updateUser(id: number, updates: Partial<Pick<DbUser, 'name' | 'address' | 'phone'>>): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.address !== undefined) {
      fields.push('address = ?');
      values.push(updates.address);
    }
    if (updates.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updates.phone);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      const stmt = this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  }

  // Product operations
  createProduct(
    name: string,
    price: number,
    category: string,
    description?: string,
    stock: number = 100,
    imageUrl?: string,
  ): DbProduct {
    const stmt = this.db.prepare(`
      INSERT INTO products (name, description, price, category, stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, description || null, price, category, stock, imageUrl || null);
    return this.getProductById(result.lastInsertRowid as number)!;
  }

  getProductById(id: number): DbProduct | undefined {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
    return stmt.get(id) as DbProduct | undefined;
  }

  getProducts(
    options: {
      category?: string;
      sortBy?: 'price' | 'name';
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    } = {},
  ): DbProduct[] {
    const { category, sortBy = 'name', sortOrder = 'asc', limit = 10, offset = 0 } = options;

    let query = 'SELECT * FROM products';
    const params: any[] = [];

    if (category) {
      query += ' WHERE LOWER(category) = LOWER(?)';
      params.push(category);
    }

    query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as DbProduct[];
  }

  getProductCount(category?: string): number {
    let query = 'SELECT COUNT(*) as count FROM products';
    const params: any[] = [];

    if (category) {
      query += ' WHERE LOWER(category) = LOWER(?)';
      params.push(category);
    }

    const stmt = this.db.prepare(query);
    return (stmt.get(...params) as { count: number }).count;
  }

  // Restock all products to high levels for performance testing
  restockAllProducts(minStock: number = 500, maxStock: number = 2000): number {
    const stmt = this.db.prepare(`
      UPDATE products 
      SET stock = ABS(RANDOM()) % (? - ? + 1) + ?
    `);
    const result = stmt.run(maxStock, minStock, minStock);
    return result.changes;
  }

  // Session operations
  createSession(id: string, userId: number, email: string, expiresAt: Date): DbSession {
    const stmt = this.db.prepare(`
      INSERT INTO sessions (id, user_id, email, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, userId, email, expiresAt.toISOString());
    return this.getSession(id)!;
  }

  getSession(id: string): DbSession | undefined {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id) as DbSession | undefined;
  }

  deleteSession(id: string): void {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
    stmt.run(id);
  }

  cleanExpiredSessions(): void {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE expires_at < ?');
    stmt.run(new Date().toISOString());
  }

  // Pending auth operations
  createPendingAuth(tempToken: string, code: string, email: string, expiresAt: Date): void {
    const stmt = this.db.prepare(`
      INSERT INTO pending_auth (temp_token, code, email, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(tempToken, code, email, expiresAt.toISOString());
  }

  getPendingAuth(tempToken: string): DbPendingAuth | undefined {
    const stmt = this.db.prepare('SELECT * FROM pending_auth WHERE temp_token = ?');
    return stmt.get(tempToken) as DbPendingAuth | undefined;
  }

  deletePendingAuth(tempToken: string): void {
    const stmt = this.db.prepare('DELETE FROM pending_auth WHERE temp_token = ?');
    stmt.run(tempToken);
  }

  cleanExpiredPendingAuth(): void {
    const stmt = this.db.prepare('DELETE FROM pending_auth WHERE expires_at < ?');
    stmt.run(new Date().toISOString());
  }

  // Cart operations
  addToCart(sessionId: string, productId: number, quantity: number): void {
    const stmt = this.db.prepare(`
      INSERT INTO cart_items (session_id, product_id, quantity)
      VALUES (?, ?, ?)
      ON CONFLICT(session_id, product_id) DO UPDATE SET quantity = quantity + ?
    `);
    stmt.run(sessionId, productId, quantity, quantity);
  }

  getCart(sessionId: string): DbCartItem[] {
    const stmt = this.db.prepare('SELECT * FROM cart_items WHERE session_id = ?');
    return stmt.all(sessionId) as DbCartItem[];
  }

  updateCartItem(sessionId: string, productId: number, quantity: number): void {
    if (quantity === 0) {
      this.removeFromCart(sessionId, productId);
    } else {
      const stmt = this.db.prepare(`
        UPDATE cart_items SET quantity = ? WHERE session_id = ? AND product_id = ?
      `);
      stmt.run(quantity, sessionId, productId);
    }
  }

  removeFromCart(sessionId: string, productId: number): void {
    const stmt = this.db.prepare('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?');
    stmt.run(sessionId, productId);
  }

  clearCart(sessionId: string): void {
    const stmt = this.db.prepare('DELETE FROM cart_items WHERE session_id = ?');
    stmt.run(sessionId);
  }

  // Order operations
  createOrder(
    orderId: string,
    userId: number,
    total: number,
    paymentMethod: string,
    shippingAddress: string,
    items: Array<{ productId: number; productName: string; quantity: number; price: number }>,
  ): DbOrder {
    const orderStmt = this.db.prepare(`
      INSERT INTO orders (id, user_id, total, payment_method, shipping_address, status)
      VALUES (?, ?, ?, ?, ?, 'processing')
    `);

    const itemStmt = this.db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, quantity, price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      orderStmt.run(orderId, userId, total, paymentMethod, shippingAddress);
      for (const item of items) {
        itemStmt.run(orderId, item.productId, item.productName, item.quantity, item.price);
      }
    });

    transaction();
    return this.getOrder(orderId)!;
  }

  getOrder(orderId: string): DbOrder | undefined {
    const stmt = this.db.prepare('SELECT * FROM orders WHERE id = ?');
    return stmt.get(orderId) as DbOrder | undefined;
  }

  getOrderItems(orderId: string): DbOrderItem[] {
    const stmt = this.db.prepare('SELECT * FROM order_items WHERE order_id = ?');
    return stmt.all(orderId) as DbOrderItem[];
  }

  getUserOrders(
    userId: number,
    options: { status?: string; limit?: number; offset?: number } = {},
  ): DbOrder[] {
    const { status, limit = 10, offset = 0 } = options;

    let query = 'SELECT * FROM orders WHERE user_id = ?';
    const params: any[] = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as DbOrder[];
  }

  getUserOrderCount(userId: number, status?: string): number {
    let query = 'SELECT COUNT(*) as count FROM orders WHERE user_id = ?';
    const params: any[] = [userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const stmt = this.db.prepare(query);
    return (stmt.get(...params) as { count: number }).count;
  }

  updateOrderStatus(orderId: string, status: DbOrder['status']): void {
    const stmt = this.db.prepare(`
      UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    stmt.run(status, orderId);
  }

  // Payment method operations
  addPaymentMethod(
    id: string,
    userId: number,
    type: DbPaymentMethod['type'],
    last4?: string,
    expiryMonth?: number,
    expiryYear?: number,
    isDefault: boolean = false,
  ): DbPaymentMethod {
    const stmt = this.db.prepare(`
      INSERT INTO payment_methods (id, user_id, type, last4, expiry_month, expiry_year, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      userId,
      type,
      last4 || null,
      expiryMonth || null,
      expiryYear || null,
      isDefault ? 1 : 0,
    );
    return this.getPaymentMethod(id)!;
  }

  getPaymentMethod(id: string): DbPaymentMethod | undefined {
    const stmt = this.db.prepare('SELECT * FROM payment_methods WHERE id = ?');
    return stmt.get(id) as DbPaymentMethod | undefined;
  }

  getUserPaymentMethods(userId: number): DbPaymentMethod[] {
    const stmt = this.db.prepare(
      'SELECT * FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
    );
    return stmt.all(userId) as DbPaymentMethod[];
  }

  updatePaymentMethod(
    id: string,
    updates: Partial<Pick<DbPaymentMethod, 'expiry_month' | 'expiry_year' | 'is_default'>>,
  ): void {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.expiry_month !== undefined) {
      fields.push('expiry_month = ?');
      values.push(updates.expiry_month);
    }
    if (updates.expiry_year !== undefined) {
      fields.push('expiry_year = ?');
      values.push(updates.expiry_year);
    }
    if (updates.is_default !== undefined) {
      fields.push('is_default = ?');
      values.push(updates.is_default ? 1 : 0);
    }

    if (fields.length > 0) {
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      const stmt = this.db.prepare(`UPDATE payment_methods SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
    }
  }

  unsetDefaultPaymentMethods(userId: number): void {
    const stmt = this.db.prepare('UPDATE payment_methods SET is_default = 0 WHERE user_id = ?');
    stmt.run(userId);
  }

  deletePaymentMethod(id: string): void {
    const stmt = this.db.prepare('DELETE FROM payment_methods WHERE id = ?');
    stmt.run(id);
  }

  // Utility operations
  getDatabaseStats(): { users: number; products: number; orders: number; sessions: number } {
    return {
      users: this.getUserCount(),
      products: this.getProductCount(),
      orders: (this.db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number })
        .count,
      sessions: (
        this.db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number }
      ).count,
    };
  }

  resetDatabase(): void {
    const tables = [
      'order_items',
      'orders',
      'cart_items',
      'payment_methods',
      'sessions',
      'pending_auth',
      'products',
      'users',
    ];
    for (const table of tables) {
      this.db.prepare(`DELETE FROM ${table}`).run();
    }
    this.db.prepare('DELETE FROM sqlite_sequence').run();
    console.log('Database reset complete');
  }

  close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export { DatabaseService };
