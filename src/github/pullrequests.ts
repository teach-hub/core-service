import { flatten, isNil } from 'lodash';
import logger from '../logger';

import { findCourse } from '../lib/course/courseService';
import { findAllRepositories } from '../lib/repository/service';

import type { Octokit } from '@octokit/rest';
import type { UserFields } from '../lib/user/userService';
import { Nullable, Optional } from '../types';

type PullRequest = {
  id: string;
  title: string;
  url: string;
  repositoryName: string;
};

export const listOpenPRs = async (
  viewer: UserFields,
  courseId: number,
  octoClient: Octokit
): Promise<PullRequest[]> => {
  const { organization } = (await findCourse({ courseId }))!;

  if (!organization) {
    logger.error('Organization not found for course', { courseId });
    return Promise.resolve([]);
  }

  const courseRepos = await findAllRepositories({
    forUserId: viewer.id,
    forCourseId: courseId,
  });

  const findPullRequestsForRepository = async (repositoryName: string) => {
    console.log('Finding pull requests for repository: ', repositoryName);
    return octoClient.rest.pulls
      .list({
        owner: organization,
        repo: repositoryName,
        state: 'open',
      })
      .then(prs => prs.data.map(pr => ({ ...pr, repositoryName })));
  };

  const pullRequestsByRepo = await Promise.all(
    courseRepos
      .filter(({ name }) => !isNil(name))
      .map(async ({ name }) => {
        /* Avoid making the whole method fail when a pull requests throws an error*/
        try {
          return await findPullRequestsForRepository(name!);
        } catch (e) {
          logger.error('Error while fetching pull requests from repository ${name}', {
            error: e,
          });
          return [];
        }
      })
  );

  const pullRequests = flatten(pullRequestsByRepo);

  logger.info(`Found ${pullRequests.length} open pull requests for user ${viewer.id}`);

  return pullRequests.map(pr => ({
    id: String(pr.id),
    url: pr.html_url,
    title: pr.title,
    repositoryName: pr.repositoryName,
  }));
};

export type CommentUserData = {
  id: Optional<Nullable<number>>;
  username: Optional<Nullable<string>>;
};

export type CommentData = {
  id: Optional<Nullable<number>>;
  body: Optional<Nullable<string>>;
  user: Optional<Nullable<CommentUserData>>;
  createdAt: Optional<Nullable<string>>;
  updatedAt: Optional<Nullable<string>>;
};

/**
 * Returns all comments made in the PR
 * that are not made over a line of code.
 *
 * Includes both comments made by users and the
 * description off the pull request.
 *
 * @param pullRequestUrl must follow the format
 * https://github.com/example-org/example-repository/pull/78
 * @param octokit client to make requests to the GitHub API
 * @param organization name of the organization that owns the repository
 * */
export const getPullRequestComments = async ({
  octokit,
  pullRequestUrl,
  organization,
}: {
  octokit: Octokit;
  pullRequestUrl: string;
  organization: string;
}): Promise<CommentData[]> => {
  const repositoryName = getRepoNameFromUrl(pullRequestUrl);
  const pullRequestNumber = getPullRequestNumberFromUrl(pullRequestUrl);

  if (!repositoryName || !pullRequestNumber) {
    logger.error('Invalid repository URL', { pullRequestUrl: pullRequestUrl });
    return Promise.resolve([]);
  }

  console.log('Fetching pull request comments: ', {
    organization,
    repositoryName,
    pullRequestNumber,
  });

  /**
   * Search for first comment, which is the description
   * of the pull request
   * */
  const description = (
    await octokit.pulls.get({
      owner: organization,
      repo: repositoryName,
      pull_number: pullRequestNumber,
    })
  ).data;

  /**
   * Search for comments that are not the description
   * and are not made over a line of code
   * */
  const comments = (
    await octokit.issues.listComments({
      owner: organization,
      repo: repositoryName,
      issue_number: pullRequestNumber,
    })
  ).data;

  /* Set description as first comment */
  return [description, ...comments].map(comment => ({
    id: comment.id,
    body: comment.body,
    user: comment.user
      ? {
          id: comment.user.id,
          username: comment.user.login,
        }
      : null,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
  }));
};

export const getRepoNameFromUrl = (url: string): Nullable<string> => {
  // Use regular expressions to extract the repo name
  const repoNameMatch = url.match(/github\.com\/[^/]+\/([^/]+)\/pull/);
  if (repoNameMatch && repoNameMatch.length > 1) {
    return repoNameMatch[1];
  }
  return null;
};

const getPullRequestNumberFromUrl = (url: string): Nullable<number> => {
  // Use regular expressions to extract the pull request number
  const pullRequestNumberMatch = url.match(/\/pull\/(\d+)/);
  if (pullRequestNumberMatch && pullRequestNumberMatch.length > 1) {
    const prNumber = parseInt(pullRequestNumberMatch[1], 10);
    if (!isNaN(prNumber)) {
      return prNumber;
    }
  }
  return null;
};
