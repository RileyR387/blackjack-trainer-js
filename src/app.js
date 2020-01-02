/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */

$('#gSettingsModal').modal({show: true});

var BlackjackAI = angular.module('BlackjackAI', []);

BlackjackAI.controller( 'BlackjackGameController', ['$scope', 'BlackjackGameService', function( $scope, BlackjackGameService ) {
  var self = this;

  self.game = {
    opts: null,
    players: null,
    gameState: null,
    shoe: null
  };

}]);

BlackjackAI.factory('BlackjackGameService', [ '$q', function( $q ){
  var factory = {

  };
  return factory;
}]);

