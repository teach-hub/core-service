import {
  GraphQLBoolean,
  GraphQLFieldConfigMap,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { chunk, difference, flatten, keyBy } from 'lodash';

import { getAssignmentFields } from './internalGraphql';

import {
  AssignmentFields,
  createAssignment,
  findAssignment,
  updateAssignment,
} from './assignmentService';
import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import {
  createSubmission,
  findAllSubmissions,
  SubmissionFields,
} from '../submission/submissionsService';
import {
  createReviewers,
  deleteReviewers,
  findReviewer,
  findReviewers,
  ReviewerFields,
} from '../reviewer/service';
import {
  findAllUserRoles,
  findUserRoleInCourse,
  UserRoleFields,
} from '../userRole/userRoleService';
import { findRole, findAllRoles, isTeacherRole } from '../role/roleService';
import {
  createGroupWithParticipants,
  findAllGroups,
  GroupFields,
} from '../group/service';
import {
  createGroupParticipant,
  findAllGroupParticipants,
} from '../groupParticipant/service';
import { findReview } from '../review/service';

import {
  AssignReviewersInputType,
  ReviewerPreviewType,
  ReviewerType,
} from '../reviewer/internalGraphql';
import { findUser } from '../user/userService';
import { NonExistentSubmissionType, SubmissionType } from '../submission/internalGraphql';
import { InternalGroupParticipantType } from '../groupParticipant/internalGraphql';

import type { AuthenticatedContext } from 'src/context';
import { Optional } from '../../types';
import { sendEmail } from '../../notifications/mail';
import { findCourse } from '../course/courseService';
import { findSubject } from '../subject/subjectService';

const PreviewReviewersFilterType = {
  input: {
    type: new GraphQLInputObjectType({
      name: 'PreviewReviewersFilterInputType',
      fields: {
        consecutive: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
        teachersUserIds: {
          type: new GraphQLNonNull(new GraphQLList(GraphQLString)),
        },
      },
    }),
  },
};

export const AssignmentType = new GraphQLObjectType({
  name: 'AssignmentType',
  fields: {
    ...getAssignmentFields({ addId: false }),
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.id),
        }),
    },
    // Similar a como hacemos con `viewerRole` en `CourseType`.
    //
    // Este campo deja en el backend la logica de devolver el reviewer
    // del viewer actual (si es que hay uno).
    viewerReviewer: {
      type: ReviewerType,
      resolve: async (assignment, _, ctx: AuthenticatedContext) => {
        try {
          const viewer = await findUser({ userId: ctx.viewerUserId });

          if (!viewer) {
            throw new Error('Viewer is not authenticated.');
          }

          let reviewer = null;

          if (assignment.isGroup) {
            const [viewerCourseUserRole] = await findAllUserRoles({
              forCourseId: assignment.courseId,
              forUserId: viewer.id,
            });

            if (!viewerCourseUserRole) {
              throw new Error('Viewer has no role in course.');
            }

            const viewerGroupParticipants = await findAllGroupParticipants({
              forUserRoleId: viewerCourseUserRole.id,
            });

            const assignmentGroups = await findAllGroups({
              forAssignmentId: assignment.id,
            });

            const viewerGroupParticipant = viewerGroupParticipants.find(
              viewerGroupParticipant =>
                assignmentGroups.map(g => g.id).includes(viewerGroupParticipant.groupId)
            );

            if (!viewerGroupParticipant) {
              throw new Error('Viewer is not in any group for this assignment.');
            }

            reviewer = await findReviewer({
              assignmentId: assignment.id,
              revieweeId: viewerGroupParticipant.groupId,
            });
          } else {
            reviewer = await findReviewer({
              assignmentId: assignment.id,
              revieweeId: viewer.id,
            });
          }

          return reviewer?.id ? reviewer : null;
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewer', { error });
          return null;
        }
      },
    },
    isOpenForSubmissions: {
      type: new GraphQLNonNull(GraphQLBoolean),
      description: 'Whether now is between assignment dates',
      resolve: assignment => {
        const now = new Date();
        const startDate = new Date(assignment.startDate);

        if (assignment.allowLateSubmissions) {
          return startDate < now;
        }

        if (assignment.endDate) {
          return startDate < now && now < new Date(assignment.endDate);
        }

        return startDate < now;
      },
    },
    courseId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: String(s.courseId),
        }),
    },
    submissions: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(SubmissionType))),
      args: {
        onlyReviewerSubmissions: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
      },
      resolve: async (assignment, { onlyReviewerSubmissions }, ctx) => {
        const viewerUserRole = await findUserRoleInCourse({
          courseId: assignment.courseId,
          userId: ctx.viewerUserId,
        });
        const viewerRole = await findRole({ roleId: viewerUserRole.roleId });

        if (!viewerRole) {
          throw new Error('Viewer has no role in course.');
        }

        if (!isTeacherRole(viewerRole)) {
          return [];
        }

        const allSubmissions = await findAllSubmissions({
          forAssignmentId: assignment.id,
        });
        const submissions = !onlyReviewerSubmissions
          ? allSubmissions
          : await withUserAsReviewer({
              assignmentId: assignment.id,
              submissions: allSubmissions,
              userId: ctx.viewerUserId,
            });

        ctx.logger.info('Returning submissions', { submissions });

        return submissions.flatMap(submission => {
          return {
            ...submission,
            isGroup: assignment.isGroup,
          };
        });
      },
    },
    viewerSubmission: {
      type: SubmissionType,
      resolve: async (assignment, _, ctx: AuthenticatedContext) => {
        const isGroup = !!assignment.isGroup;

        const viewerUserRole = await findUserRoleInCourse({
          courseId: assignment.courseId,
          userId: ctx.viewerUserId,
        });
        const viewerRole = await findRole({ roleId: viewerUserRole.roleId });

        if (viewerRole && isTeacherRole(viewerRole)) {
          return null;
        }

        const submitterId = await computeSubmitterIdForAssignment({
          userId: ctx.viewerUserId,
          assignment,
        });

        if (!submitterId) {
          return null;
        }

        const [submission] = await findAllSubmissions({
          forAssignmentId: assignment.id,
          forSubmitterId: submitterId,
        });

        if (!submission) {
          return null;
        }

        return {
          ...submission,
          isGroup,
        };
      },
    },
    groupParticipants: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(InternalGroupParticipantType))
      ),
      resolve: async assignment => {
        const assignmentGroups = await findAllGroups({ forAssignmentId: assignment.id });

        return findAllGroupParticipants({
          forGroupIds: assignmentGroups.map(group => group.id),
        });
      },
    },
    reviewers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerType))),
      resolve: async (assignment, _, ctx: AuthenticatedContext) => {
        try {
          const reviewers = await findReviewers({ assignmentId: assignment.id });

          ctx.logger.info('Returning reviewers for assignment', {
            assignment,
            reviewers,
          });

          return reviewers.map(reviewer => {
            return {
              id: reviewer.id,
              assignmentId: reviewer.assignmentId,
              reviewerUserId: reviewer.reviewerUserId,
              revieweeId: reviewer.revieweeId,
              isGroup: assignment.isGroup,
            };
          });
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewers', { error });
          return [];
        }
      },
    },
    previewReviewers: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(ReviewerPreviewType))),
      args: PreviewReviewersFilterType,
      resolve: async (assignment, args, ctx) => {
        try {
          const { consecutive, teachersUserIds: encodedTeacherUserIds } = args.input;
          const teachersUserIds: number[] =
            encodedTeacherUserIds.map(fromGlobalIdAsNumber);

          const alreadySetReviewers = await findReviewers({
            assignmentId: assignment.id,
          });
          const alreadySetRevieweeIds = alreadySetReviewers.map(x => x.revieweeId);

          // Mover esto a una function: Buscar profesores y alumnos
          // es bastante comun para cualquier flujo.

          const courseUserRoles = await findAllUserRoles({
            forCourseId: assignment.courseId,
          });

          const allRolesById = await findAllRoles({}).then(allRoles =>
            keyBy(allRoles, 'id')
          );

          let revieweeIds: GroupFields['id'][] | UserRoleFields['userId'][] = [];

          const userRoleBelongsToTeacher = (userRole: UserRoleFields) =>
            allRolesById[userRole.roleId!].isTeacher;

          if (assignment.isGroup) {
            // -- Manejo de grupos. --
            const assignmentGroups = await findAllGroups({
              forAssignmentId: assignment.id,
            }).then(groups => groups.map(g => g.id));

            revieweeIds = difference(assignmentGroups, alreadySetRevieweeIds);
          } else {
            const studentsUserIds = courseUserRoles
              .filter(userRole => !userRoleBelongsToTeacher(userRole))
              .map(userRole => userRole.userId);

            revieweeIds = difference(studentsUserIds, alreadySetRevieweeIds);
          }

          const teachersUserRoles = courseUserRoles.filter(userRole => {
            const roleIsTeacher = userRoleBelongsToTeacher(userRole);

            if (!teachersUserIds.length) {
              ctx.logger.info('No teachers matched the filters, using all as default');
              return roleIsTeacher;
            }

            return roleIsTeacher && teachersUserIds.includes(userRole.userId!);
          });

          ctx.logger.info('Returning reviewers preview', {
            studentsUserRoles: revieweeIds,
            teachersUserRoles,
            args: { args: args.input },
          });

          // Consecutive
          if (consecutive) {
            const chunksAmount = Math.ceil(revieweeIds.length / teachersUserRoles.length);

            const result = chunk(revieweeIds, chunksAmount).map((chunk, i) => {
              const reviewerUserId = teachersUserRoles[i].userId;

              return chunk.map(revieweeId => ({
                id: `${assignment.id}-${revieweeId}-${reviewerUserId}`,
                reviewerUserId,
                revieweeId,
                assignmentId: assignment.id,
                isGroup: assignment.isGroup,
              }));
            });

            return flatten(result);
          }

          // Alternate
          return revieweeIds.map((revieweeId, i) => {
            const reviewerUserId = teachersUserRoles[i % teachersUserRoles.length].userId;

            return {
              id: `${assignment.id}-${revieweeId}-${reviewerUserId}`,
              reviewerUserId,
              revieweeId,
              assignmentId: assignment.id,
              isGroup: assignment.isGroup,
            };
          });
        } catch (error) {
          ctx.logger.error('Error', error);
          return [];
        }
      },
    },
    nonExistentSubmissions: {
      type: new GraphQLNonNull(
        new GraphQLList(new GraphQLNonNull(NonExistentSubmissionType))
      ),
      args: {
        onlyReviewerSubmissions: {
          type: new GraphQLNonNull(GraphQLBoolean),
        },
      },
      resolve: async (assignment, { onlyReviewerSubmissions }, ctx) => {
        try {
          const submissions = await findAllSubmissions({
            forAssignmentId: assignment.id,
          });
          const allSubmittersIds = submissions.map(submission => submission.submitterId);
          const isGroup = !!assignment.isGroup;

          let nonExistentSubmittersIds: number[] = [];

          /*
           * Note:
           *   - Undefined will be considered as if no filtering is required
           *   - Empty list will be considered that viewer is reviewer to no submission
           * */
          const viewerRevieweeIds: Optional<number[]> = !onlyReviewerSubmissions
            ? undefined
            : await findReviewers({
                assignmentId: assignment.id,
                reviewerUserId: ctx.viewerUserId,
              }).then(reviewers => reviewers.map(r => r.revieweeId));

          if (viewerRevieweeIds && viewerRevieweeIds.length === 0) {
            return []; // Not allowed to view any submission
          }

          const viewerCanViewReviewee = (revieweeId: number) =>
            viewerRevieweeIds ? viewerRevieweeIds.includes(revieweeId) : true;

          if (!isGroup) {
            /* Find all user roles and keep the ones from students */
            const userRoles = await findAllUserRoles({
              forCourseId: assignment.courseId,
            });
            const allRoles = await findAllRoles({});
            const allRolesById = keyBy(allRoles, 'id');

            const courseRoles = userRoles.filter(
              userRole => !isTeacherRole(allRolesById[userRole.roleId!])
            );

            /* Compare users with submissions to the ones that did not submit */
            const courseUsersIds = courseRoles
              .map(userRole => userRole.userId)
              .filter(viewerCanViewReviewee);

            nonExistentSubmittersIds = difference(courseUsersIds, allSubmittersIds);
          } else {
            /* Search for all course groups in assignment */
            const assignmentGroups = await findAllGroups({
              forAssignmentId: assignment.id,
            });

            const assignmentGroupIds = assignmentGroups
              .map(g => g.id)
              .filter(viewerCanViewReviewee);

            /* Compare groups with submissions to the ones that did not submit */
            nonExistentSubmittersIds = difference(assignmentGroupIds, allSubmittersIds);
          }

          return nonExistentSubmittersIds.map(submitterId => ({
            assignmentId: assignment.id,
            submitterId,
            isGroup,
          }));
        } catch (error) {
          ctx.logger.error('An error happened while returning non existing submissions', {
            error,
          });
          return [];
        }
      },
    },
    nonExistentViewerSubmission: {
      type: NonExistentSubmissionType,
      resolve: async (assignment, _, ctx) => {
        try {
          const isGroup = !!assignment.isGroup;

          const viewerUserRole = await findUserRoleInCourse({
            courseId: assignment.courseId,
            userId: ctx.viewerUserId,
          });
          const viewerRole = await findRole({ roleId: viewerUserRole.roleId });

          if (viewerRole && isTeacherRole(viewerRole)) {
            return null;
          }

          const submitterId = await computeSubmitterIdForAssignment({
            userId: ctx.viewerUserId,
            assignment,
          });

          if (!submitterId) {
            return null;
          }

          const [submission] = await findAllSubmissions({
            forAssignmentId: assignment.id,
            forSubmitterId: submitterId,
          });

          if (submission) {
            return null;
          }

          return { assignmentId: assignment.id, submitterId, isGroup };
        } catch (error) {
          ctx.logger.error('An error happened while returning non existing submissions', {
            error,
          });
          return [];
        }
      },
    },
  },
});

