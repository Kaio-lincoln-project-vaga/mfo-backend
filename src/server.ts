import fastify from 'fastify';
import { simulationRoutes } from './routes/simulationRoutes.js'; 

const app = fastify({ logger: true });

app.register(simulationRoutes);

const start = async () => {
  try {
    await app.listen({ port: 3000 });
    console.log('🚀 Server is running on http://localhost:3000' );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

