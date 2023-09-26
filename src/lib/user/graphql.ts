import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
} from 'graphql';

import {
  countUsers,
  createUser,
  findAllUsers,
  findUser,
  updateUser,
  type UserFields,
} from './userService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

import type { Context } from 'src/types';

const getFields = ({ addId }: { addId: boolean }) => {
  const fields = {
    ...(addId ? { id: { type: GraphQLID } } : {}),
    name: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    githubId: { type: new GraphQLNonNull(GraphQLString) },
    notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
    file: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: GraphQLBoolean },
  };

  return fields;
};

const UserType: GraphQLObjectType<unknown, Context> = new GraphQLObjectType({
  name: 'User',
  description: 'A user within TeachHub',
  fields: getFields({ addId: true }),
});

const findUserCallback = (id: number): Promise<UserFields | null> => {
  return findUser({ userId: id });
};

const userFields = buildEntityFields<UserFields>({
  type: UserType,
  keyName: 'User',
  findCallback: findUserCallback,
  findAllCallback: findAllUsers,
  countCallback: countUsers,
});

const userMutations = buildEntityMutations<UserFields>({
  entityGraphQLType: UserType,
  entityName: 'User',
  createOptions: {
    callback: createUser,
    args: getFields({ addId: false }),
  },
  updateOptions: {
    callback: updateUser,
    args: getFields({ addId: true }),
  },
  deleteOptions: {
    findCallback: findUserCallback,
  },
});

export { userMutations, userFields };
