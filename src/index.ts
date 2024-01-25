import 'dotenv/config';
import { IUser, usersDefault } from './types';
export const users: IUser[] = usersDefault;

export const parseArgs = (): Boolean => {
  const argv = Array.from(process.argv).slice(2);
  const argMulti = argv.find(item => item.split('=')[0] === '--multi');
  const modeMulti = Boolean(argMulti);
  return modeMulti;
};

export const modeMulti: Boolean = parseArgs();

import './server.ts';
