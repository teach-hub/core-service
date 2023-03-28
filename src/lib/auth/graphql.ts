import {
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
} from 'graphql';
import type { Context } from '../../types';
import { exchangeCodeForToken } from '../../github/auth';

export const Login: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'Login',
  description: 'Authenticated data',
  fields: {
    token: { type: GraphQLString },
  },
});

export const authMutations: GraphQLFieldConfigMap<unknown, Context> = {
  login: {
    type: Login,
    description: 'Login user',
    args: {
      code: { type: GraphQLString },
    },
    resolve: async (_, args, __) => {
      const { code } = args;

      return {
        token: await exchangeCodeForToken(code),
      };
    },
  },
};
