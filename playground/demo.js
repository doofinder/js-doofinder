function demo({ Client, Query, Zone }) {
  const client = new Client({ zone: Zone.EU });
  const query = new Query('c0604b71c273c1fb3ef13eb2adfa4452');

  // CASE 1
  query.search('led');
  query.addFilter('brand', 'JANE');
  query.addFilter('brand', 'RECARO');

  client.search(query).then(result => {
    console.log(result);
  });

  // Doing get items search
  const query2 = new Query('c0604b71c273c1fb3ef13eb2adfa4452');
  let items = [
      "c0604b71c273c1fb3ef13eb2adfa4452@product@b137eb4183c4e03586f8ae9257bbf3bc",
      "c0604b71c273c1fb3ef13eb2adfa4452@product@aaa77a0735b6312a741f903324a022b2"
  ];
  query2.searchItems(items);
  client.getItems(query2).then(result => {
    console.log(result)
  });
}
