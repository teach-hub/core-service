import express from 'express';
import { graphqlHTTP } from 'express-graphql';

import schema from './schema';

const port = process.env.PORT || 3000;

const app = express();

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

// Agregamos como middleware a GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
}));

app.listen(port, () => {
  console.log(`Server listening on: ${port}`);
})
