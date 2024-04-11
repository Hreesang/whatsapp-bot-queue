/**
 * Libraries
 */

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import document from '@/core/document';
import logger from '@/utils/logger';
import type { GoogleSpreadsheetRow } from 'google-spreadsheet';

(async function () {
  await import(`dayjs/locale/${timeLocale}.js`);

  dayjs.locale(timeLocale);
  dayjs.extend(customParseFormat);
  dayjs.extend(timezone, timeZone);
})();

/**
 * APIs
 */

function getTotalQueueNumber(
  rows: GoogleSpreadsheetRow<Record<string, any>>[]
) {
  const registerDateRaw = dayjs().format('DD/MM/YYYY');

  let latestNumber = 0;
  for (const row of rows) {
    const rowTimeRaw = row.get('TANGGAL');
    const rowTime = dayjs(rowTimeRaw, 'DD MMMM, YYYY HH:mm:ss');
    const rowDateRaw = dayjs(rowTime).format('DD/MM/YYYY');

    if (rowDateRaw === registerDateRaw) {
      const queueNumber = parseInt(row.get('NOMOR ANTRIAN'), 10);
      if (queueNumber > latestNumber) {
        latestNumber = queueNumber;
      }
    }
  }

  return latestNumber;
}

function isRegisteredToday(timeRaw: string) {
  const time = dayjs(timeRaw, 'DD MMMM, YYYY HH:mm:ss');
  const dateRaw = dayjs(time).format('DD/MM/YYYY');

  const currenDatetRaw = dayjs().format('DD/MM/YYYY');
  if (dateRaw === currenDatetRaw) {
    return true;
  }

  return false;
}

/**
 * Events
 */

clientCommands.add('daftar', async (message, name) => {
  if (!name) {
    client.sendMessage(
      message.from,
      `_*${companyName}*_\nTolong masukkan nama lengkap anda untuk mendaftar.\nKetik "daftar *nama lengkap*".`
    );
    return;
  }

  try {
    const contact = await message.getContact();

    await document.loadInfo();
    const sheet = document.sheetsByTitle['Antrian'];
    const rows = await sheet.getRows();

    let isPhoneRegistered = false;
    let isNameRegistered = false;
    for (const row of rows) {
      if (!isRegisteredToday(row.get('TANGGAL'))) {
        continue;
      }

      // People are able to register if they have done the treatment.
      if (row.get('STATUS') === 'SELESAI') {
        continue;
      }

      const phoneNumber = row.get('PONSEL');
      if (phoneNumber === contact.number) {
        isPhoneRegistered = true;
        break;
      }

      const registeredName = row.get('NAMA');
      if (registeredName.toLowerCase() === name.toLowerCase()) {
        isNameRegistered = true;
        break;
      }
    }

    const phoneNumber = contact.number;
    if (isPhoneRegistered) {
      client.sendMessage(
        message.from,
        `_*${companyName}*_\nMohon maaf, nomor anda (+${phoneNumber}) telah terdaftar ke dalam antrian.`
      );
      return;
    }

    if (isNameRegistered) {
      client.sendMessage(
        message.from,
        `_*${companyName}*_\nMohon maaf, nama '${name}' telah terdaftar ke dalam antrian. Tolong gunakan nama yang lain.`
      );
      return;
    }

    const regsiterTime = dayjs().format('DD MMMM, YYYY HH:mm:ss');
    const queueNumber = getTotalQueueNumber(rows) + 1;

    await sheet.addRow({
      TANGGAL: regsiterTime,
      'NOMOR ANTRIAN': queueNumber,
      PONSEL: phoneNumber,
      NAMA: name,
      STATUS: 'TERDAFTAR',
    });
    client.sendMessage(
      message.from,
      `_*${companyName}*_\nBerhasil! Anda telah didaftarkan ke dalam antrian.\nNama: *${name}*\nNomor Antrian: *${queueNumber}*\n\n_Mohon menunggu sesuai dengan nomor antrian yang telah diberikan :)_`
    );
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Unknown';
    logger(
      'error',
      'modules/queue/list',
      `Error while executing command 'daftar'. (Error: ${errMsg})`
    );
  }
});

clientCommands.add('cek antrian', async (message) => {
  try {
    const contact = await message.getContact();
    const senderNumber = contact.number;
    let senderQueue = 0;

    await document.loadInfo();
    const sheet = document.sheetsByTitle['Antrian'];
    const rows = await sheet.getRows();

    let activeQueues: number[] = [];

    for (const row of rows) {
      const status = row.get('STATUS');
      if (status === 'SELESAI') {
        continue;
      }

      const rowTimeRaw = row.get('TANGGAL');
      if (!isRegisteredToday(rowTimeRaw)) {
        continue;
      }

      if (senderQueue === 0) {
        const number = row.get('PONSEL');
        if (senderNumber === number) {
          senderQueue = parseInt(row.get('NOMOR ANTRIAN'), 10);
        }
      }

      if (status !== 'SEDANG DILAYANI') {
        continue;
      }

      const queueNumber = parseInt(row.get('NOMOR ANTRIAN'), 10);
      activeQueues.push(queueNumber);
    }

    let activeQueueFormat: string;
    switch (activeQueues.length) {
      case 0: {
        activeQueueFormat = 'tidak ada';
        break;
      }
      case 1: {
        activeQueueFormat = `${activeQueues[0]}`;
        break;
      }
      case 2: {
        activeQueueFormat = `${activeQueues[0]} dan ${activeQueues[1]}`;
        break;
      }
      default: {
        const lastQueue = activeQueues.splice(activeQueues.length - 1, 1)[0];
        activeQueueFormat = activeQueues.join(', ') + `, dan ${lastQueue}`;
        break;
      }
    }

    const senderQueueFormat = senderQueue
      ? `Nomor antrian anda adalah *${senderQueue}*.`
      : `Anda belum mendaftar sama sekali hari ini.`;

    client.sendMessage(
      message.from,
      `_*${companyName}*_\n${senderQueueFormat}\nUntuk saat ini, nomor antrian yang sedang dilayani adalah *${activeQueueFormat}*.`
    );
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'Unknown';
    logger(
      'error',
      'modules/queue/list',
      `Error while executing command 'cek antrian'. (Error: ${errMsg})`
    );
  }
});
