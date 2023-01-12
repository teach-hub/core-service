import { createLogger, transports, format } from 'winston';

export type { Logger } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.json(),
  defaultMeta: { service: 'core-service' },
  transports: [],
});

/**
 * Siempre logueamos a consola (por el momento, espero).
 */

logger.add(
  new transports.Console({
    format: format.simple(),
  })
);

export default logger;
