<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [doofinder](./doofinder.md) &gt; [SearchParams](./doofinder.searchparams.md)

## SearchParams interface

Set of params that are dumped from a [Query](./doofinder.query.md)<!-- -->.

<b>Signature:</b>

```typescript
export interface SearchParams extends QueryParamsBase 
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [auto\_filters](./doofinder.searchparams.auto_filters.md) | boolean | Enable/Disable auto filters feature in search. Default: false |
|  [custom\_results](./doofinder.searchparams.custom_results.md) | boolean | Enable/Disable custom\_results feature in search. Default: true |
|  [grouping](./doofinder.searchparams.grouping.md) | boolean | Enable/Disable the grouping of variants as single items. If not given, it's taken from the configuration set in the admin. |
|  [skip\_auto\_filters](./doofinder.searchparams.skip_auto_filters.md) | string\[\] | A list of fields to be skipped from auto\_filters feature. |
|  [skip\_top\_facet](./doofinder.searchparams.skip_top_facet.md) | string\[\] | A list of fields to be skipped from top\_facet feature. |
|  [title\_facet](./doofinder.searchparams.title_facet.md) | boolean | Enable/Disable title\_facet feature. Default: false |
|  [top\_facet](./doofinder.searchparams.top_facet.md) | boolean | Enable/Disable top\_facet feature. Default: false |

