Client = require "../lib/client"
Controller = require "../lib/controller"
session = require "../lib/session"
ObjectSessionStore = session.ObjectSessionStore
Session = session.Session

AUTH = "aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd"
HASHID = "ffffffffffffffffffffffffffffffff"
HOST = "eu1-search.doofinder.com"
ZONE = "eu1"

APIKEY = "#{ZONE}-#{AUTH}"

getClient = (type) ->
  new Client HASHID, APIKEY, undefined, type

getController = (params = {}) ->
  new Controller getClient(), [], params

getSession = (data) ->
  store = new ObjectSessionStore data
  new Session store

module.exports =
  address: "https://#{HOST}"
  apiKey: APIKEY
  auth: AUTH
  hashid: HASHID
  host: HOST
  version: 5
  zone: ZONE

  getClient: getClient
  getController: getController
  getSession: getSession
