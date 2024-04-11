import type { Message } from 'whatsapp-web.js';

declare global {
  interface ClientCommands {
    exists(command: string | Message): boolean;
    add(
      name: string,
      cb: (message: Message, fullParams: string, ...params: string[]) => any,
      totalWords?: number
    ): void;
  }
}

export {};
