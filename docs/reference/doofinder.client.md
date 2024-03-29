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
|  [(constructor)({ server, secret, headers })](./doofinder.client._constructor_.md) |  | Constructor. |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [endpoint](./doofinder.client.endpoint.md) |  | string | Returns the configured endpoint for this client. |
|  [headers](./doofinder.client.headers.md) |  | Record&lt;string, string&gt; | Returns the headers set for this client. |
|  [secret](./doofinder.client.secret.md) |  | string | Returns the secret token for this client, if any. |
|  [server](./doofinder.client.server.md) |  | string | Returns the search server for this client. |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [request(resource, params, payload, method)](./doofinder.client.request.md) |  | Perform a request to a HTTP resource. |
|  [search(query)](./doofinder.client.search.md) |  | Perform a search in Doofinder based on the provided parameters. |
|  [searchImage(query, image)](./doofinder.client.searchimage.md) |  | Perform a search through indexed images of a search engine. |
|  [stats(eventName, params, method)](./doofinder.client.stats.md) |  | Perform a request to submit stats events to Doofinder. |
|  [suggest(query)](./doofinder.client.suggest.md) |  | Perform a suggestion query in Doofinder based on the provided parameters. |
|  [toString()](./doofinder.client.tostring.md) |  | Return a string representation of this class. |

