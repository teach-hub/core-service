import crypto from 'crypto';

const algorithm = 'aes-256-cbc';

type CipherEnv = {
  secretKey: string;
  initializationVector: string;
};

export const cipher = <T>(payload: T, env: CipherEnv): string => {
  const { secretKey, initializationVector } = env;

  const cipher = crypto.createCipheriv(algorithm, secretKey, initializationVector);

  const encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  return encrypted + cipher.final('hex');
};

export const decipher = <T>(ciphered: string, env: CipherEnv): T => {
  const { secretKey, initializationVector } = env;

  const decipher = crypto.createDecipheriv(algorithm, secretKey, initializationVector);

  const decrypted = decipher.update(ciphered, 'hex', 'utf8');
  return JSON.parse(decrypted + decipher.final('utf8'));
};
