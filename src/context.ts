import { getToken } from './utils/request';
import { getAuthenticatedUserFromToken } from './lib/user/internalGraphql';

import type { GraphQLParams } from 'express-graphql';
import type { Context } from './types';

export async function buildContextForRequest(
  request: Context['request'],
  response: Context['response'],
  logger: Context['logger'],
  params?: GraphQLParams,
): Promise<Context> {
  logger.info(
    `Receiving request with operation name '${params?.operationName}', endpoint: ${request.url}`
  );

  const partialContext: Context = { logger, request, response };

  const token = getToken(partialContext);

  if (token) {
    const loggedInUser = await getAuthenticatedUserFromToken(token);

    if (loggedInUser) {
      partialContext.viewerUserId = String(loggedInUser.id);
    }
  }

  return partialContext;
};
