import { Client } from '../src/doofinder';

const AUTH = 'aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd';
const HASHID = 'ffffffffffffffffffffffffffffffff';
const HOST = 'eu1-search.doofinder.com';
const ZONE = 'eu1';

const APIKEY = `${ZONE}-${AUTH}`;

export const getClient = (): Client => {
  return new Client(HASHID, {apiKey: APIKEY});
}

export const address = `https://${HOST}`;
export const apiKey = APIKEY;
export const auth = AUTH;
export const hashid = HASHID;
export const host = HOST;
export const version = 5;
export const zone = ZONE;
