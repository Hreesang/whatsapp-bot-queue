/**
 * Libraries
 */

import type { Message } from 'whatsapp-web.js';
import logger from '@/utils/logger';

/**
 * Declarations
 */

interface Command {
  name: string;
  cb(message: Message, fullParams: string, ...params: string[]): any;
}

const commands: Command[] = [];

globalThis.clientCommands = {} as ClientCommands;
globalThis.clientCommands.exists = commandExists;
globalThis.clientCommands.add = addCommand;

/**
 * APIs
 */

function getCommandTotalWords(name: string) {
  name = name.trim().toLowerCase();
  const totalWords = name.split(/\s+/).length;
  return totalWords;
}

function commandExists(name: string) {
  for (const command of commands) {
    if (name.toLowerCase() === command.name) {
      return true;
    }
  }
  return false;
}

function addCommand(
  name: string,
  cb: (message: Message, fullParams: string, ...params: string[]) => any
) {
  if (commandExists(name)) {
    logger(
      'error',
      'core/client-commands',
      `Command '${name}' is a duplicate.`
    );
    return;
  }

  commands.push({ name, cb });
}

/**
 * Events
 */

client.on('message_create', (message) => {
  if (message.fromMe && isProduction) {
    return;
  }

  const text = message.body.trim();

  let foundTotalWords = -1;
  let cmd: Command | undefined;

  for (const command of commands) {
    const idx = text.toLowerCase().indexOf(command.name);

    // Only get a command mentioned on the first words
    if (idx !== 0) {
      continue;
    }

    // Set the first found command
    if (foundTotalWords === -1) {
      foundTotalWords = getCommandTotalWords(command.name);
      cmd = command;
      continue;
    }

    // Check if more commands found with longer words
    const totalWords = getCommandTotalWords(command.name);
    if (totalWords > foundTotalWords) {
      foundTotalWords = totalWords;
      cmd = command;
    }
  }

  if (foundTotalWords !== -1 && cmd !== undefined) {
    const params = text.split(/\s+/);
    params.splice(0, foundTotalWords);

    cmd.cb(message, params.join(' '), ...params);
  }
});
