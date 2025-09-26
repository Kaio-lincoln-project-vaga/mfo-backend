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
      data: { name, startDate, realRate },
    });
    return reply.status(201).send(simulation);
  });

  app.get('/simulations', async () => {
    const simulations = await prisma.simulation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return simulations;
  });

  app.delete('/simulations/:id', async (request, reply) => {
    const getParams = z.object({ id: z.string().cuid() });
    const { id } = getParams.parse(request.params);
    await prisma.simulation.delete({ where: { id } });
    return reply.status(204).send();
  });


  app.get('/simulations/:id/projection', async (request, reply) => {
    const getParams = z.object({ id: z.string().cuid() });
    const { id } = getParams.parse(request.params);
    const simulation = await prisma.simulation.findUnique({ where: { id } });
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

  app.post('/simulations/:simulationId/allocations/financial', async (request, reply) => {
    const getParams = z.object({ simulationId: z.string().cuid() });
    const createBody = z.object({
      name: z.string(),
      value: z.number().positive(),
      date: z.string().datetime(),
    });
    const { simulationId } = getParams.parse(request.params);
    const { name, value, date } = createBody.parse(request.body);

    const allocation = await prisma.financialAllocation.create({
      data: { name, value, date, simulationId },
    });
    return reply.status(201).send(allocation);
  });

  app.get('/simulations/:simulationId/allocations/financial', async (request) => {
    const getParams = z.object({ simulationId: z.string().cuid() });
    const { simulationId } = getParams.parse(request.params);
    const allocations = await prisma.financialAllocation.findMany({
      where: { simulationId },
      orderBy: { date: 'desc' },
    });
    return allocations;
  });
}
