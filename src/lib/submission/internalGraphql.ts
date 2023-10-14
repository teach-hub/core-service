import type { GraphQLFieldConfigMap } from 'graphql';
import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLUnionType,
} from 'graphql';

import { uniq, minBy, maxBy } from 'lodash';

import { fromGlobalIdAsNumber, toGlobalId } from '../../graphql/utils';

import {
  createSubmission,
  findSubmission,
  SubmissionFields,
  updateSubmission,
} from '../submission/submissionsService';
import { UserFields, findUser, findUserWithGithubId } from '../user/userService';
import { findGroup } from '../group/service';
import { getViewer, UserType } from '../user/internalGraphql';

import { dateToString } from '../../utils/dates';
import { ReviewerType } from '../reviewer/internalGraphql';
import { InternalGroupType } from '../group/internalGraphql';
import { findReviewer } from '../reviewer/service';
import {
  findReviewerAndCheckIfIsReviewerForSubmission,
  InternalReviewType,
} from '../review/internalGraphql';
import { createReview, findAllReviews, findReview } from '../review/service';
import { AssignmentType } from '../assignment/graphql';
import { findAssignment } from '../assignment/assignmentService';
import { findCourse } from '../course/courseService';
import { getToken } from '../../utils/request';

import {
  CommentData,
  getPullRequestComments,
  getRepoNameFromUrl,
} from '../../github/pullrequests';
import { listCommits, CommitInfo } from '../../github/repositories';
import { initOctokit } from '../../github/config';

import type { AuthenticatedContext } from '../../context';

export const SubmitterUnionType = new GraphQLUnionType({
  name: 'SubmitterUnionType',
  types: [UserType, InternalGroupType],
  resolveType: obj => {
    return 'file' in obj ? UserType : InternalGroupType;
  },
});

const CommentType: GraphQLObjectType<CommentData, AuthenticatedContext> =
  new GraphQLObjectType({
    name: 'Comment',
    description: 'A github comment within TeachHub',
    fields: {
      id: {
        type: GraphQLID,
      },
      body: {
        type: GraphQLString,
      },
      createdAt: {
        type: GraphQLString,
      },
      updatedAt: {
        type: GraphQLString,
      },
      githubUserId: {
        type: GraphQLString,
      },
      githubUsername: {
        type: GraphQLString,
      },
    },
  });

export const NonExistentSubmissionType = new GraphQLObjectType<
  { submitterId: number; assignmentId: number; isGroup: boolean },
  AuthenticatedContext
>({
  name: 'NonExistentSubmissionType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'nonExistentSubmission',
          dbId: `${s.submitterId}-${s.assignmentId}`,
        }),
    },
    reviewer: {
      type: ReviewerType,
      description: 'Reviewer of the submission to be made',
      resolve: async nonExistentSubmission => {
        const reviewer = await findReviewer({
          revieweeId: nonExistentSubmission.submitterId,
          assignmentId: nonExistentSubmission.assignmentId,
        });

        /* Reviewer may or may not be assigned yet */
        if (reviewer) {
          return reviewer;
        }
        return null;
      },
    },
    submitter: {
      type: new GraphQLNonNull(SubmitterUnionType),
      description: 'User or group who has not made the submission',
      resolve: async (nonExistentSubmission, _, __) => {
        if (nonExistentSubmission.isGroup) {
          return findGroup({ groupId: nonExistentSubmission.submitterId });
        }

        return findUser({ userId: nonExistentSubmission.submitterId });
      },
    },
  }),
});

const ContributionType = new GraphQLObjectType({
  name: 'ContributionType',
  fields: {
    user: {
      type: new GraphQLNonNull(UserType),
    },
    commitsMade: {
      type: new GraphQLNonNull(GraphQLInt),
    },
  },
});

export const SubmissionType: GraphQLObjectType = new GraphQLObjectType<
  SubmissionFields & { isGroup: boolean },
  AuthenticatedContext
