function demo({ Client, Query, Zone }) {
  const client = new Client({ zone: Zone.EU });
  const query = new Query('c0604b71c273c1fb3ef13eb2adfa4452');

  query.searchText('silla');
  query.addFilter('brand', 'JANE');
  query.addFilter('brand', 'RECARO');

  client.search(query).then(result => {
    console.log(result);
  });
}