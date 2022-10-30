import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { writeSchema } from './utils';

import adminSchema from './schemas/adminSchema';
import schema from './schemas/schema';

const port = process.env.PORT || 4000;

const app = express();

writeSchema(
  schema,
  path.resolve(__dirname, '../../data/schema.graphql'),
);

app.use(cors());

// Agregamos como middleware a GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
}));

app.use('/admin/graphql', graphqlHTTP({
  schema: adminSchema,
}));

app.use('*', (req) => {
  console.log(`Receiving request from ${req.url}`);
})

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

app.listen(port, () => {
  console.log(`Server listening on: ${port}`);
})
