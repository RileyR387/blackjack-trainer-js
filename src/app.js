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
      new PlayerModel('KayOh', null, 200),
      new PlayerModel('HighLow', null, 200),
      new PlayerModel('AverageJoe', null, 200),
      new PlayerModel('You', null, 200),
    ],
    dealer: new PlayerModel('Dealer', null, 100000),
    gameState: null,
    shoe: null
  };

  this.game.shoe = new ShoeModel( this.game.opts.deckCount );

  //this.game.players[0].hands = [new HandModel()];
  //this.game.players[1].hands = [new HandModel(), new HandModel()];
  /*
  this.game.players.forEach(function(player, index){
    player.addHand( [] );
  });
  */

  this.game.gameState = new GameState( this.game.opts, this.game.players, this.game.dealer );

  this.dealHand = function(){
    console.log( "Controller Dealing" );

    //while( this.game.gameState.status != "GAMEOVER"){
    while( this.game.gameState.status == "DEALING_HANDS"){
      var card;
      try{
        card = this.game.shoe.nextCard();
      } catch( shuffleShoeException ){
        console.log("Last hand in shoe!");
      }
      this.game.gameState.consumeCard( card );
    }
  }

}]);

app.factory('BlackjackGameService', [ '$q', function( $q ){
  var factory = { };
  return factory;
}]);

