Client = require "../lib/client"
Controller = require "../lib/controller"
session = require "../lib/session"
ObjectSessionStore = session.ObjectSessionStore
Session = session.Session

AUTH = "aaaaaaaaaabbbbbbbbbbccccccccccdddddddddd"
HASHID = "ffffffffffffffffffffffffffffffff"
HOST = "eu1-search.doofinder.com"
ZONE = "eu1"

ADDRESS = "https://#{HOST}"

APIKEY = "#{ZONE}-#{AUTH}"

TOKEN = "Token #{AUTH}"

getClient = ->
  new Client HASHID, apiKey: APIKEY, address: ADDRESS

getController = (params = {}) ->
  new Controller getClient(), params

getSession = (data) ->
  store = new ObjectSessionStore data
  new Session store

module.exports =
  address: ADDRESS
  apiKey: APIKEY
  auth: AUTH
  hashid: HASHID
  host: HOST
  token: TOKEN
  version: 5
  zone: ZONE

  getClient: getClient
  getController: getController
  getSession: getSession
