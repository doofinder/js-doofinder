function demo({ Client, Query, StatsClient }) {
  /** All requests should be done with https protocol in our api location. https://{search_zone}-search.doofinder.com where {search_zone} depends on your location, is the geographic zone your search engine is located at. i.e.: eu1.  (https://docs.doofinder.com/api/search/v6/#section/Basics/Endpoint) */
  const server = 'eu1-search.doofinder.com'
  /** Your personal authentication token obtained in the control panel. (https://docs.doofinder.com/api/search/v6/#section/Basics/Authentication) */
  const secret = '';
  /** The search engine's unique id. i.e.: d8fdeab7fce96a19d3fc7b0ca7a1e98b (https://docs.doofinder.com/api/search/v6/#section/Basics/Conventions) */
  const hashid = ''
  /** The current session ID, must be unique for each user. */
  const sessionId = '';
  /** Unique ID of the clicked result. */
  const dfid = ''

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
    console.log('SEARCH IMAGE: ', result);
  });

  let params = {
    hashid,
    session_id: sessionId,
    user_id: "dd"
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
    query: '',
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

      stats.clearCart({ hashid, session_id: sessionId }).then((resultDelete) => {
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