#!/bin/bash
curl -s -m 5 http://localhost:3001/api/bearer-token/json \
  -H "Authorization: Bearer test-token-123"
