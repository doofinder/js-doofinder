function demo({ Client, Query, Zone }) {
  const client = new Client({ zone: Zone.EU1 });
  const request = new Query({hashid: 'c0604b71c273c1fb3ef13eb2adfa4452'});

  request.query = 'silla';
  request.filters.add('brand', 'JANE');
  request.filters.add('brand', 'RECARO');
  request.queryCounter = 2;

  console.log(request.dump());

  client.search(request).then(result => {
    console.log(result);
  });
}
