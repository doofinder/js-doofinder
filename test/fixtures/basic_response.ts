import { RawSearchResponse } from "../../src/response";

export const basicResponse: RawSearchResponse = {
  autocomplete_suggest: 'Silla',
  banner: {
    blank: true,
    html_code: null,
    id: 5728,
    image: 'http://via.placeholder.com/768x90',
    link: 'http://www.doofinder.com',
    mobile_image: null,
  },
  custom_results_id: null,
  facets: {
    best_price: {
      doc_count: 2295,
      label: '',
      visible: true,
      range: {
        buckets: [
          {
            doc_count: 2295,
            from: 0.0,
            key: '0.0-*',
            stats: { avg: 283.44241397604185, count: 2295, max: 1490.0, min: 0.0, sum: 650500.340075016 },
          },
        ],
      },
    },
    price_range_slot: {
      doc_count: null,
      label: '',
      visible: true,
      order: 99,
      selected: {
        buckets: [],
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0
      },
      slots: true,
      terms: {
        buckets: [
          {
            doc_count: null,
            from: 0,
            key: "0 - 20",
            to: 20
          },
          {
            doc_count: null,
            from: 20,
            key: "20 - 50",
            to: 50
          },
          {
            doc_count: null,
            from: 50,
            key: "50 - 90",
            to: 90
          },
          {
            doc_count: null,
            from: 90,
            key: "90 - 180",
            to: 180
          },
          {
            doc_count: null,
            from: 180,
            key: "180 - 540",
            to: 540
          },
          {
            doc_count: null,
            from: 540,
            key: "540"
          }
        ],
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0
      },
      total: {
        value: null
      }
    },
    brand: {
      doc_count: 2295,
      label: '',
      visible: true,
      selected: { buckets: [{ doc_count: 426, key: 'JANE' }], doc_count_error_upper_bound: 0, sum_other_doc_count: 0 },
      order: 1,
      terms: {
        buckets: [
          { doc_count: 426, key: 'JANE' },
          { doc_count: 275, key: 'BE COOL' },
          { doc_count: 253, key: 'CASUALPLAY' },
          { doc_count: 216, key: 'CONCORD' },
          { doc_count: 179, key: 'JOIE' },
          { doc_count: 126, key: 'MACLAREN' },
          { doc_count: 92, key: 'MIMA' },
          { doc_count: 92, key: 'RECARO' },
          { doc_count: 61, key: 'MOUNTAIN-BUGGY' },
          { doc_count: 52, key: 'BABYHOME' },
          { doc_count: 48, key: 'BABYJOGGER' },
          { doc_count: 43, key: 'BABYZEN' },
          { doc_count: 40, key: 'NURSE' },
          { doc_count: 32, key: 'CHICCO' },
          { doc_count: 29, key: 'KLIPPAN' },
          { doc_count: 26, key: 'AXKID' },
          { doc_count: 26, key: 'EASYWALKER' },
          { doc_count: 24, key: 'TRUNKI' },
          { doc_count: 22, key: 'KIWISAC' },
          { doc_count: 19, key: 'BABY MONSTERS' },
        ],
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 151,
      },
      total: { value: 2232 },
    },
    categories: {
      doc_count: 2295,
      label: '',
      visible: true,
      order: 2,
      selected: {
        buckets: [
          { doc_count: 915, key: 'Ofertas - Outlet' },
          { doc_count: 419, key: 'Sillas de paseo' },
          { doc_count: 1, key: 'Capazo solo' },
        ],
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0
      },
      terms: {
        buckets: [
          { doc_count: null, key: 'Special Value' },
          { doc_count: 1, key: 'Capazo solo' }, // artifically added by the server
          { doc_count: 915, key: 'Ofertas - Outlet' },
          { doc_count: 881, key: 'Cochecitos de bebé' },
          { doc_count: 711, key: 'Sillas de paseo bebé' },
          { doc_count: 632, key: 'Sillas de coche bebé' },
          { doc_count: 603, key: 'Conjuntos de 2 o 3 piezas' },
          { doc_count: 419, key: 'Sillas de paseo' },
          { doc_count: 384, key: 'Individuales' },
          { doc_count: 371, key: 'Cochecitos de bebé Jane' },
          { doc_count: 311, key: 'Cochecitos bebé - Conjunto de 2 o 3 piezas' },
          { doc_count: 288, key: 'Sillas de coche con isofix bebé' },
          { doc_count: 275, key: 'Accesorios Cochecitos' },
          { doc_count: 272, key: 'Sillas de coche y cochecitos Be Cool' },
          { doc_count: 253, key: 'Conjuntos 2 piezas' },
          { doc_count: 227, key: 'Cochecitos y sillas de coche Casualplay' },
          { doc_count: 214, key: 'Conjuntos 3 piezas' },
          { doc_count: 202, key: 'Sillas de coche sin isofix bebé' },
          { doc_count: 193, key: 'Sillas de coche y cochecitos Concord' },
          { doc_count: 178, key: 'Sillas de coche y sillas de paseo Joie' },
          { doc_count: 135, key: 'Grupo 0-0+ (0 - 13kg)' },
          { doc_count: 135, key: 'Grupo 2-3 (15 - 36kg)' },
        ],
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 5092,
      },
      total: { value: 12691 },
    },
    df_object_validated: {
      doc_count: 2295,
      label: '',
      visible: true,
      order: 99,
      selected: { buckets: [], doc_count_error_upper_bound: 0, sum_other_doc_count: 0 },
      terms: { buckets: [], doc_count_error_upper_bound: 0, sum_other_doc_count: 0 },
      total: { value: 0 },
    },
    df_object_value: {
      doc_count: 2295,
      label: '',
      visible: true,
      order: 99,
      selected: { buckets: [], doc_count_error_upper_bound: 0, sum_other_doc_count: 0 },
      terms: { buckets: [], doc_count_error_upper_bound: 0, sum_other_doc_count: 0 },
      total: { value: 0 },
    },
  },
  hashid: '6a96504dc173514cab1e0198af92e6e9',
  max_score: 0.6194168,
  page: 1,
  phrase_suggest: null,
  query: 'silla',
  query_counter: 1,
  query_name: 'match_and',
  results: [
    {
      add_to_cart: null,
      description:
        'PORTAVASOS <em>SILLA</em> Original y práctico accesorio, para los padres y para el bebé, permite llevar siempre',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@ce6f311f2548c0e40fbd9beaaa288d32',
      id: '14983',
      image_link: 'https://www.mainada.es/3782-home_default/portavasos-silla.jpg',
      link: 'https://www.mainada.es/es/accesorios-cochecitos/portavasos-silla-p-14983.html',
      price: 12.49,
      sale_price: 7.95,
      title: 'Portavasos Silla',
      type: 'product',
    },
    {
      add_to_cart: null,
      description: 'Red antimosquitos para Mima Gemelar',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@f7e47cabc89aa734c3c9aec9aa9692c0',
      id: '35425',
      image_link: 'https://www.mainada.es/21517-home_default/mosquitera-silla-individual.jpg',
      link: 'https://www.mainada.es/es/cochecitos-de-bebe/mosquitera-silla-individual-p-35425.html',
      price: 24.9,
      sale_price: null,
      title: 'Mosquitera Silla individual',
      type: 'product',
    },
    {
      add_to_cart: null,
      description: 'y versatil de Joie se llama Pact. Completisima <em>silla</em> de paseo a un precio imbatible',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@9dde7d785093b1c88898c208797e1a9a',
      id: '36924',
      image_link: 'https://www.mainada.es/30027-home_default/silla-de-paseo-pact-coal.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-de-paseo-pact-coal-p-36924.html',
      price: 199.0,
      sale_price: null,
      title: 'Silla de Paseo Pact Coal',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Saco Jané con ajuste rápido con cremallera para los pies. Tejido polar en el interior y anoré en el exterior para proteger de altas temperaturas.',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@e5f5c9b8d407672fc0c83e836adff55d',
      id: '35810',
      image_link: 'https://www.mainada.es/33144-home_default/saco-silla-basic-crimson.jpg',
      link: 'https://www.mainada.es/es/inicio/saco-silla-basic-crimson-p-35810.html',
      price: 65.9,
      sale_price: 25.0,
      title: 'Saco Silla Basic - Crimson',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Saco Jané con ajuste rápido con cremallera para los pies. Tejido polar en el interior y anoré en el exterior para proteger de altas temperaturas.',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@9ace6a07fd1fe1b74ec890247ca3db43',
      id: '35808',
      image_link: 'https://www.mainada.es/22812-home_default/saco-silla-basic-rubin.jpg',
      link: 'https://www.mainada.es/es/inicio/saco-silla-basic-rubin-p-35808.html',
      price: 49.9,
      sale_price: 29.0,
      title: 'Saco Silla Basic - Rubin',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Funda que se ajusta especificamente para el modelo Montcarlo. Fácil de colocar y quitar. De tejido transpirable para evitar que el niño sude durante el viaje. Apto para lavadora.',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@cf655092dcaab37755c73d62c4eb1891',
      id: '37293',
      image_link: 'https://www.mainada.es/28065-home_default/funda-para-silla-montecarlo.jpg',
      link:
        'https://www.mainada.es/es/cochecitos-de-bebe-y-sillas-de-coche-jane/funda-para-silla-montecarlo-p-37293.html',
      price: 36.0,
      sale_price: 26.95,
      title: 'Funda para silla Montecarlo',
      type: 'product',
    },
    {
      add_to_cart: null,
      description: '¡Úsala desde recién nacido!',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@4ae0933519473723df3bebc3d2527aa9',
      id: '35634',
      image_link: 'https://www.mainada.es/22372-home_default/silla-de-paseo-wave.jpg',
      link: 'https://www.mainada.es/es/inicio/silla-de-paseo-wave-p-35634.html',
      price: 174.5,
      sale_price: 110.5,
      title: 'Silla de Paseo Wave',
      type: 'product',
    },
    {
      add_to_cart: null,
      description: '¡Úsala desde recién nacido!',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@ac42634b27b4530eac740d6b72fcb713',
      id: '35633',
      image_link: 'https://www.mainada.es/22369-home_default/silla-de-paseo-praline.jpg',
      link: 'https://www.mainada.es/es/inicio/silla-de-paseo-praline-p-35633.html',
      price: 174.5,
      sale_price: 110.5,
      title: 'Silla de Paseo Praline',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Cochecito de viaje perfecto para las familias que están siempre en movimiento, el ultra-liviano Nano ™ ofrece suprema facilidad de uso, calidad de primera calidad y funcionalidad pura para que sea una…',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@bc15d64e322b822a8509e75eaaaa3762',
      id: '32474',
      image_link: 'https://www.mainada.es/17589-home_default/silla-nano-black.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-nano-black-p-32474.html',
      price: 299.0,
      sale_price: null,
      title: 'Silla Nano Black',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@f65d22c53bba4ccf77df86be93a43d5a',
      id: '32495',
      image_link: 'https://www.mainada.es/13452-home_default/silla-swift-arena.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-arena-p-32495.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Arena',
      type: 'product',
    },
    {
      add_to_cart: null,
      description: '¡Úsala desde recién nacido!',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@9beff913467a3024cbd3d7a92308347b',
      id: '35631',
      image_link: 'https://www.mainada.es/22361-home_default/silla-de-paseo-scarlet.jpg',
      link: 'https://www.mainada.es/es/inicio/silla-de-paseo-scarlet-p-35631.html',
      price: 174.5,
      sale_price: 110.5,
      title: 'Silla de Paseo Scarlet',
      type: 'product',
    },
    {
      add_to_cart: null,
      description: '¡Úsala desde recién nacido!',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@73e93611928dad613fa55a8b1a7940f7',
      id: '35632',
      image_link: 'https://www.mainada.es/22364-home_default/silla-de-paseo-rock.jpg',
      link: 'https://www.mainada.es/es/inicio/silla-de-paseo-rock-p-35632.html',
      price: 174.5,
      sale_price: 110.5,
      title: 'Silla de Paseo Rock',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@6f0362b8ffe8f935b4500b8391c0ddeb',
      id: '32494',
      image_link: 'https://www.mainada.es/13451-home_default/silla-swift-coral.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-coral-p-32494.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Coral',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@e77d89a5cfa17ff55d0b928bf21b2d0f',
      id: '32493',
      image_link: 'https://www.mainada.es/13443-home_default/silla-swift-verde.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-verde-p-32493.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Verde',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@dab4bf03e1db06211813f768070d245e',
      id: '32492',
      image_link: 'https://www.mainada.es/13432-home_default/silla-swift-plata.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-plata-p-32492.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Plata',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@ea0bce2346d589ebc1fa3030b0e97044',
      id: '32491',
      image_link: 'https://www.mainada.es/13420-home_default/silla-swift-amarillo.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-amarillo-p-32491.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Amarillo',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@fd8bd77225ce96b0a96239fe8481f208',
      id: '32490',
      image_link: 'https://www.mainada.es/13413-home_default/silla-swift-marine.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-marine-p-32490.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Marine',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Con la <em>silla</em> de paseo Mountain Buggy Swift podrás hacer frente a los baches y a las bajadas con pendiente',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@74e48c1a38cb4022d50c45dbd3be1f9a',
      id: '32483',
      image_link: 'https://www.mainada.es/13388-home_default/silla-swift-rojo.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-swift-rojo-p-32483.html',
      price: 549.0,
      sale_price: null,
      title: 'Silla Swift Rojo',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Cochecito de viaje perfecto para las familias que están siempre en movimiento, el ultra-liviano Nano ™ ofrece suprema facilidad de uso, calidad de primera calidad y funcionalidad pura para que sea una…',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@94a7358e05938307a0e91a10c608d675',
      id: '32477',
      image_link: 'https://www.mainada.es/17597-home_default/silla-nano-nautical-azul.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-nano-nautical-azul-p-32477.html',
      price: 299.0,
      sale_price: null,
      title: 'Silla Nano Nautical Azul',
      type: 'product',
    },
    {
      add_to_cart: null,
      description:
        'Cochecito de viaje perfecto para las familias que están siempre en movimiento, el ultra-liviano Nano ™ ofrece suprema facilidad de uso, calidad de primera calidad y funcionalidad pura para que sea una…',
      df_rating: null,
      dfid: '6a96504dc173514cab1e0198af92e6e9@product@dcdca98a68d012618ce17d4fe3c87f34',
      id: '32476',
      image_link: 'https://www.mainada.es/17593-home_default/silla-nano-ruby-rojo.jpg',
      link: 'https://www.mainada.es/es/sillas-de-paseo-individuales/silla-nano-ruby-rojo-p-32476.html',
      price: 299.0,
      sale_price: null,
      title: 'Silla Nano Ruby Rojo',
      type: 'product',
    },
  ],
  results_per_page: 20,
  total: 1000,
  total_found: 2295,
};
