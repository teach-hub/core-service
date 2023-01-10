import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { writeSchema, checkDB, initializeDB } from './utils';

import adminSchema from './graphql/adminSchema';
import schema from './graphql/schema';

const port = process.env.PORT || 4000;

const app = express();

initializeDB();

writeSchema(schema, path.resolve(__dirname, '../../data/schema.graphql'));

app.use(cors());

app.use('*', (req, _, next) => {
  console.log(`Receiving request, endpoint: ${req.baseUrl} from ${req.ip}`);
  next();
});

// Agregamos como middleware a GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
  })
);

app.use(
  '/admin/graphql',
  graphqlHTTP({
    schema: adminSchema,
  })
);

app.get('/healthz', async (_, response) => {
  try {
    await checkDB();
    response.status(200).send('OK');
  } catch (e: Error | any) {
    console.log(e);
    response.status(500).send(e.message);
  }
});

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

app.listen(port, () => {
  console.log(`Server listening on: ${port}`);
});
