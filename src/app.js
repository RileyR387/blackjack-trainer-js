/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */

const app = angular.module('BlackjackAI', []);

app.controller( 'BlackjackGameController', [
         '$scope', 'BlackjackGameService',
function( $scope,   BlackjackGameService ) {
  console.log("Constructing game");
  $scope.gameSettingsDialog   = new GameSettingsDialogModel();
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel();

  this.game = {
    opts: {
      deckCount: 6,
      dealRate: 0.1,
      showDeckStats: false,
      payout: '2.0',
      minBet: 10,
    },
    players: [
      new PlayerModel('You', null, 200),
      new PlayerModel('HighLow', null, 200),
      new PlayerModel('AverageJoe', null, 200),
      new PlayerModel('KayOh', null, 200),
    ],
    dealer: new PlayerModel('Dealer', null, 100000),
  };

  this.gameState = new GameState( this.game );
  this.shoe      = new ShoeModel( this.game.opts.deckCount );

  this.shuffleShoe = function() {
    console.log("Shuffling shoe...");
    this.shoe = new ShoeModel( this.game.opts.deckCount );
    if( this.gameState.status == 'GAMEOVER' ){
      this.gameState = new GameState( this.game );
    }
  }

  this.dealHands = async function(){
    console.log( "Controller Dealing" );
    //while( this.gameState.status == "DEALING_HANDS"){
    while( this.gameState.status != "GAMEOVER" ){
      console.log( this.shoe._shoe.length + " cards remain");
      var card;
      try{
        card = this.shoe.nextCard();
      } catch( shuffleShoeException ){
        console.log("Last hand in shoe!");
        this.gameState.newShoeFlag = true;;
      }
      this.gameState.consumeCard( card );
      await sleep( Math.round(this.game.opts.dealRate * 1000) );
      $scope.$apply();
    }
  }
  this.dealHands();
}]);

app.factory('BlackjackGameService', [ '$q', function( $q ){
  var factory = { };
  return factory;
}]);

app.filter('reverse', function() {
  return function(items){
    return items.slice().reverse();
  };
});

