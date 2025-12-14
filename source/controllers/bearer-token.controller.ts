import { FastifyRequest, FastifyReply } from 'fastify';
import { sampleUsers, sampleProducts } from '../config/sample-data';

export const bearerTokenController = {
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
    return reply.send({
      success: true,
      message: 'XML data received with Bearer Token',
      receivedData: request.body,
    });
  },
};
