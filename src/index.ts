import * as dotenv from 'dotenv';

import type { GraphQLSchema } from 'graphql';

/**
 * !!! IMPORTANTE !!!
 * ------------------
 *
 * Cargamos dotenv junto con todas las variables de entorno.
 * Esto tiene que hacrese antes que cualquier import
 * de alguna libreria externa. No importar nada arriba de esta linea.
 */
dotenv.config();

import { applyMiddleware } from 'graphql-middleware';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import logger from './logger';
import { checkDB, initializeModels, writeSchema } from './utils';

import { buildContextForRequest } from './context';
import adminSchema from './graphql/adminSchema';
import schema from './graphql/schema';
import permissionsMiddleware from './graphql/rules';

const app = express();

(async () => {
  await checkDB();
  initializeModels();
})();

const buildGraphQLMiddleware = (schema: GraphQLSchema) => {
  return graphqlHTTP(async (request, response, params) => ({
    pretty: true,
    schema,
    context: await buildContextForRequest(request, response, logger, params),
    customFormatErrorFn: (error: Error) => {
      logger.error('GraphQL Error:', error);
      return error;
    },
  }));
};

writeSchema(schema, path.resolve(__dirname, '../../data/schema.graphql'));

app.use(cors());

// Agregamos como middleware a GraphQL
app.use(
  '/graphql',
  buildGraphQLMiddleware(applyMiddleware(schema, permissionsMiddleware))
);

// TODO. Permisos sobre el admin schema.
// https://teachhub.atlassian.net/browse/TH-123
app.use('/admin/graphql', buildGraphQLMiddleware(adminSchema));

app.get('/healthz', async (_, response) => {
  try {
    await checkDB();
    response.status(200).send('OK');
    // FIXME. No copiar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: Error | any) {
    logger.error(e);
    response.status(500).send(e.message);
  }
});

const port = process.env.PORT || 4000;

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

app.listen(port, () => {
  logger.info(`Server listening on: ${port}`);
});
