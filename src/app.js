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
    dealer: new PlayerModel('Dealer', null, 100000),
    gameState: null,
    shoe: null
  };

  this.game.shoe = new ShoeModel( this.game.opts.deckCount );
  //this.game.shoe.shuffle();
  console.log( this.game.shoe._shoe );

  this.game.players[0].hands = [new HandModel()];
  this.game.players[1].hands = [new HandModel(), new HandModel()];
/*
  this.game.players.forEach(function(player, index){
    player.addHand( [] );
  });
  */

}]);

app.factory('BlackjackGameService', [ '$q', function( $q ){
  var factory = { };
  return factory;
}]);

