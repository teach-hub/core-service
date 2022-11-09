import path from 'path';
import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';

import { writeSchema, checkDB } from './utils';

import adminSchema from './schemas/adminSchema';
import schema from './schemas/schema';

const port = process.env.PORT || 4000;

const app = express();

writeSchema(
  schema,
  path.resolve(__dirname, '../../data/schema.graphql'),
);

app.use(cors());

app.use('*', (req, _, next) => {
  console.log(`Receiving request, endpoint: ${req.baseUrl}`);
  next();
})

// Agregamos como middleware a GraphQL
app.use('/graphql', graphqlHTTP({
  schema,
}));

app.use('/admin/graphql', graphqlHTTP({
  schema: adminSchema,
}));

app.get('/healthz', async (_, response) =>{
   try {
     await checkDB();
     response.status(200).send('OK');
   } catch (e: Error | any) {
     console.log(e)
     response.status(500).send(e.message)
   }
})

app.get('/', (_, res) => {
  res.send('Welcome to TeachHub!');
});

app.listen(port, () => {
  console.log(`Server listening on: ${port}`);
})
