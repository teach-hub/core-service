import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { writeSchema } from './utils';

import schema from './schema';
import adminSchema from './adminSchema';

const port = process.env.PORT || 4000;

const app = express();

app.use(cors());

// Agregamos como middleware a GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
}));

app.use('/admin/graphql', graphqlHTTP({
  schema: adminSchema,
}));

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

writeSchema(
  schema,
  path.resolve(__dirname, '../data/schema.graphql'),
);

writeSchema(
  schema,
  path.resolve(__dirname, '../data/adminSchema.graphql'),
);

app.listen(port, () => {
  console.log(`Server listening on: ${port}`);
})
