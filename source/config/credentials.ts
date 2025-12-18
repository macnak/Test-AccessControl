export interface Credentials {
  username: string;
  password: string;
}

export interface UserAccount {
  email: string;
  password: string;
  name: string;
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
  { email: 'admin@example.com', password: 'Admin@123', name: 'Admin User' },
  { email: 'user@example.com', password: 'User@456', name: 'Regular User' },
  { email: 'test@example.com', password: 'Test@789', name: 'Test User' },
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