export const assignmentMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
  createAssignment: {
    description: 'Creates an assignment in a course',
    type: AssignmentType,
    args: getAssignmentFields({ addId: false }),
    resolve: async (_, args, ctx) => {
      const assignmentData: Omit<AssignmentFields, 'id'> = parseAssignmentData(args);

      ctx.logger.info('Creating assignment with data', assignmentData);

      return await createAssignment(assignmentData);
    },
  },
  updateAssignment: {
    description: 'Updates an assignment in a course',
    type: AssignmentType,
    args: getAssignmentFields({ addId: true }),
    resolve: async (_, args, ctx) => {
      const assignmentData: Omit<AssignmentFields, 'id'> = parseAssignmentData(args);
      ctx.logger.info(`Updating assignment with data: ` + JSON.stringify(assignmentData));

      const { id } = args;
      const fixedId = fromGlobalIdAsNumber(id);

      return await updateAssignment(fixedId, assignmentData);
    },
  },
  removeReviewers: {
    // Set nullable to avoid 500 error if error raises
    type: AssignmentType,
    args: {
      reviewers: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      try {
        const { assignmentId: encodedAssignmentId, reviewers: encodedReviewers } = args;

        const reviewerIds = encodedReviewers.map(fromGlobalIdAsNumber);
        const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);

        const review = await findReview({ reviewerId: reviewerIds[0] });

        if (review) {
          throw new Error('ALREADY_REVIEWED - Reviewers already reviewed');
        }

        const result = await deleteReviewers({ ids: reviewerIds });

        context.logger.info('Removed reviewers from assignment', { reviewerIds, result });

        return findAssignment({ assignmentId: assignmentId });
      } catch (e) {
        context.logger.error('Error removing reviewers', e);
        throw e;
      }
    },
  },
  // Esto vive aca porque si bien el manejo es de reviewers
  // meterlo en reviewers genera un dependencia circular.
  assignReviewers: {
    type: AssignmentType,
    args: {
      input: AssignReviewersInputType.input,
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      try {
        const {
          input: { assignmentId: encodedAssignmentId, reviewers },
        } = args;

        const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
        const assignment = await findAssignment({ assignmentId: assignmentId });

        if (!assignment) {
          throw new Error('Assignment not found');
        }

        context.logger.info('Assigning reviewers for assignment', { id: assignmentId });

        const reviewerFields: ReviewerFields[] = reviewers.map(
          (reviewer: { reviewerUserId: string; revieweeId: string }) => {
            return {
              reviewerUserId: fromGlobalIdAsNumber(reviewer.reviewerUserId),
              revieweeId: fromGlobalIdAsNumber(reviewer.revieweeId),
              assignmentId: assignment.id,
            };
          }
        );

        context.logger.info('Assigning reviewers in assignment', {
          assignmentId: assignment.id,
          reviewerFields,
        });

        await createReviewers(reviewerFields);

        return assignment;
      } catch (e) {
        context.logger.error('Error on assignReviewers mutation', { error: String(e) });
        throw e;
      }
    },
  },
  /* Notifications are sent in the context of an assignment */
  sendNotification: {
    type: new GraphQLNonNull(GraphQLBoolean),
    args: {
      recipients: {
        type: new GraphQLList(new GraphQLNonNull(GraphQLString)),
      },
      body: {
        type: new GraphQLNonNull(GraphQLString),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        // Required for permission check of rules
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, { assignmentId, recipients, body, senderUserId }, context) => {
      const assignment = await findAssignment({
        assignmentId: fromGlobalIdAsNumber(assignmentId),
      });
      if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

      const course = await findCourse({
        courseId: assignment.courseId,
      });
      if (!course) throw new Error(`Course ${assignment.courseId} not found`);

      const courseSubject = await findSubject({
        subjectId: course.subjectId,
      });
      if (!courseSubject) throw new Error(`Subject ${course.subjectId} not found`);

      /* Viewer is the one responsible of the notification */
      const senderUser = await findUser({
        userId: context.viewerUserId,
      });
      if (!senderUser) throw new Error(`User ${senderUserId} not found`);

      /*
       * Add complete information in mail subject. Example:
       * "78.10: Notificación de Juan Perez sobre el trabajo práctico Introducción a la programación"
       * */
      const subject = `${courseSubject.code}: Notificación de ${senderUser.name} ${senderUser.lastName} sobre el trabajo práctico ${assignment.title}`;

      return await sendEmail({
        recipients,
        subject,
        body,
      });
    },
  },
  createGroupWithParticipants: {
    /**
     * Por que una mutation de groups devuelve un assignment?
     * Porque el assignment es el que tiene la lista de grupos, y es el que se usa para
     * mostrar la lista de grupos en el front.
     */
    type: AssignmentType,
    description: 'Creates a group and adds a list of participants to it',
    args: {
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      participantUserRoleIds: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      },
    },
    resolve: async (_, args, context) => {
      const {
        assignmentId: encodedAssignmentId,
        courseId: encodedCourseId,
        participantUserRoleIds: encodedParticipantUserRoleIds,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const courseId = fromGlobalIdAsNumber(encodedCourseId);
      const participantUserRoleIds: number[] =
        encodedParticipantUserRoleIds.map(fromGlobalIdAsNumber);

      const logText = `Creating group for assignment ${assignmentId} for user with roles ${participantUserRoleIds.join(
        ', '
      )}`;

      context.logger.info(logText);

      await createGroupWithParticipants({
        membersUserRoleIds: participantUserRoleIds,
        courseId,
        assignmentId,
      });

      return findAssignment({ assignmentId });
    },
  },
  addParticipantsToGroup: {
    type: AssignmentType,
    description: 'Adds a list of participants to a group',
    args: {
      groupId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      participantUserRoleIds: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLID))),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    resolve: async (_, args, context) => {
      const {
        assignmentId: encodedAssignmentId,
        groupId: encodedGroupId,
        participantUserRoleIds: encodedParticipantUserRoleIds,
      } = args;

      const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);
      const groupId = fromGlobalIdAsNumber(encodedGroupId);
      const participantUserRoleIds: number[] =
        encodedParticipantUserRoleIds.map(fromGlobalIdAsNumber);

      await validateGroupOnJoin({ assignmentId });

      context.logger.info(
        `Adding users with roles ${participantUserRoleIds.join(
          ', '
        )} to group ${groupId} for assignment ${assignmentId}`
      );

      await Promise.all(
        participantUserRoleIds.map(async userRoleId =>
          createGroupParticipant({
            groupId,
            userRoleId,
            active: true,
          })
        )
      );

      return findAssignment({ assignmentId });
    },
  },
  createSubmission: {
    description: 'Creates a new submission for the viewer',
    type: AssignmentType,
    args: {
      assignmentId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      pullRequestUrl: {
        type: new GraphQLNonNull(GraphQLString),
      },
    },
    resolve: async (_, args, ctx) => {
      try {
        const { assignmentId: encodedAssignmentId, pullRequestUrl } = args;
        const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);

        ctx.logger.info('Creating submission for assignment', {
          assignmentId,
          userId: ctx.viewerUserId,
        });

        const createdSubmission = await createSubmission({
          submitterUserId: ctx.viewerUserId,
          assignmentId: Number(assignmentId),
          pullRequestUrl,
        });

        if (!createdSubmission) {
          throw new Error('Error while creating submission');
        }

        return findAssignment({ assignmentId: createdSubmission.assignmentId });
      } catch (e) {
        ctx.logger.error('Error while creating submission', { error: e });
        throw e;
      }
    },
  },
};

