import { Client } from '../src/client';

export const hashid = 'ffffffffffffffffffffffffffffffff';
export const endpoint = `https://eu1-search.doofinder.com`;
export const secret = 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd';
export const zone = 'eu1';
export const key = `${zone}-${secret}`;

export const getClient = (): Client => {
  return new Client({ key });
}
