import fs from 'fs';
import { GraphQLSchema, lexicographicSortSchema, printSchema } from 'graphql';

import { db } from './db';
import logger from './logger';

export type OrderingOptions = {
  page?: number;
  perPage?: number;
  sortField?: string;
  sortOrder?: 'ASC' | 'DESC';
};

/**
 * Funcion util que nos sirve para
 * dumpear el schema actual a un archivo
 * .graphql (los servicios de frontend usan
 * este archivo para validar los schemas.
 */

export async function writeSchema(
  schema: GraphQLSchema,
  outputPath: string
): Promise<void> {
  logger.info(`Writing SDL Schema to Disk`);
  console.time(`Done writing SDL Schema to Disk`);

  fs.writeFileSync(outputPath, printSchema(lexicographicSortSchema(schema)));
  console.timeEnd(`Done writing SDL Schema to Disk`);
}

export function isNumber(x: unknown): x is number {
  return Number.isInteger(x);
}

export const checkDB = async () => {
  await db.query('SELECT 1 FROM user;');
};

export const isDevEnv = () => process.env.NODE_ENV !== 'production';

export { initializeModels } from './db';
