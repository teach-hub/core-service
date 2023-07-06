import * as dotenv from 'dotenv';
import { applyMiddleware } from 'graphql-middleware';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import type { GraphQLSchema } from 'graphql';

/**
 * Cargamos dotenv junto con todas las variables de entorno.
 * Esto tiene que hacrese antes que cualquier import
 * de alguna libreria externa.
 *
 */

dotenv.config();

import logger from './logger';
import { writeSchema, checkDB, initializeModels } from './utils';

import adminSchema from './graphql/adminSchema';
import schema from './graphql/schema';
import permissionsMiddleware from './graphql/rules';

const app = express();

(async () => {
  await checkDB();
  initializeModels();
})();

const mountSchemaOn = ({
  endpoint,
  schema,
}: {
  endpoint: string;
  schema: GraphQLSchema;
}) => {
  app.use(
    endpoint,
    graphqlHTTP((request, response) => {
      logger.info(`Receiving request, endpoint: ${request.url}`);
      return { schema, context: { logger, request, response } };
    })
  );
};

writeSchema(schema, path.resolve(__dirname, '../../data/schema.graphql'));

app.use(cors());

// Agregamos como middleware a GraphQL
mountSchemaOn({
  endpoint: '/graphql',
  schema: applyMiddleware(schema, permissionsMiddleware),
});

// TODO. Permisos sobre el admin schema.
// https://teachhub.atlassian.net/browse/TH-123
mountSchemaOn({ endpoint: '/admin/graphql', schema: adminSchema });

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
