import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${String(timestamp)} [${level}]: ${String(message)}`;
    }),
  ),
  transports: [new transports.Console()],
});

export default logger;
