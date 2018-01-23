(function(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(function(){

  window.controllers = [];

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
  var basicInputWidget = new doofinder.widgets.QueryInput("#basicInput");
  // create a results widget
  var basicResultsWidget = new doofinder.widgets.ScrollDisplay("#basicResults");
  // register widgets in the controller
  basicController.registerWidgets([basicInputWidget, basicResultsWidget]);
  configureStatusHandler(basicController, "#basicStatus");

  window.controllers.push(basicController);

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
          widget.on("df:range:change", function(a){
            console.log(arguments);
          });
          break;
        default:
          console.warn('Invalid facet type: ' + facetOptions.type);
          return;
      }
      advancedController.registerWidget(widget);
    });
  });

  window.controllers.push(advancedController);

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

  window.controllers.push(firstController);
  window.controllers.push(secondController);
});