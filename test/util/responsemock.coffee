module.exports = (hashid, queryCounter = 1) ->
  responseMock =
    hashid: hashid
    max_score: 1.3
    page: 1
    query: "some query"
    query_counter: queryCounter
    query_name: "fuzzy"
    results_per_page: 12
    total: 31
    results: [
      description: "Antena. 5.2 dBi. omnidireccional…"
      dfid: "523093f0ded16148dc005362"
      id: "ID1"
      image_url: "http://www.example.com/images/product_image.jpg"
      title: "Cisco Aironet Pillar Mount Diversity Omnidirectional Antenna"
      type: "product"
      url: "http://www.example.com/product_description.html"
    ,
      description: "Teclado. USB. España…"
      dfid: '523093f0ded16148dc0053xx'
    ]
    facets:
      best_price:
        _type: "range"
        range:
          buckets: [
            key: "0.0-*"
            stats:
              count: 24
              from: 0
              max: 225
              mean: 77.32
              min: 8.5
              total: 1855.57
              total_count: 24
          ]

      color:
        _type: "terms"
        missing:
          doc_count: 16
        doc_count: 10
        other: 0
        terms:
          buckets: [
            key: "Azul"
            doc_count: 3
          ,
            key: "Rojo"
            doc_count: 1
          ]
        total:
          value: 1

      categories:
        _type: "terms"
        missing:
          doc_count: 0
        doc_count: 50
        other: 0
        terms:
          buckets: [
            key: "Sillas de paseo"
            doc_count: 6
          ,
            key: "Seguridad en el hogar"
            doc_count: 5
          ]
        total:
          value: 50
