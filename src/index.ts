import * as dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

// Cargamos todas las variables de entorno.
dotenv.config();

import logger from './logger';

import { writeSchema, checkDB, initializeDB } from './utils';

import adminSchema from './graphql/adminSchema';
import schema from './graphql/schema';

const app = express();

(async () => {
  await checkDB();
  initializeDB();
})();

writeSchema(schema, path.resolve(__dirname, '../../data/schema.graphql'));

app.use(cors());

app.use('*', (req, _, next) => {
  logger.info(`Receiving request, endpoint: ${req.baseUrl} from ${req.ip}`);
  next();
});

// Agregamos como middleware a GraphQL
app.use(
  '/graphql',
  graphqlHTTP((request, response) => {
    return { schema, context: { logger, request, response } };
  })
);

app.use(
  '/admin/graphql',
  graphqlHTTP((request, response) => {
    return { schema: adminSchema, context: { logger, request, response } };
  })
);

app.get('/healthz', async (_, response) => {
  try {
    await checkDB();
    response.status(200).send('OK');
  } catch (e: Error | any) {
    logger.error(e);
    response.status(500).send(e.message);
  }
});

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  logger.info(`Server listening on: ${port}`);
});
