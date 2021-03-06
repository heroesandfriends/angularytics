/**
 * The solution to tracking page views and events in a SPA with AngularJS
 * @version v0.2.3 - 2014-03-22
 * @link https://github.com/mgonto/angularytics
 * @author Martin Gontovnikas <martin@gonto.com.ar>
 * @license MIT License, http://www.opensource.org/licenses/MIT
 */
(function(){
    angular.module('angularytics', []).provider("Angularytics", function () {
      var eventHandlersNames = ['GoogleUniversal'];
      
      var capitalizeHandler = function(handler) {
          return handler.charAt(0).toUpperCase() + handler.substring(1);
      }
      
      return {
        setEventHandlers: function(handlers) {
              if (angular.isString(handlers)) {
                  handlers = [handlers];
              }
              eventHandlersNames = [];
              angular.forEach(handlers, function(handler) {
                  eventHandlersNames.push(capitalizeHandler(handler))
              });
          },  
        $get: function () {
          return: {
            eventHandlers: eventHandlerNames;
          };
        }
      };
    });
 
    angular.module('angularytics', []).
        service('Angularytics', [ 'Angularytics', '$rootScope', '$location', function AngularyticsService(Angularytics, $rootScope, $location) {

            var pageChangeEvent = '$locationChangeSuccess';
            this.setPageChangeEvent = function(newPageChangeEvent) {
              pageChangeEvent = newPageChangeEvent;
            }

            var eventHandlers = Angularytics.eventHandlers;

            angular.forEach(eventHandlersNames, function(handler) {
                eventHandlers.push($injector.get('Angularytics' + handler + 'Handler'));
            });

            var forEachHandlerDo = function(action) {
                angular.forEach(eventHandlers, function(handler) {
                    action(handler);
                });
            }
 
            return {
                // Just dummy function so that it's instantiated on app creation
                init: function() {
                    console.log('angularytics service init done');
                },
                trackEvent: function(category, action, opt_label, opt_value, opt_noninteraction) {
                    forEachHandlerDo(function(handler) {
                        if (category && action) {
                            handler.trackEvent(category, action, opt_label, opt_value, opt_noninteraction);
                        }
                    });
                },
                trackPageView: function(url) {
                    forEachHandlerDo(function(handler) {
                        if (url) {
                            handler.trackPageView(url);
                        }
                    });
                },
                // Event listening
                $rootScope.$on(pageChangeEvent, function() {
                    trackPageView($location.path());
                });
            };
    });
})();

(function(){
    angular.module('angularytics').factory('AngularyticsConsoleHandler', ['$log', function($log) {
        var service = {};

        service.trackPageView = function(url) {
            $log.log("URL visited", url);
        }

        service.trackEvent = function(category, action, opt_label, opt_value, opt_noninteraction) {
            $log.log("Event tracked", category, action, opt_label, opt_value, opt_noninteraction);
        }

        return service;
    }]);
})();

(function(){
    angular.module('angularytics').factory('AngularyticsGoogleHandler', ['$log', function($log) {
        var service = {};

        service.trackPageView = function(url) {
            _gaq.push(['_set', 'page', url]);
            _gaq.push(['_trackPageview', url]);
        }

        service.trackEvent = function(category, action, opt_label, opt_value, opt_noninteraction) {
            _gaq.push(['_trackEvent', category, action, opt_label, opt_value, opt_noninteraction]);
        }

        return service;
    }]).factory('AngularyticsGoogleUniversalHandler', function () {
        var service = {};

        service.trackPageView = function (url) {
            ga('set', 'page', url);
            ga('send', 'pageview', url);
        };

        service.trackEvent = function (category, action, opt_label, opt_value, opt_noninteraction) {
            ga('send', 'event', category, action, opt_label, opt_value, {'nonInteraction': opt_noninteraction});
        };

        return service;
    });
})();

angular.module('angularytics').filter('trackEvent', ['Angularytics', function(Angularytics) {
    return function(entry, category, action, opt_label, opt_value, opt_noninteraction) {
        Angularytics.trackEvent(category, action, opt_label, opt_value, opt_noninteraction);
        return entry;
    }
}]);
