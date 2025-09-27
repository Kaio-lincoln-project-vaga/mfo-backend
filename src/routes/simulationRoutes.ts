import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { calculatePatrimonialProjection } from '../services/simulationService.js';

export async function simulationRoutes(app: FastifyInstance) {
  
  app.post('/simulations', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const createSimulationBody = z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        startDate: z.string().refine((date) => {
          const parsed = new Date(date);
          return !isNaN(parsed.getTime());
        }, 'Data inválida'),
        realRate: z.number().min(0, 'Taxa deve ser maior ou igual a 0'),
      });

      const { name, startDate, realRate } = createSimulationBody.parse(request.body);
      
      const simulation = await prisma.simulation.create({
        data: { 
          name, 
          startDate: new Date(startDate), // Garantir que é Date object
          realRate 
        },
      });

      return reply.status(201).send(simulation);
    } catch (error) {
      console.error('Erro ao criar simulação:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
      }
      
      return reply.status(500).send({ 
        error: 'Erro interno do servidor' 
      });
    }
  });

  // GET /simulations - Listar simulações
  app.get('/simulations', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const simulations = await prisma.simulation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      
      return reply.status(200).send(simulations);
    } catch (error) {
      console.error('Erro ao buscar simulações:', error);
      return reply.status(500).send({ 
        error: 'Erro ao buscar simulações' 
      });
    }
  });

  // DELETE /simulations/:id - Deletar simulação
  app.delete('/simulations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ 
        id: z.string().min(1, 'ID é obrigatório')
      });
      
      const { id } = getParams.parse(request.params);
      
      // Verificar se a simulação existe
      const existingSimulation = await prisma.simulation.findUnique({ 
        where: { id } 
      });
      
      if (!existingSimulation) {
        return reply.status(404).send({ 
          error: 'Simulação não encontrada' 
        });
      }
      
      await prisma.simulation.delete({ where: { id } });
      
      return reply.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar simulação:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Parâmetros inválidos', 
          details: error.errors 
        });
      }
      
      return reply.status(500).send({ 
        error: 'Erro ao deletar simulação' 
      });
    }
  });

  // GET /simulations/:id/projection - Buscar projeção
  app.get('/simulations/:id/projection', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ 
        id: z.string().min(1, 'ID é obrigatório')
      });
      
      const { id } = getParams.parse(request.params);
      
      const simulation = await prisma.simulation.findUnique({ 
        where: { id } 
      });
      
      if (!simulation) {
        return reply.status(404).send({ 
          error: 'Simulação não encontrada' 
        });
      }

      const projection = calculatePatrimonialProjection({
        initialValue: 10000,
        monthlyContribution: 500,
        yearlyRate: simulation.realRate,
        startYear: new Date(simulation.startDate).getFullYear(),
        endYear: 2060,
      });

      return reply.status(200).send(projection);
    } catch (error) {
      console.error('Erro ao calcular projeção:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Parâmetros inválidos', 
          details: error.errors 
        });
      }
      
      return reply.status(500).send({ 
        error: 'Erro ao calcular projeção' 
      });
    }
  });

  // POST /simulations/:simulationId/allocations/financial - Criar alocação financeira
  app.post('/simulations/:simulationId/allocations/financial', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ 
        simulationId: z.string().min(1, 'ID da simulação é obrigatório')
      });
      
      const createBody = z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        value: z.number().positive('Valor deve ser positivo'),
        date: z.string().refine((date) => {
          const parsed = new Date(date);
          return !isNaN(parsed.getTime());
        }, 'Data inválida'),
      });

      const { simulationId } = getParams.parse(request.params);
      const { name, value, date } = createBody.parse(request.body);

      // Verificar se a simulação existe
      const simulation = await prisma.simulation.findUnique({
        where: { id: simulationId }
      });

      if (!simulation) {
        return reply.status(404).send({ 
          error: 'Simulação não encontrada' 
        });
      }

      const allocation = await prisma.financialAllocation.create({
        data: { 
          name, 
          value, 
          date: new Date(date), 
          simulationId 
        },
      });

      return reply.status(201).send(allocation);
    } catch (error) {
      console.error('Erro ao criar alocação financeira:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados inválidos', 
          details: error.errors 
        });
      }
      
      return reply.status(500).send({ 
        error: 'Erro ao criar alocação financeira' 
      });
    }
  });

  // GET /simulations/:simulationId/allocations/financial - Listar alocações financeiras
  app.get('/simulations/:simulationId/allocations/financial', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ 
        simulationId: z.string().min(1, 'ID da simulação é obrigatório')
      });
      
      const { simulationId } = getParams.parse(request.params);
      
      // Verificar se a simulação existe
      const simulation = await prisma.simulation.findUnique({
        where: { id: simulationId }
      });

      if (!simulation) {
        return reply.status(404).send({ 
          error: 'Simulação não encontrada' 
        });
      }

      const allocations = await prisma.financialAllocation.findMany({
        where: { simulationId },
        orderBy: { date: 'desc' },
      });

      return reply.status(200).send(allocations);
    } catch (error) {
      console.error('Erro ao buscar alocações financeiras:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Parâmetros inválidos', 
          details: error.errors 
        });
      }
      
      return reply.status(500).send({ 
        error: 'Erro ao buscar alocações financeiras' 
      });
    }
  });

  // ==================================================================
  // NOVO ENDPOINT DE COMPARAÇÃO
  // ==================================================================
  app.post('/simulations/compare', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const compareBody = z.object({
        simulationIds: z.array(z.string().min(1, "ID inválido no array")),
      });

      const { simulationIds } = compareBody.parse(request.body);

      // Usamos um Record para garantir a tipagem do objeto de resposta
      const comparisonData: Record<string, any[]> = {};

      // Usamos Promise.all para rodar as buscas em paralelo, é mais performático
      await Promise.all(simulationIds.map(async (id) => {
        const simulation = await prisma.simulation.findUnique({ where: { id } });
        
        if (simulation) {
          const projection = calculatePatrimonialProjection({
            initialValue: 10000,
            monthlyContribution: 500,
            yearlyRate: simulation.realRate,
            startYear: new Date(simulation.startDate).getFullYear(),
            endYear: 2060,
          });
          comparisonData[id] = projection;
        } else {
          // Se um ID não for encontrado, podemos optar por pular ou retornar um erro
          console.warn(`Simulação com ID ${id} não encontrada durante a comparação.`);
        }
      }));

      return reply.status(200).send(comparisonData);

    } catch (error) {
      console.error('Erro ao comparar simulações:', error);
      
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          error: 'Dados de comparação inválidos', 
          details: error.errors 
        });
      }
      
      return reply.status(500).send({ 
        error: 'Erro interno ao comparar simulações' 
      });
    }
  });
}
