import { Client } from '../src/doofinder';

export const hashid = 'ffffffffffffffffffffffffffffffff';
export const endpoint = `https://eu1-search.doofinder.com`;
export const secret = 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd';
export const zone = 'eu1';
export const apiKey = `${zone}-${secret}`;

export const getClient = (): Client => {
  return new Client({hashid, apiKey});
}
