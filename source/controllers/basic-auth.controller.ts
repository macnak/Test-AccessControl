import { FastifyRequest, FastifyReply } from 'fastify';
import { sampleUsers } from '../config/sample-data';

export const basicAuthController = {
  // JSON Response
  async getJson(_request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Authenticated with Basic Auth',
      data: sampleUsers,
    });
  },

  // Plain Text Response
  async getText(_request: FastifyRequest, reply: FastifyReply) {
    return reply
      .type('text/plain')
      .send('Successfully authenticated with Basic Auth - Plain Text Response');
  },

  // XML Response
  async getXml(_request: FastifyRequest, reply: FastifyReply) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <success>true</success>
  <message>Authenticated with Basic Auth</message>
  <users>
    ${sampleUsers
      .map(
        (user) => `
    <user>
      <id>${user.id}</id>
      <name>${user.name}</name>
      <email>${user.email}</email>
      <role>${user.role}</role>
    </user>`,
      )
      .join('')}
  </users>
</response>`;
    return reply.type('application/xml').send(xml);
  },

  // POST with JSON Body
  async postJson(request: FastifyRequest, reply: FastifyReply) {
    console.log('Request body:', request.body);
    return reply.send({
      success: true,
      message: 'Data received with Basic Auth',
      receivedData: request.body,
    });
  },

  // POST with Form URL Encoded
  async postForm(request: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      success: true,
      message: 'Form data received with Basic Auth',
      receivedData: request.body,
    });
  },

  // POST with XML Body
  async postXml(request: FastifyRequest, reply: FastifyReply) {
    console.log('Request body XML:', request.body);
    return reply.send({
      success: true,
      message: 'XML data received with Basic Auth',
      receivedData: request.body,
    });
  },
};
