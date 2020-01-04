/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */

var app = angular.module('BlackjackAI', []);

app.controller( 'BlackjackGameController', ['$scope', 'BlackjackGameService', function( $scope, BlackjackGameService ) {
  $scope.gameSettingsDialog   = new GameSettingsDialogModel();
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel();
  this.game = {
    opts: {
      deckCount: 8,
      dealRate: 0.7,
      showDeckStats: false,
      payout: '1.5'
    },
    players: [
      new PlayerModel('Player 1', null, 200),
      new PlayerModel('Player 2', null, 200)
    ],
    dealer: {
      'name': 'Dealer',
      'hands': [],
      'agent': null,
      'roundsPlayed': 0,
      'handsPlayed': 0,
      'bankRoll': 200,
      'stats': {
        'bjs': 0,
         'wins': 0,
         'splits': 0,
         'doubles': 0,
         'pushes': 0,
         'loses': 0,
         'busts': 0,
      }
    },
    gameState: null,
    shoe: null
  };
}]);

app.factory('BlackjackGameService', [ '$q', function( $q ){
  var factory = { };
  return factory;
}]);

