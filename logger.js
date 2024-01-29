const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    errorFile: { type: 'file', filename: 'error.log', level: 'error' },
    combinedFile: { type: 'file', filename: 'combined.log' }
  },
  categories: {
    default: { appenders: ['console', 'combinedFile'], level: 'info' },
    error: { appenders: ['errorFile'], level: 'error' }
  }
});

const logger = log4js.getLogger();

module.exports = logger;