>({
  name: 'SubmissionType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'submission',
          dbId: s.id,
        }),
    },
    assignmentId: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: s =>
        toGlobalId({
          entityName: 'assignment',
          dbId: s.assignmentId,
        }),
    },
    submitter: {
      type: new GraphQLNonNull(SubmitterUnionType),
      description: 'User or group who has made the submission',
      resolve: async (submission, _, ctx) => {
        const assignment = await findAssignment({
          assignmentId: submission.assignmentId,
        });

        if (!assignment) {
          throw new Error('Assignment not found.');
        }

        if (assignment.isGroup) {
          ctx.logger.info('Looking for grupal submission', {
            submitterId: submission.submitterId,
          });
          const group = await findGroup({ groupId: submission.submitterId });
          if (!group) {
            return group;
          }
          return { ...group, assignmentId: assignment.id };
        }

        return findUser({ userId: submission.submitterId });
      },
    },
    reviewer: {
      type: ReviewerType,
      resolve: async (submission, _, ctx: AuthenticatedContext) => {
        try {
          const reviewer = await findSubmissionReviewer(submission);

          if (!reviewer) {
            return null;
          }

          ctx.logger.info('Returning reviewer', { reviewer });

          return reviewer;
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewer', { error });
          return [];
        }
      },
    },
    pullRequestUrl: {
      type: new GraphQLNonNull(GraphQLString),
    },
    submittedAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Date when submission was created',
      resolve: s => s.submittedAt && dateToString(s.submittedAt),
    },
    submittedAgainAt: {
      type: GraphQLString,
      description: 'Date when submission was submitted again',
      resolve: s => s.submittedAgainAt && dateToString(s.submittedAgainAt),
    },
    review: {
      type: InternalReviewType,
      resolve: async (submission, _, ctx: AuthenticatedContext) => {
        try {
          const review = await findReview({
            submissionId: submission.id,
          });

          ctx.logger.info('Returning review', { review });

          if (!review) {
            return null;
          }

          return review;
        } catch (error) {
          ctx.logger.error('An error happened while returning review', { error });
          return null;
        }
      },
    },
    assignment: {
      description: 'Finds an assignment from a submission',
      type: AssignmentType,
      resolve: async (submission, _, { logger }) => {
        const assignment = await findAssignment({
          assignmentId: submission.assignmentId,
        });

        logger.info('Finding assignment from sub', { assignment });
        return assignment;
      },
    },
    viewerCanReview: {
      type: new GraphQLNonNull(GraphQLBoolean),
      resolve: async (submission, _, ctx: AuthenticatedContext) => {
        try {
          const viewer = await getViewer(ctx);

          if (!viewer) {
            return false;
          }

          const reviewer = await findSubmissionReviewer(submission);

          /* Viewer id must match reviewer user id to enable review */
          return Boolean(reviewer?.reviewerUserId === viewer.id);
        } catch (error) {
          ctx.logger.error('An error happened while returning reviewEnabledForViewer', {
            error,
          });
          return false;
        }
      },
    },
    metrics: {
      type: new GraphQLObjectType({
        name: 'SubmissionMetricsType',
        fields: {
          firstCommitDate: {
            type: GraphQLString,
            resolve: async (commits: CommitInfo[]) => {
              const firstCommit = minBy(commits, commit => commit.date);
              return firstCommit
                ? dateToString(new Date(firstCommit.date))
                : dateToString(new Date());
            },
          },
          lastCommitDate: {
            type: GraphQLString,
            resolve: async (commits: CommitInfo[]) => {
              const firstCommit = maxBy(commits, commit => commit.date);
              return firstCommit
                ? dateToString(new Date(firstCommit.date))
                : dateToString(new Date());
            },
          },
          contributions: {
            type: new GraphQLNonNull(
              new GraphQLList(new GraphQLNonNull(ContributionType))
            ),
            resolve: async (commits: CommitInfo[]) => {
              const githubIds = uniq(commits.map(c => String(c.authorGithubId)));
              const users = githubIds.length
                ? await Promise.all(githubIds.map(findUserWithGithubId))
                : [];

              const usersByGithubId = users.reduce((acc, user) => {
                if (!user) {
                  return acc;
                }

                acc[user.githubId] = user;
                return acc;
              }, {} as Record<string, UserFields>);

              const countsByGithubId = commits.reduce((acc, commit) => {
                const userGithubId = commit.authorGithubId;

                let currentCommits = acc[userGithubId] || 0;
                currentCommits += 1;

                acc[userGithubId] = currentCommits;
                return acc;
              }, {} as Record<string, number>);

              return Object.entries(countsByGithubId).map(
                ([userGithubId, commitsMade]) => {
                  const user = usersByGithubId[userGithubId];

                  // TODO. Aca tendriamos que validar que sean usuarios del curso.
                  return { user, commitsMade };
                }
              );
            },
          },
        },
      }),
      resolve: async (submission, _, context) => {
        const assignmentId = submission.assignmentId;

        const assignment = await findAssignment({ assignmentId });
        if (!assignment) {
          throw new Error('Assignment not found');
        }

        const course = await findCourse({ courseId: assignment.courseId });

        if (!course?.organization) {
          return null;
        }

        const githubToken = getToken(context);
        if (!githubToken) {
          throw new Error('Token required');
        }

        const githubClient = initOctokit(githubToken);
        const repoName = getRepoNameFromUrl(submission.pullRequestUrl);

        if (!repoName) {
          throw new Error('Repo name not found');
        }

        return listCommits(githubClient, course.organization, repoName);
      },
    },
    comments: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(CommentType))),
      resolve: async (submission, _, ctx) => {
        const token = getToken(ctx);
        if (!token) {
          throw new Error('Token required');
        }

        const pullRequestUrl = submission.pullRequestUrl;

        if (!pullRequestUrl) return [];

        const assignment = await findAssignment({
          assignmentId: submission.assignmentId,
        });

        if (!assignment) {
          throw new Error('Missing assignment or courseId');
        }

        const course = await findCourse({ courseId: assignment.courseId });

        if (!course?.organization) {
          throw new Error('Course missing github organization');
        }

        try {
          const comments = await getPullRequestComments({
            octokit: initOctokit(token),
            pullRequestUrl,
            organization: course.organization,
          });

          return comments
            ? comments.map(({ id, body, createdAt, updatedAt, user }) => ({
                id,
                body,
                createdAt,
                updatedAt,
                githubUserId: user?.id,
                githubUsername: user?.username,
              }))
            : [];
        } catch (error) {
          ctx.logger.error('An error happened while returning comments', { error });
          return [];
        }
      },
    },
  }),
});

