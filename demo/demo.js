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
      switch(facetOptions.type) {
        case 'terms':
          // register a panel widget that will contain the facet widget
          advancedController.registerWidget(
            new doofinder.widgets.CollapsiblePanel(
              "#advancedAside",
              function(panel){
                var maxVisibleTerms = Math.max(10, Math.round(facetOptions.size / 2));
                var widget = new doofinder.widgets.TermsFacet(
                  panel.contentElement,
                  facetOptions.name,
                  {
                    // Display facets for `brand` with no collapsing
                    size: facetOptions.name == 'brand' ? null : maxVisibleTerms,
                    label: facetOptions.label
                  }
                );

                widget.on("df:widget:render", function(res){
                  var html = [facetOptions.label];
                  var total = this.selectedTerms;
                  if (total > 0) {
                    html.push('(' + total + ')');
                  }
                  panel.labelElement.html(html.join(' '));
                });

                return widget;
              },
              {
                insertionMethod: "prepend",
                startCollapsed: false,
                templateVars: {
                  label: facetOptions.label
                }
              }
            )
          );
          break;
        case 'range':
          // assume there's only one, insert it inside a div
          advancedController.registerWidget(
            new doofinder.widgets.RangeFacet("#advancedRangeFacet", facetOptions.name, {
              format: function(value) {
                return value.toFixed(2) + "€";
              }
            })
          );
          break;
        default:
          console.warn('Invalid facet type: ' + facetOptions.type);
      }
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
