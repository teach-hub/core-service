type PullRequest = {
  id: string;
  title: string;
  url: string;
};

export const listOpenPullRequests = (): Promise<PullRequest[]> => {
  return Promise.resolve([]);
};
