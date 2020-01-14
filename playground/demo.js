function demo({ Client, Query, Zone }) {
  const client = new Client({ zone: Zone.EU1 });
  const query = new Query({hashid: 'c0604b71c273c1fb3ef13eb2adfa4452'});

  query.searchText('silla');
  query.addFilter('brand', 'JANE');
  query.addFilter('brand', 'RECARO');
  query.queryCounter = 2;

  client.search(query).then(result => {
    console.log(result);
  });
}
