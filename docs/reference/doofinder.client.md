<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [doofinder](./doofinder.md) &gt; [Client](./doofinder.client.md)

## Client class

Class that allows interacting with the Doofinder service.

<b>Signature:</b>

```typescript
export declare class Client 
```

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)({ zone, secret, headers, serverAddress })](./doofinder.client._constructor_.md) |  | Constructor. |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [endpoint](./doofinder.client.endpoint.md) |  | <code>string</code> | Returns the configured endpoint for this client. |
|  [headers](./doofinder.client.headers.md) |  | <code>GenericObject&lt;string&gt;</code> | Returns the headers set for this client. |
|  [secret](./doofinder.client.secret.md) |  | <code>string</code> | Returns the secret token for this client, if any. |
|  [zone](./doofinder.client.zone.md) |  | <code>string</code> | Returns the search zone for this client. |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [buildUrl(resource, querystring)](./doofinder.client.buildurl.md) |  | Build a URL for the provided resource. |
|  [options(hashid)](./doofinder.client.options.md) |  | Perform a request to get the options of a search engine. |
|  [request(resource, payload)](./doofinder.client.request.md) |  | Perform a request to a HTTP resource. |
|  [search(params)](./doofinder.client.search.md) |  | Perform a search in Doofinder based on the provided parameters. |
|  [stats(eventName, params)](./doofinder.client.stats.md) |  | Perform a request to submit stats events to Doofinder. |
|  [topStats(type, params)](./doofinder.client.topstats.md) |  |  |
|  [toString()](./doofinder.client.tostring.md) |  | Return a string representation of this class. |
