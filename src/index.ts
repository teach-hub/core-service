import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { writeSchema } from './utils';
import schema from './schema';

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

// Agregamos como middleware a GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
}));

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

writeSchema(
  schema,
  path.resolve(__dirname, '../data/schema.graphql'),
);

app.listen(port, () => {
  console.log(`Server listening on: ${port}`);
})