// FIXME
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseAssignmentData = (args: any): Omit<AssignmentFields, 'id'> => {
  const {
    courseId,
    title,
    startDate,
    endDate,
    link,
    allowLateSubmissions,
    active,
    isGroup,
    description,
  } = args;

  const fixedCourseId = fromGlobalIdAsNumber(courseId);

  return {
    title,
    startDate,
    endDate,
    link,
    active,
    isGroup,
    allowLateSubmissions,
    description,
    courseId: fixedCourseId,
  };
};

async function computeSubmitterIdForAssignment({
  userId,
  assignment,
}: {
  userId: number;
  assignment: AssignmentFields;
}): Promise<number | null> {
  const userUserRole = await findUserRoleInCourse({
    courseId: assignment.courseId,
    userId,
  });

  if (!userUserRole) {
    throw new Error('User is not enrolled in course');
  }

  if (!assignment.isGroup) {
    return userId;
  }

  const userGroupParticipants = await findAllGroupParticipants({
    forUserRoleId: userUserRole.id,
  });

  const assignmentGroups = await findAllGroups({
    forAssignmentId: assignment.id,
  });

  const userAssignmentGroup = assignmentGroups.find(group =>
    userGroupParticipants.map(p => p.groupId).includes(group.id)
  );

  if (!userAssignmentGroup) {
    // Si el usuario no esta asignado a un grupo
    // entonces no hay submission.
    return null;
  }

  return userAssignmentGroup.id;
}

const withUserAsReviewer = async ({
  submissions,
  assignmentId,
  userId,
}: {
  submissions: SubmissionFields[];
  assignmentId: number;
  userId: number;
}) => {
  const viewerRevieweeIds = await findReviewers({
    assignmentId,
    reviewerUserId: userId,
  }).then(y => y.map(x => x.revieweeId));

  return submissions.filter(submission =>
    viewerRevieweeIds.includes(submission.submitterId)
  );
};

// TODO. De aca para abajo esta duplicado con
// src/lib/groupParticipant/internalGraphql.ts
// Hay que mandarlo a una funcion aparte

const validateGroupOnJoin = async ({ assignmentId }: { assignmentId: number }) => {
  const assignment = await findAssignment({ assignmentId });
  if (!assignment?.isGroup) {
    throw new Error('Assignment is not a group assignment');
  }
};
