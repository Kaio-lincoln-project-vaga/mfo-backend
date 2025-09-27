import fastify from 'fastify';
import { simulationRoutes } from './routes/simulationRoutes.js';
import cors from '@fastify/cors';
import { testDatabaseConnection } from './lib/prisma.js';

const app = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    }
  },
});

// Registrar CORS
await app.register(cors, {
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// CRÍTICO: Registrar suporte para JSON
await app.register(import('@fastify/formbody'));

// Hook para testar conexão com banco na inicialização
app.addHook('onReady', async function () {
  console.log('🔍 Testing database connection...');
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Failed to connect to database');
    process.exit(1);
  }
});

// Hook global para tratar erros
app.setErrorHandler(async (error, request, reply) => {
  console.error('🚨 Global Error Handler:', error);
  
  // Log detalhado do erro
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    method: request.method,
    url: request.url,
    body: request.body,
    params: request.params,
    query: request.query,
  });

  // Resposta baseada no tipo de erro
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.message || 'Request Error'
    });
  }

  // Erro genérico
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Hook para log de todas as requisições
app.addHook('onRequest', async (request, reply) => {
  console.log(`📨 ${request.method} ${request.url}`);
  if (request.body) {
    console.log('Body:', request.body);
  }
  if (Object.keys(request.params || {}).length > 0) {
    console.log('Params:', request.params);
  }
});

// Hook para log de todas as respostas
app.addHook('onSend', async (request, reply, payload) => {
  console.log(`📤 ${request.method} ${request.url} - Status: ${reply.statusCode}`);
});

// Registrar rotas
await app.register(simulationRoutes);

// Rota de health check
app.get('/health', async (request, reply) => {
  try {
    const isDbConnected = await testDatabaseConnection();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isDbConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    };
  } catch (error) {
    return reply.status(503).send({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`📡 Received ${signal}, shutting down gracefully...`);
  try {
    await app.close();
    console.log('✅ Server closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar servidor
const start = async () => {
  try {
    await app.listen({ 
      port: 3000, 
      host: '0.0.0.0' // Permite conexões externas
    });
    console.log('🚀 Server is running on http://localhost:3000');
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

start();