const findSubmissionReviewer = async (submission: SubmissionFields) => {
  return await findReviewer({
    revieweeId: submission.submitterId,
    assignmentId: submission.assignmentId,
  });
};

export const submissionMutations: GraphQLFieldConfigMap<null, AuthenticatedContext> = {
  createSubmission: {
    description: 'Creates a new submission for the viewer',
    type: new GraphQLNonNull(SubmissionType),
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
        const viewer = await getViewer(ctx);

        const { assignmentId: encodedAssignmentId, pullRequestUrl } = args;
        const assignmentId = fromGlobalIdAsNumber(encodedAssignmentId);

        if (!viewer || !viewer.id) {
          throw new Error('Viewer not found');
        }

        ctx.logger.info('Creating submission for assignment', {
          assignmentId,
          userId: viewer.id,
        });

        return createSubmission({
          submitterUserId: viewer.id,
          assignmentId: Number(assignmentId),
          pullRequestUrl,
        });
      } catch (e) {
        ctx.logger.error('Error while creating submission', { error: e });
        throw e;
      }
    },
  },
  submitSubmissionAgain: {
    description: 'Re-submits a submission for the viewer',
    args: {
      submissionId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      // Necesario para permisos.
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },
    type: SubmissionType,
    resolve: async (_, args, context) => {
      try {
        const { courseId: encodedCourseId, submissionId: encodedSubmissionId } = args;

        const courseId = fromGlobalIdAsNumber(encodedCourseId);
        const submissionId = fromGlobalIdAsNumber(encodedSubmissionId);

        const viewer = await getViewer(context);
        if (!viewer?.id) {
          throw new Error('Viewer not found');
        }

        context.logger.info('Marking submission as ready for review again', {
          courseId,
          submissionId,
        });

        const updatedSubmission = await updateSubmission(submissionId, {
          submittedAgainAt: new Date(),
        });

        return updatedSubmission;
      } catch (error) {
        context.logger.error('Error while updating submission', { error });
        throw error;
      }
    },
  },
  createReview: {
    type: new GraphQLNonNull(SubmissionType),
    description: 'Create a review within a submission',
    args: {
      submissionId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      // Required for permission check
      courseId: {
        type: new GraphQLNonNull(GraphQLID),
      },
      grade: {
        type: GraphQLInt,
      },
      revisionRequested: {
        type: new GraphQLNonNull(GraphQLBoolean),
      },
    },
    resolve: async (_, args, context: AuthenticatedContext) => {
      try {
        const viewer = await getViewer(context);

        if (!viewer?.id) {
          throw new Error('Viewer not found');
        }

        const { submissionId: encodedSubmissionId, grade, revisionRequested } = args;

        const submissionId = fromGlobalIdAsNumber(encodedSubmissionId);
        const reviewerId = await findReviewerAndCheckIfIsReviewerForSubmission({
          submissionId,
          viewerId: Number(viewer.id),
        });

        await validateReviewOnCreation({ submissionId });

        context.logger.info(`Creating review with data: ` + JSON.stringify(args));

        await createReview({
          submissionId,
          grade,
          revisionRequested,
          reviewerId,
        });

        return findSubmission({ submissionId });
      } catch (error) {
        context.logger.error('Error performing mutation', { error });
        throw error;
      }
    },
  },
};

const validateReviewOnCreation = async ({ submissionId }: { submissionId: number }) => {
  const existingReview = await findAllReviews({
    forSubmissionId: submissionId,
  });

  if (existingReview.length > 0) {
    throw new Error('Review already created for submission');
  }
};
