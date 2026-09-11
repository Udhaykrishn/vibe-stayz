import { env } from 'cloudflare:workers';
import type {RuntimeEnv} from '../types';
export const runtime=()=>env as unknown as RuntimeEnv;
