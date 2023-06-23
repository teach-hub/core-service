import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

import {
  countRepositories,
  createRepository,
  findAllRepositories,
  findRepository,
  type RepositoryFields,
  updateRepository,
} from './repositoryService';

import { buildEntityFields } from '../../graphql/fields';
import { buildEntityMutations } from '../../graphql/mutations';

export const getRepositoryFields = ({ addId }: { addId: boolean }) => ({
  ...(addId
    ? {
        id: {
          type: GraphQLID,
        },
      }
    : {}),
  courseId: {
    type: GraphQLID,
  },
  userId: {
    type: GraphQLID,
  },
  name: {
    type: GraphQLString,
  },
  githubId: {
    type: GraphQLInt,
  },
  active: {
    type: GraphQLBoolean,
  },
});

export const InternalRepositoryType = new GraphQLObjectType({
  name: 'RepositoryType',
  description: 'A repository within TeachHub',
  fields: getRepositoryFields({ addId: true }),
});

const findRepositoryCallback = (id: string): Promise<RepositoryFields> =>
  findRepository({ repositoryId: id });

const adminRepositoriesFields = buildEntityFields<RepositoryFields>({
  type: InternalRepositoryType,
  keyName: 'Repository',
  findCallback: findRepositoryCallback,
  findAllCallback: findAllRepositories,
  countCallback: countRepositories,
});

const adminRepositoryMutations = buildEntityMutations<RepositoryFields>({
  entityName: 'Repository',
  entityGraphQLType: InternalRepositoryType,
  createOptions: {
    args: getRepositoryFields({ addId: false }),
    callback: createRepository,
  },
  updateOptions: {
    args: getRepositoryFields({ addId: true }),
    callback: updateRepository,
  },
  deleteOptions: {
    findCallback: findRepositoryCallback,
  },
});

export { adminRepositoryMutations, adminRepositoriesFields };
