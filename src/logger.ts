import { createLogger, transports, format } from 'winston';

export type { Logger } from 'winston';

/**
 * Siempre logueamos a consola (por el momento, espero).
 */

const logger = createLogger({
  level: 'info',
  format: format.json(),
  transports: [
    new transports.Console({
      format: format.simple(),
    }),
  ],
});

export default logger;
