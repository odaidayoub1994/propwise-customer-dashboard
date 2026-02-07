import { createLogger, format, transports } from 'winston';

export const winstonFormat = format.combine(
  format.timestamp(),
  format.printf(({ timestamp, level, message }) => {
    return `${String(timestamp)} [${level}]: ${String(message)}`;
  }),
);

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winstonFormat,
  transports: [new transports.Console()],
});

export default logger;
