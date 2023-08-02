function demo({ Client, Query, StatsClient }) {
  const hashid = '7a6100c782c09126479e9270ecc619b3';
  const sessionId = '123456';
  const client = new Client({ server: 'eu1-search.doofinder.com' });
  const request = new Query({ hashid });
  const stats = new StatsClient(client);

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

  const params = {
    hashid,
    session_id: sessionId,
    item_id: 10,
    amount: 1,
    datatype: 'product',
    title: 'Nice stuff',
    price: 20,
  };

  stats.addToCart(params).then(() => {
    stats.clearCart({
      hashid,
      session_id: sessionId,
    });
  });
}
