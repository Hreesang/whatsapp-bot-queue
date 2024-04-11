/**
 * Libraries
 */

import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { resolve as resolvePath } from 'path';
import logger from '@/utils/logger';

/**
 * Declarations
 */

globalThis.client = new Client({
  webVersionCache: {
    type: 'remote',
    remotePath:
      'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2410.1.html',
  },
  authStrategy: new LocalAuth({
    dataPath: resolvePath('.', 'scriptfiles', '.wwebjs_auth'),
  }),
});

/**
 * Events
 */

client.on('qr', (qr) => {
  logger('info', 'core/client', 'Generating QR code...');
  qrcode.generate(qr, { small: true });
});
