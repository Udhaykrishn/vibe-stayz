import { getDatabase } from './database';
import type {RuntimeEnv} from '../types';
export const runtime=():RuntimeEnv=>({
 DB:getDatabase(),
 ADMIN_PASSWORD_HASH:process.env.ADMIN_PASSWORD_HASH,
 ADMIN_USERNAME:process.env.ADMIN_USERNAME,
 DEMO_MODE:process.env.DEMO_MODE,
 SITE_ORIGIN:process.env.SITE_ORIGIN,
});
