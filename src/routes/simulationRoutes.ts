import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { calculatePatrimonialProjection } from '../services/simulationService.js';

// Função auxiliar para tratamento de erros, evitando repetição
function handleError(error: any, reply: FastifyReply, context: string) {
  if (error instanceof z.ZodError) {
    return reply.status(400).send({ message: `Dados inválidos para ${context}.`, details: error.format() });
  }
  // Código de erro do Prisma para "registro não encontrado" em operações de deleção/atualização
  if (error.code === 'P2025') {
      return reply.status(404).send({ message: `${context} não encontrado(a).` });
  }
  console.error(`Erro em ${context}:`, error);
  return reply.status(500).send({ message: `Erro interno do servidor ao processar ${context}.` });
}

export async function simulationRoutes(app: FastifyInstance) {
  
  // POST /simulations - Criar uma nova simulação
  app.post('/simulations', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const createSimulationBody = z.object({
        name: z.string().min(1, 'Nome é obrigatório'),
        startDate: z.string().refine((date) => !isNaN(new Date(date).getTime()), 'Data inválida'),
        realRate: z.number().min(0, 'Taxa deve ser maior ou igual a 0'),
      });

      const { name, startDate, realRate } = createSimulationBody.parse(request.body);
      
      const simulation = await prisma.simulation.create({
        data: { 
          name, 
          startDate: new Date(startDate),
          realRate 
        },
      });

      return reply.status(201).send(simulation);
    } catch (error) {
      return handleError(error, reply, 'criação de simulação');
    }
  });

  // GET /simulations - Listar todas as simulações
  app.get('/simulations', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const simulations = await prisma.simulation.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return reply.status(200).send(simulations);
    } catch (error) {
      return handleError(error, reply, 'busca de simulações');
    }
  });

  // DELETE /simulations/:id - Deletar uma simulação
  app.delete('/simulations/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ id: z.string().cuid('ID da simulação inválido') });
      const { id } = getParams.parse(request.params);
      
      await prisma.simulation.delete({ where: { id } });
      
      return reply.status(204).send();
    } catch (error) {
      return handleError(error, reply, 'deleção de simulação');
    }
  });

  // GET /simulations/:id/projection - Buscar projeção patrimonial
  app.get('/simulations/:id/projection', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ id: z.string().cuid('ID da simulação inválido') });
      const { id } = getParams.parse(request.params);
      
      const simulation = await prisma.simulation.findUnique({ where: { id } });
      
      if (!simulation) {
        return reply.status(404).send({ message: 'Simulação não encontrada' });
      }

      // Lógica de cálculo da projeção (exemplo)
      const projection = calculatePatrimonialProjection({
        initialValue: 10000, // Este valor deveria vir das alocações
        monthlyContribution: 500, // Este valor deveria vir dos movimentos
        yearlyRate: simulation.realRate,
        startYear: new Date(simulation.startDate).getFullYear(),
        endYear: 2060,
      });

      return reply.status(200).send(projection);
    } catch (error) {
      return handleError(error, reply, 'cálculo de projeção');
    }
  });

  // ===================================================================
  // ROTAS CORRIGIDAS
  // ===================================================================

  // POST /simulations/:simulationId/allocations/financial - Criar uma nova categoria de alocação financeira com seu valor inicial
  app.post('/simulations/:simulationId/allocations/financial', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ 
        simulationId: z.string().cuid('ID da simulação inválido')
      });
      
      const createBody = z.object({
        name: z.string().min(1, 'Nome da alocação é obrigatório'),
        value: z.number().positive('O valor inicial deve ser positivo'),
        date: z.string().refine((d) => !isNaN(new Date(d).getTime()), 'Data inválida'),
      });

      const { simulationId } = getParams.parse(request.params);
      const { name, value, date } = createBody.parse(request.body);

      const simulationExists = await prisma.simulation.findUnique({
        where: { id: simulationId },
      });

      if (!simulationExists) {
        return reply.status(404).send({ message: 'Simulação não encontrada.' });
      }

      const newAllocation = await prisma.financialAllocation.create({
        data: {
          name,
          simulationId,
          history: {
            create: {
              value,
              date: new Date(date),
            },
          },
        },
        include: {
          history: true, // Retorna o histórico recém-criado na resposta
        },
      });

      return reply.status(201).send(newAllocation);
    } catch (error) {
      return handleError(error, reply, 'criação de alocação financeira');
    }
  });

  // GET /simulations/:simulationId/allocations/financial - Listar alocações financeiras de uma simulação
  app.get('/simulations/:simulationId/allocations/financial', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const getParams = z.object({ 
        simulationId: z.string().cuid('ID da simulação inválido')
      });
      
      const { simulationId } = getParams.parse(request.params);
      
      const simulationExists = await prisma.simulation.findUnique({
        where: { id: simulationId }
      });

      if (!simulationExists) {
        return reply.status(404).send({ message: 'Simulação não encontrada' });
      }

      // Busca as alocações e inclui o histórico de cada uma
      const allocations = await prisma.financialAllocation.findMany({
        where: { simulationId },
        include: {
          history: {
            orderBy: { date: 'desc' }, // Ordena o histórico de cada alocação
          },
        },
        orderBy: { createdAt: 'asc' }, // Ordena a lista de alocações
      });

      return reply.status(200).send(allocations);
    } catch (error) {
      return handleError(error, reply, 'busca de alocações financeiras');
    }
  });

  // POST /simulations/compare - Comparar projeções de múltiplas simulações
  app.post('/simulations/compare', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const compareBody = z.object({
        simulationIds: z.array(z.string().cuid("ID inválido no array")).min(1, "Forneça ao menos um ID"),
      });

      const { simulationIds } = compareBody.parse(request.body);

      const comparisonData: Record<string, any[]> = {};

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
          console.warn(`Simulação com ID ${id} não encontrada durante a comparação.`);
        }
      }));

      return reply.status(200).send(comparisonData);
    } catch (error) {
      return handleError(error, reply, 'comparação de simulações');
    }
  });
}
