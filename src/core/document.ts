/**
 * Libraries
 */

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

/**
 * Declarations
 */

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

const jwt = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string,
  key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, '\n'),
  scopes,
});

const document = new GoogleSpreadsheet(
  process.env.GOOGLE_SPREADSHEET_ID as string,
  jwt
);

/**
 * Exports
 */

export default document;
