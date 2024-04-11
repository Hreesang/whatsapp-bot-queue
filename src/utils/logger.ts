import log4js from 'log4js';
import { resolve as resolvePath } from 'path';

/**
 * Configure logger, append text in console and save to file.
 * Docs about log4js: https://log4js-node.github.io/log4js-node/
 */
log4js.configure({
  appenders: {
    file: {
      type: 'file',
      layout: { type: 'basic' },
      filename: resolvePath('.', 'scriptfiles', 'logs.log'),
    },
    console: { type: 'console' },
  },
  categories: { default: { appenders: ['file', 'console'], level: 'info' } },
});

/**
 * Get logger instance and export as function.
 * Usage: logger(moduleName (string), message (string), type (string)).
 */
const logger = (
  type: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal',
  moduleName: string,
  msg: string
): void => {
  const loggerInstance = log4js.getLogger(moduleName);
  return loggerInstance[type](msg);
};

export default logger;
