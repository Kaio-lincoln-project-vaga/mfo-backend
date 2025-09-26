import fastify from 'fastify';
import { simulationRoutes } from './routes/simulationRoutes.js';
import cors from '@fastify/cors'; 

const app = fastify({
  logger: true,
});

app.register(cors, {
  origin: 'http://localhost:3001',
} );

app.register(simulationRoutes);
app.listen({ port: 3000 }).then(() => {
  console.log('🚀 Server is running on http://localhost:3000' );
});

