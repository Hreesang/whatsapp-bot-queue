/**
 * Libraries
 */

import logger from '@/utils/logger';

/**
 * Modules
 */

import '@/core';
import '@/modules';

/**
 * Main
 */

client.once('ready', () => {
  const info = client.info;
  const platform =
    client.info.platform === 'iphone' ? 'iPhone' : client.info.platform;

  logger(
    'info',
    '',
    `Connected! (Name: ${info.pushname} - Platform: ${platform})`
  );
});

logger(
  'info',
  '',
  `Initializing client... (Environment: ${
    isProduction ? 'Production' : 'Development'
  })`
);
client.initialize();
