function demo({ Client, Query, Zone }) {
  const client = new Client({ zone: Zone.EU });
  const query = new Query('ebcd012c7f7172c3e16d7f40fe8a8842');

  // CASE 1
  query.search('led');
  query.addFilter('brand', 'JANE');
  query.addFilter('brand', 'RECARO');

  client.search(query).then(result => {
    console.log(result);
  });

  // Doing get items search
  const query2 = new Query('ebcd012c7f7172c3e16d7f40fe8a8842');
  let items = [
      "ebcd012c7f7172c3e16d7f40fe8a8842@product@a684eceee76fc522773286a895bc8436",
      "ebcd012c7f7172c3e16d7f40fe8a8842@test_2@66f041e16a60928b05a7e228a89c3799"
  ];
  query2.addItems(items);
  client.search(query2).then(result => {
    console.log(result)
  });
}
