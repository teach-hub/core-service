import { getToken } from './utils/request';
import { getAuthenticatedUserFromToken } from './lib/user/internalGraphql';

import type { Logger } from './logger';
import type { GraphQLParams } from 'express-graphql';
import type { Request, Response } from './types';

type BaseContext = {
  logger: Logger;
  request: Request;
  response: Response;
};

export type AuthenticatedContext = {
  viewerUserId: number;
} & BaseContext;

export type Context = BaseContext | AuthenticatedContext;

export async function buildContextForRequest(
  request: Context['request'],
  response: Context['response'],
  logger: Context['logger'],
  params?: GraphQLParams
): Promise<Context> {
  logger.info(
    `Receiving request with operation name '${params?.operationName}', endpoint: ${request.url}`
  );

  const partialContext: BaseContext = { logger, request, response };

  const token = getToken(partialContext);

  if (token) {
    try {
      const loggedInUser = await getAuthenticatedUserFromToken(token);
      if (loggedInUser) {
        return { ...partialContext, viewerUserId: loggedInUser.id };
      }
    } catch (e) {
      logger.error(`Error while getting user from token:`, e);
      return partialContext;
    }
  }

  return partialContext;
}

export function isContextAuthenticated(
  context: Context
): context is Extract<Context, AuthenticatedContext> {
  return 'viewerUserId' in context;
}
