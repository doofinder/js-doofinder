function demo({ Client, Query }) {
  const client = new Client({ server: 'eu1-search.doofinder.com' });
  const request = new Query({hashid: '7a6100c782c09126479e9270ecc619b3'});

  request.text = 'shoes';
  request.filters.add('condition', 'new');
  request.filters.add('color', 'Red');
  request.queryCounter = 2;

  console.log(request.dump());

  client.search(request).then(result => {
    console.log(result);
  });

  client.suggest(request).then(result => {
    console.log(result);
  });
}
