/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

const app = angular.module('BlackjackAI', []);

app.controller( 'BlackjackGameController', [
         '$scope', '$timeout', '$interval', 'BlackjackGameService',
function( $scope,   $timeout,   $interval,   BlackjackGameService ) {

  $scope.gameSettingsDialog   = new GameSettingsDialogModel();
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel();

  this.game = {
    opts: {
      deckCount: 8,
      dealRate: 0.5,
      showDeckStats: false,
      payout: '1.5'
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

  this.dealHands = async function(){
    console.log( "Controller Dealing" );
    while( this.gameState.status == "DEALING_HANDS"){
      var card;
      try{
        card = this.shoe.nextCard();
      } catch( shuffleShoeException ){
        console.log("Last hand in shoe!");
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
