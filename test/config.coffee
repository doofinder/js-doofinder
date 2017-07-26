Client = require "../lib/client"
session = require "../lib/session"
ObjectSessionStore = session.ObjectSessionStore
Session = session.Session

AUTH = "aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd"
HASHID = "ffffffffffffffffffffffffffffffff"
HOST = "eu1-search.doofinder.com"
ZONE = "eu1"

APIKEY = "#{ZONE}-#{AUTH}"

module.exports =
  address: "https://#{HOST}"
  apiKey: APIKEY
  auth: AUTH
  hashid: HASHID
  host: HOST
  version: 5
  zone: ZONE

  getClient: (type) ->
    new Client HASHID, APIKEY, undefined, type

  getSession: (data) ->
    store = new ObjectSessionStore data
    new Session store
