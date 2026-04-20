const winston = require('winston');
const morgan = require('morgan');

// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'attendance-payroll-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Morgan stream for Winston integration
const morganStream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Morgan middleware
const morganMiddleware = morgan('combined', { stream: morganStream });

module.exports = { logger, morganMiddleware };
