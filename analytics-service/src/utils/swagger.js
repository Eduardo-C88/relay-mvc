const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics & Reporting Service API',
      version: '1.0.0',
      description: 'API de Estatísticas e Relatórios da Plataforma Relay',
      contact: {
        name: 'Relay Team'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3007}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    tags: [
      {
        name: 'Analytics',
        description: 'Endpoints de estatísticas e relatórios'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
