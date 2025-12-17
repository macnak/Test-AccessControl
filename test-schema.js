const Ajv = require('ajv');

// Test with removeAdditional: true (default)
const ajv1 = new Ajv({ removeAdditional: true });
const schema1 = {
  type: 'object',
  additionalProperties: true,
  properties: { name: { type: 'string' } }
};
const validate1 = ajv1.compile(schema1);
const data1 = { person: 'John', name: 'Test' };
console.log('With removeAdditional true:', validate1(data1), data1);

// Test with removeAdditional: false
const ajv2 = new Ajv({ removeAdditional: false });
const validate2 = ajv2.compile(schema1);
const data2 = { person: 'John', name: 'Test' };
console.log('With removeAdditional false:', validate2(data2), data2);
