import winston from 'winston';
import { config } from '../config';

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

export const logger = winston.createLogger({
  level: config.logLevel,
  format,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      format 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      format 
    }),
  ],
}); 