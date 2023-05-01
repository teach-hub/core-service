import { GraphQLNonNull, GraphQLString } from 'graphql';

import { fromGlobalId } from '../../graphql/utils';
import { cipher } from '../../utils/encryption';

const buildInvitationCode = ({
  roleId,
  courseId,
}: {
  roleId: string;
  courseId: string;
}): string => {
  // TODO. Validar que roleId y courseId sean existan.

  const cipherEnv = {
    secretKey: 'H+MbQeThWmZq4t7w!z%C&F)J@NcRfUjX',
    initializationVector: 'C&F)J@NcRfUjXn2r',
  };

  const invitationCode = cipher({ roleId, courseId }, cipherEnv);

  return invitationCode;
};

export const inviteMutations = {
  generateInvitationCode: {
    name: 'GenerateInvitationCode',
    type: new GraphQLNonNull(GraphQLString),
    description: 'Generates an invitation code',
    args: {
      roleId: {
        type: new GraphQLNonNull(GraphQLString),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    // @ts-expect-error: FIXME
    resolve: (_, args, context) => {
      const { roleId: encodedRoleId, courseId: encodedCourseId } = args;

      const { dbId: roleId } = fromGlobalId(encodedRoleId);
      const { dbId: courseId } = fromGlobalId(encodedCourseId);

      context.logger.info('Building invitation code for', { roleId, courseId });

      const code = buildInvitationCode({ roleId, courseId });

      return code;
    },
  },
};
