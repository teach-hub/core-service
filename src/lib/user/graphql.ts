import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLID,
  Source,
} from 'graphql';

import {
  countUsers,
  createUser,
  findAllUsers,
  findUser,
  updateUser,
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

const UserType: GraphQLObjectType<Source, Context> = new GraphQLObjectType({
  name: 'User',
  description: 'A user within TeachHub',
  fields: getFields({ addId: true }),
});

const findUserCallback = (id: string) => {
  return findUser({ userId: id });
};

const userFields = buildEntityFields({
  type: UserType,
  keyName: 'User',
  typeName: 'user',
  findCallback: findUserCallback,
  findAllCallback: findAllUsers,
  countCallback: countUsers,
});

const userMutations = buildEntityMutations({
  type: UserType,
  keyName: 'User',
  typeName: 'user',
  createFields: getFields({ addId: false }),
  updateFields: getFields({ addId: true }),
  createCallback: createUser,
  updateCallback: updateUser,
  findCallback: findUserCallback,
});

export { userMutations, userFields };
