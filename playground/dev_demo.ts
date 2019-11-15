import { Query } from './query';

const query = new Query('c0604b71c273c1fb3ef13eb2adfa4452')
  .search('led')
  .addIncludeFilter('brand', 'JANE2')
  .addIncludeFilter('color', 'red')
  .addIncludeFilter('color', ['black', 'yellow'])
  .addIncludeFilter('brand', 'RECARO')
  .addIncludeFilter('price', { lt: 2, gt: 1 })
  ;

query.removeIncludedFilter('color', ['red', 'yellow']);
query.removeIncludedFilter('price', { lt: 2, gt: 1 });

console.log(query.includedFilters);
console.log(query.excludedFilters);

console.log(query.dump());
console.log('ok334');