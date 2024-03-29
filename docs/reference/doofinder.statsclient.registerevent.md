<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [doofinder](./doofinder.md) &gt; [StatsClient](./doofinder.statsclient.md) &gt; [registerEvent](./doofinder.statsclient.registerevent.md)

## StatsClient.registerEvent() method

Pass-through to register any custom event.

<b>Signature:</b>

```typescript
registerEvent(eventName: string, params: Record<string, any>, method?: Method): Promise<Response>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  eventName | string | The event name to register. |
|  params | Record&lt;string, any&gt; | The params object associated to the event call. |
|  method | Method | HTTP method for the request.Default GET. It should have at least a session\_id and a hashid. |

<b>Returns:</b>

Promise&lt;Response&gt;

A promise to be fullfilled with the response or rejected with a `ClientResponseError`<!-- -->.

