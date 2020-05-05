import { Client } from '../src/client';

export const hashid = 'ffffffffffffffffffffffffffffffff';
export const endpoint = `https://eu1-search.doofinder.com`;
export const secret = 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd';
export const server = 'eu1-search.doofinder.com';
export const key = `eu1-${secret}`;

export const getClient = (): Client => {
  return new Client({ server, secret });
}
