const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fake-secret';

export const createToken = ({
  githubToken,
  userExists,
}: {
  githubToken: string;
  userExists: boolean;
}) => {
  return jwt.sign({ githubToken: githubToken, isRegisterToken: !userExists }, JWT_SECRET);
};

/**
 * Creates a new jwt, copying all the data from the
 * previous token but updating the register token
 * condition, as user should already exist
 * */
export const createRegisteredUserTokenFromJwt = ({ token }: { token: string }) => {
  return createToken({
    githubToken: getGithubToken({ token }),
    userExists: true,
  });
};

/**
 * Checks whether the token is classified
 * as a token for registering a new user
 * */
export const isRegisterToken = ({ token }: { token: string }) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.isRegisterToken;
};

export const getGithubToken = ({ token }: { token: string }) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  return decoded.githubToken;
};
