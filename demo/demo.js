(function(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(function(){

  window.doofinderControllers = {};

  // some utilities
  var $ = doofinder.util.dfdom;
  var bean = doofinder.util.bean;

  function configureStatusHandler(controller, container) {
    controller.on("df:results:success", function(res){
      $(container).html(this.serializeStatus());
    });
  }

  //
  // Basic
  //

  // create a search client
  var basicClient = new doofinder.Client(HASHID, {zone: 'eu1'});
  // create a basic controller, get 20 results per page
  var basicController = new doofinder.Controller(basicClient, {rpp: 20});
  // create an input widget
  var basicInputWidget = new doofinder.widgets.QueryInput("#basicInput", {
    delayedEvents: {
      "df:user:bored": 10000
    }
  });
  basicInputWidget.on("df:input:stop", function(value){
    console.log("The user stopped writing.");
  });
  basicInputWidget.on("df:user:bored", function(value){
    console.log("The user is bored!");
  });
  // create a results widget
  var basicResultsWidget = new doofinder.widgets.ScrollDisplay("#basicResults");
  // register widgets in the controller
  basicController.registerWidgets([basicInputWidget, basicResultsWidget]);
  configureStatusHandler(basicController, "#basicStatus");

  window.doofinderControllers.basic = basicController;

  //
  // Basic Paged
  //

  // create a search client
  var pagedClient = new doofinder.Client(HASHID, {zone: 'eu1'});
  // create a basic controller, get 20 results per page
  var pagedController = new doofinder.Controller(pagedClient, {rpp: 10});
  // create an input widget
  var pagedInputWidget = new doofinder.widgets.QueryInput("#pagedInput");
  // create a results widget
  var pagedResultsWidget = new doofinder.widgets.Display("#pagedResults");
  // create a pager widget
  var pagedPagerWidget = new doofinder.widgets.Pager("#pagedPager");
  // register widgets in the controller
  pagedController.registerWidgets([pagedInputWidget, pagedResultsWidget, pagedPagerWidget]);
  configureStatusHandler(pagedController, "#pagedStatus");

  window.doofinderControllers.paged = pagedController;

  //
  // Advanced
  //

  // create a search client
  var advancedClient = new doofinder.Client(HASHID, {zone: 'eu1'});
  // create a new controller
  var advancedController = new doofinder.Controller(advancedClient, {rpp: 50});
  configureStatusHandler(advancedController, "#advancedStatus");
  // create an input widget
  var advancedInputWidget = new doofinder.widgets.QueryInput("#advancedInput");
  // create a results widget, results are rendered inside an inner node
  var advancedResultsWidget = new doofinder.widgets.ScrollDisplay("#advancedResults", {
    contentElement: ".df-results__content"
  });
  // register widgets in the controller
  advancedController.registerWidgets([advancedInputWidget, advancedResultsWidget]);
  // get options from doofinder server, to fetch facets configuration
  advancedClient.options(function(err, options){
    options.facets.reverse().forEach(function(facetOptions){
      var widget, node;

      try {
        node = $("#" + facetOptions.name);
      } catch (e) {
        console.log(e);
        return;
      }

      switch(facetOptions.type) {
        case 'terms':
          if (facetOptions.name === 'brand') {
            widget = new doofinder.widgets.TermsFacet(
              node,
              facetOptions.name,
              {
                size: 5,
                startCollapsed: true,
                translations: {
                  "View more…": "More…",
                  "View less…": "Less…"
                }
              }
            );
          } else {
            widget = new doofinder.widgets.TermsFacet(
              node,
              facetOptions.name
            );
          }
          break;
        case 'range':
          // assume there's only one, insert it inside a div
          widget = new doofinder.widgets.RangeFacet(
            node,
            facetOptions.name, {
              format: function(value) {
                return value.toFixed(2) + "€";
              }
            }
          );
          widget.on("df:range:change", function(filter, boundaries){
            console.log("There are products between " + boundaries.min + " and " + boundaries.max + "€");
            console.log("Filtering products between " + filter.start + " and " + filter.end + "€");
          });
          break;
        default:
          console.warn('Invalid facet type: ' + facetOptions.type);
          return;
      }
      advancedController.registerWidget(widget);
    });
  });

  window.doofinderControllers.advanced = advancedController;

  //
  // Multiple Controllers, same input
  //

  // create a search client
  var commonClient = new doofinder.Client(HASHID, {zone: 'eu1'});
  // create an input widget
  var commonInputWidget = new doofinder.widgets.QueryInput("#commonInput");

  // create first controller, get 20 results per page
  var firstController = new doofinder.Controller(commonClient, {rpp: 20});
  configureStatusHandler(firstController, "#firstStatus");
  // create first results widget (horizontal!)
  var firstResultsWidget = new doofinder.widgets.ScrollDisplay("#firstResults", {
    offset: 200,
    horizontal: true
  });
  // register widgets
  firstController.registerWidgets([commonInputWidget, firstResultsWidget]);

  // create second controller, get 20 results per page
  var secondController = new doofinder.Controller(commonClient, {rpp: 20});
  configureStatusHandler(secondController, "#secondStatus");
  // create second results widget
  var secondResultsWidget = new doofinder.widgets.ScrollDisplay("#secondResults", {
    template: document.getElementById('myCustomTemplate').innerHTML,
    templateFunctions: {
      bold: function() {
        return function(text, render) {
          return "<b>" + render(text) + "</b>";
        }
      }
    },
    templateVars: {
      meaningOfLife: 42
    },
    translations: {
      "Hello!": "Hola!"
    }
  });
  // register widgets
  secondController.registerWidgets([commonInputWidget, secondResultsWidget]);

  window.doofinderControllers.multiple = {first: firstController, second: secondController};

  //
  // Multiple Inputs and multiple controllers
  //

  // create a search client
  var multipleClient = new doofinder.Client(HASHID, {zone: 'eu1'});

  // create an input widget
  var multipleInputWidget = new doofinder.widgets.QueryInput([".Multiple", "#multipleInput"]);

  // create a controllers, get 20 results per page
  var firstControllerMultiple = new doofinder.Controller(multipleClient, {rpp: 20});
  configureStatusHandler(firstControllerMultiple, "#firstStatusMultiple");
  var secondControllerMultiple = new doofinder.Controller(multipleClient, {rpp: 20, transformer: "onlyid"});
  configureStatusHandler(secondControllerMultiple, "#secondStatusMultiple");

  // create a results widget
  var firstResultsMultiple = new doofinder.widgets.ScrollDisplay("#firstResultsMultiple", {
    offset: 200,
    horizontal: true
  });
  var secondResultsMultiple = new doofinder.widgets.ScrollDisplay("#secondResultsMultiple", {
    template: "{{#results}}<li>{{id}}</li>{{/results}}"
  });

  firstControllerMultiple.registerWidgets([multipleInputWidget, firstResultsMultiple]);
  secondControllerMultiple.registerWidgets([multipleInputWidget, secondResultsMultiple]);


  window.doofinderControllers.multipleInputsAndControllers = {first: firstControllerMultiple, second: secondControllerMultiple};
});
