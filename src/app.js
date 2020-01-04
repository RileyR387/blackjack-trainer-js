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
      {
        'name': 'Player1',
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
      {
        'name': 'Player2',
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
      }
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

