# Test Credentials

This file contains all valid credentials for testing the access control mechanisms.

## Basic Authentication

```text
Username: admin
Password: admin123

Username: user
Password: user123

Username: testuser
Password: test@pass
```

## API Keys

Valid API keys (use in `x-api-key` header or `apiKey` query parameter):

```text
api-key-12345-valid
api-key-67890-valid
api-key-abcde-valid
```

## Bearer Tokens

Valid bearer tokens (use in `Authorization: Bearer <token>` header):

```text
bearer-token-xyz123-valid
bearer-token-abc456-valid
bearer-token-def789-valid
```

## OAuth2 Tokens

Valid OAuth2 tokens (use in `Authorization: Bearer <token>` header):

```text
oauth2-token-valid-12345
oauth2-token-valid-67890
oauth2-token-valid-abcde
```

## Invalid Credentials for Testing

For negative testing scenarios, use any credentials NOT listed above to receive 401 Unauthorized responses.

Examples of invalid credentials:

- Username: `invalid`, Password: `wrong`
- API Key: `invalid-api-key`
- Bearer Token: `invalid-bearer-token`
- OAuth2 Token: `invalid-oauth2-token`
