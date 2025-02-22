import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { knex } from '../database';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

/*
TESTES:
- Unitários: unidade da aplicação
- Integração: integração entre unidades
- E2E: integração entre sistemas (ponta a ponta), simula o comportamento
do usuário

- Teste E2E no front-end: abre a página de login, digite o texto 
carlos@email.com no campo de email, digite a senha 123456 no campo...
- Teste E2E no back-end: chamada HTTP, WebSockets, etc...

-> Pirâmide de testes: E2E -> Integração -> Unitários
- e2e: não dependem de nenhuma tecnologia, não dependem de arquitetura

*/

// Cookies -> Formas de manter contexto entre requisições

export async function transactionsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (request, reply) => {
    console.log(`[${request.method}] ${request.url}`);
  });

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, replay) => {
      const { sessionId } = request.cookies;
      const transactions = await knex('transactions')
        .select()
        .where('session_id', sessionId);

      return { transactions };
    }
  );

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async request => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { sessionId } = request.cookies;

    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex('transactions')
      .where('id', id)
      .andWhere('session_id', sessionId)
      .first();

    return { transaction };
  });

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async request => {
    const { sessionId } = request.cookies;
    const summary = await knex('transactions')
      .where('session_id', sessionId)
      .sum('amount', { as: 'amount' })
      .first();

    return { summary };
  });

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body
    );

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
