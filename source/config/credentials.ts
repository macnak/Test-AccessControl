export interface Credentials {
  username: string;
  password: string;
}

export const validCredentials: Credentials[] = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' },
  { username: 'testuser', password: 'test@pass' },
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
