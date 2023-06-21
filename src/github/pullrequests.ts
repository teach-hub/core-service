import { flatten } from 'lodash';
import logger from '../logger';

import { findCourse } from '../lib/course/courseService';

import type { Octokit } from '@octokit/rest';
import type { UserFields } from '../lib/user/userService';

type PullRequest = {
  id: string;
  title: string;
  url: string;
};

export const listOpenPRs = async (
  viewer: UserFields,
  courseId: string,
  octoClient: Octokit
): Promise<PullRequest[]> => {
  const { organization } = await findCourse({ courseId });

  if (!organization) {
    logger.error('Organization not found for course', { courseId });
    return Promise.resolve([]);
  }

  // TODO. Take the user repo from Repository model.
  const userRepos = await octoClient.rest.repos.listForOrg({ org: organization });

  const pullRequestsByRepo = await Promise.all(
    userRepos.data.map(repo =>
      octoClient.rest.pulls.list({
        owner: organization,
        repo: repo.name,
        state: 'open',
      })
    )
  );

  const pullRequests = flatten(pullRequestsByRepo.map(x => x.data));

  logger.info(`Found ${pullRequests.length} open pull requests for user ${viewer.id}`);

  return pullRequests.map(pr => ({
    id: String(pr.id),
    url: pr.url,
    title: pr.title,
  }));
};
