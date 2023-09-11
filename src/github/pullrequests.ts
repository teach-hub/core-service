import { flatten, isNil } from 'lodash';
import logger from '../logger';

import { findCourse } from '../lib/course/courseService';
import { findAllRepositories } from '../lib/repository/service';

import type { Octokit } from '@octokit/rest';
import type { UserFields } from '../lib/user/userService';

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
  const { organization } = await findCourse({ courseId });

  if (!organization) {
    logger.error('Organization not found for course', { courseId });
    return Promise.resolve([]);
  }

  const courseRepos = await findAllRepositories({
    forUserId: viewer.id,
    forCourseId: courseId,
  });

  const findPullRequestsForRepository = async (repositoryName: string) => {
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
      .map(({ name }) => findPullRequestsForRepository(name!))
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
