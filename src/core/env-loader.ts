/**
 * Libraries
 */

import { config } from 'dotenv';
import { resolve as resolvePath } from 'path';

/**
 * Declarations
 */

config({ path: resolvePath('.env') });

// Server
globalThis.isProduction =
  process.env.PRODUCTION_MODE === 'false' ? false : true;
globalThis.companyName = process.env.COMPANY_NAME ?? "Hreesang's Company";

// Time
globalThis.timeZone = process.env.TIME_ZONE ?? 'Asia/Jakarta';
globalThis.timeLocale = process.env.TIME_LOCALE ?? 'id';
