import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLID,
  Source,
} from 'graphql';

import { GraphqlObjectTypeFields } from '../../graphql/utils';
import {
  countUsers,
  createUser,
  findAllUsers,
  findUser,
  updateUser,
} from './userService';
import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

const getFields = (addIdd: boolean) => {
  const fields: GraphqlObjectTypeFields = {
    name: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
    githubId: { type: new GraphQLNonNull(GraphQLString) },
    notificationEmail: { type: new GraphQLNonNull(GraphQLString) },
    file: { type: new GraphQLNonNull(GraphQLString) },
    active: { type: GraphQLBoolean },
  };
  if (addIdd) fields.id = { type: GraphQLID };

  return fields;
};

const UserType = new GraphQLObjectType({
  name: 'User',
  description: 'A user within TeachHub',
  fields: getFields(true),
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
  createFields: getFields(false),
  updateFields: getFields(true),
  createCallback: createUser,
  updateCallback: updateUser,
  findCallback: findUserCallback,
});

export { userMutations, userFields };
