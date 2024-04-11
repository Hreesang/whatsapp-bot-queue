import type { Client } from 'whatsapp-web.js';

declare global {
  var isProduction: boolean;
  var companyName: string;
  var timeZone: string;
  var timeLocale: string;
  var client: Client;
  var clientCommands: ClientCommands;
}

export {};
