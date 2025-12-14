import { FastifyRequest, FastifyReply } from 'fastify';

export const oauth2Controller = {
  // JSON Response
  async getJson(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Authenticated with OAuth2',
      tokenInfo: {
        scope: 'read write',
        expires_in: 3600,
      },
    });
  },

  // Plain Text Response
  async getText(_request: FastifyRequest, reply: FastifyReply) {
    return reply
      .type('text/plain')
      .send('Successfully authenticated with OAuth2 - Plain Text Response');
  },

  // XML Response
  async getXml(_request: FastifyRequest, reply: FastifyReply) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>Authenticated with OAuth2</message>
  <tokenInfo>
    <scope>read write</scope>
    <expires_in>3600</expires_in>
  </tokenInfo>
</response>`;
    return reply.type('application/xml').send(xml);
  },

  // POST with JSON Body
  async postJson(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Data received with OAuth2',
      receivedData: request.body,
    });
  },

  // POST with Form URL Encoded
  async postForm(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Form data received with OAuth2',
      receivedData: request.body,
    });
  },

  // POST with XML Body
  async postXml(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'XML data received with OAuth2',
      receivedData: request.body,
    });
  },
};
