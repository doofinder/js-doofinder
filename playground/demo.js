function demo({ Client, Query, StatsClient }) {
  const hashid = '';
  const dfid =''
  const secret = ''
  const sessionId = '';
  const server =  'eu1-search.doofinder.com'
  const client = new Client({ server, secret });
  const request = new Query({
    hashid
  });
  const stats = new StatsClient(client);

  request.text = 'Conga 9090 AI';

  console.log(request.dump());

  client.search(request).then(result => {
    console.log('SEARCH: ', result);
  });

  client.suggest(request).then(result => {
    console.log('SUGGEST: ', result);
  });

  const image =
    '';

  client.searchImage(request, image).then(result => {
    console.log('SEARCH IMAGE: ',result);
  });

  let params = {
    hashid,
    session_id: sessionId,
    user_id:"dd"
  }

 stats.registerSession(params).then((result) => {
    console.log('INIT SESSION: ', result);
  });

  params = {
    hashid,
    session_id: sessionId,
    id: '1'
  }

  stats.registerRedirection(params).then((result) => {
    console.log('LOG REDIRECTION: ', result);
  });

  params = {
    hashid,
    session_id: sessionId,
    dfid: dfid
  }

  stats.registerClick(params).then((result) => {
    console.log('CLICK: ', result);
  });

   params = {
    hashid,
    session_id: sessionId,
    id: `1`,
    query:'',
  }

  stats.registerImageClick(params).then((result) => {
    console.log('IMAGE CLICK: ', result);
  });

  params = {
    hashid,
    session_id: sessionId,
    id: 10,
    amount: 1,
    index: '1',
    title: 'Nice stuff',
    price: 20,
  }

  stats.addToCart(params).then((result) => {
    console.log('ADD: ', result);

    const params = {
      hashid,
      session_id: sessionId,
      id: 10,
      amount: 1,
      index: '1',
    }

    stats.removeFromCart(params).then((result) => {
      console.log('REMOVE: ', result);

      stats.clearCart({hashid, session_id: sessionId}).then((resultDelete) => {
        console.log('CLEAR: ', resultDelete);
      });
    });
  });

  params = {
    hashid,
    session_id: sessionId,
  }

  stats.registerCheckout(params).then((result) => {
    console.log('CHECKOUT: ', result);
  });
}