export interface Credentials {
  username: string;
  password: string;
}

export interface UserAccount {
  email: string;
  password: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface CartItem {
  productId: number;
  quantity: number;
  addedAt: string;
}

export interface ShoppingCart {
  items: CartItem[];
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal';
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface Order {
  orderId: string;
  userId: string;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  email: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface PendingAuth {
  tempToken: string;
  code: string;
  email: string;
  expiresAt: number;
}

export const validCredentials: Credentials[] = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' },
  { username: 'testuser', password: 'test@pass' },
];

export const userAccounts: UserAccount[] = [
  {
    email: 'admin@example.com',
    password: 'Admin@123',
    name: 'Admin User',
    address: '123 Admin Street, New York, NY 10001',
    phone: '+1-555-0100',
  },
  {
    email: 'user@example.com',
    password: 'User@456',
    name: 'Regular User',
    address: '456 User Avenue, Los Angeles, CA 90001',
    phone: '+1-555-0200',
  },
  {
    email: 'test@example.com',
    password: 'Test@789',
    name: 'Test User',
    address: '789 Test Boulevard, Chicago, IL 60601',
    phone: '+1-555-0300',
  },
];

export const apiKeys: string[] = [
  'api-key-12345-valid',
  'api-key-67890-valid',
  'api-key-abcde-valid',
];

export const bearerTokens: string[] = [
  'bearer-token-xyz123-valid',
  'bearer-token-abc456-valid',
  'bearer-token-def789-valid',
];

export const oauth2Tokens: string[] = [
  'oauth2-token-valid-12345',
  'oauth2-token-valid-67890',
  'oauth2-token-valid-abcde',
];

// In-memory storage for pending auth requests and validated tokens
export const pendingAuthRequests = new Map<string, PendingAuth>();
export const validatedBearerTokens = new Set<string>();

// Cookie session storage
export const pendingCookieAuth = new Map<string, PendingAuth>();
export const validatedSessionCookies = new Set<string>();

// Shopping cart storage - Map of sessionId to ShoppingCart
export const shoppingCarts = new Map<string, ShoppingCart>();

// Payment methods storage - Map of email to PaymentMethod[]
export const paymentMethods = new Map<string, PaymentMethod[]>();

// Orders storage - Map of email to Order[]
export const userOrders = new Map<string, Order[]>();

// Session to email mapping
export const sessionToEmail = new Map<string, string>();
