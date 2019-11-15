function demo({ Client, Query, Zone }) {
  const client = new Client({ zone: Zone.EU });
  const query = new Query('c0604b71c273c1fb3ef13eb2adfa4452');

  query.search('silla');
  query.addIncludeFilter('brand', 'JANE');
  query.addIncludeFilter('brand', 'RECARO');

  client.search(query).then(result => {
    console.log(result);
  });
}
