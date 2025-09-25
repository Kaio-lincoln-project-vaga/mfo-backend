import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { calculatePatrimonialProjection } from '../services/simulationService.js';

export async function simulationRoutes(app: FastifyInstance) {
  app.post('/simulations', async (request: FastifyRequest, reply: FastifyReply) => {
    const createSimulationBody = z.object({
      name: z.string(),
      startDate: z.string().datetime(),
      realRate: z.number().min(0),
    });

    const { name, startDate, realRate } = createSimulationBody.parse(request.body);

    const simulation = await prisma.simulation.create({
      data: {
        name,
        startDate,
        realRate,
      },
    });

    return reply.status(201).send(simulation);
  });

  app.get('/simulations', async () => {
    const simulations = await prisma.simulation.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return simulations;
  });

  app.get('/simulations/:id/projection', async (request, reply) => {
    const getSimulationParams = z.object({
      id: z.string().cuid(),
    });
    const { id } = getSimulationParams.parse(request.params);

    const simulation = await prisma.simulation.findUnique({
      where: { id },
    });

    if (!simulation) {
      return reply.status(404).send({ error: 'Simulation not found.' });
    }

    const projection = calculatePatrimonialProjection({
      initialValue: 10000,
      monthlyContribution: 500,
      yearlyRate: simulation.realRate,
      startYear: new Date(simulation.startDate).getFullYear(),
      endYear: 2060,
    });

    return projection;
  });

  app.delete('/simulations/:id', async (request, reply) => {
    const getSimulationParams = z.object({
      id: z.string().cuid(),
    });
    const { id } = getSimulationParams.parse(request.params);

    const simulationExists = await prisma.simulation.findUnique({
      where: { id },
    });

    if (!simulationExists) {
      return reply.status(404).send({ error: 'Simulation not found.' });
    }

    await prisma.simulation.delete({
      where: { id },
    });

    return reply.status(204).send();
  });
}
