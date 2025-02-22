import fastify from 'fastify';
import { env } from './env';
import { transactionsRoutes } from './routes/transactions';
import cookie from '@fastify/cookie';

export const app = fastify();

app.register(cookie);

// GET, POST, PUT, PATCH, DELETE

app.register(transactionsRoutes, {
  prefix: 'transactions',
});
