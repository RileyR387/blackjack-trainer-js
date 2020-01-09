/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */

const app = angular.module('BlackjackAI', []);

app.controller( 'BlackjackGameController', [
         '$scope', 'HumanActionService',
function( $scope,   HumanActionService ) {
  console.log("Constructing game");

  $scope.gameSettingsDialog   = new GameSettingsDialogModel();
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel();

  this.game = {
    opts: {
      deckCount: 6,
      dealRate: 0.1,
      showDeckStats: false,
      payout: '1.5',
      minBet: 10,
    },
    players: [
      new PlayerModel('You', HumanActionService, 200, true),
      new PlayerModel('HighLow', null, 200),
      new PlayerModel('AverageJoe', null, 200),
      new PlayerModel('KayOh', null, 200),
      //new PlayerModel('You', HumanActionService, 200, true),
    ],
    dealer: new PlayerModel('Dealer', null, 100000),
  };

  this.gameState = new GameState( this.game );
  this.shoe      = new ShoeModel( this.game.opts.deckCount );
  this.c
  this.card = null;
  this.cardConsumed = true;

  this.shuffleShoe = function() {
    console.log("Shuffling shoe...");
    this.shoe = new ShoeModel( this.game.opts.deckCount );
    this.gameState = new GameState( this.game );
    this.dealRound();
  }

  this.dealRound = async function(){
    console.log( "Controller Dealing" );
    while( this.gameState.status != "SCORE" && this.gameState.status != "GAMEOVER" ){
      if( this.cardConsumed ){
        try{
          card = this.shoe.nextCard();
          console.log( this.shoe._shoe.length + " cards remain - CardUpcoming: " + card.value());
        } catch( ShuffleShoeException ){
          console.log("Last hand in shoe!");
          this.gameState.newShoeFlag = true;;
        }
      }
      try{
        await this.gameState.consumeCard( card );
        await sleep( Math.round(this.game.opts.dealRate * 1000) );
        this.cardConsumed = true;
      } catch( e ){
        this.cardConsumed = false;
      }
      $scope.$apply();
    }
  }

  this.endRound = function(){
    if( this.gameState.status == 'GAMEOVER' ){
      this.shuffleShoe();
    } else if( this.gameState.status == 'SCORE'){
      this.gameState.clearRound();
      this.dealRound();
    }
  }

  this.deal = function(){
    var finalBet = HumanActionService.tempBet;
    HumanActionService.tempBet = 0;
    HumanActionService.bet = finalBet;
  }

  this.addBet = function(betAmt){
    this.endRound();
    HumanActionService.tempBet += betAmt;
    this.gameState.getCurrentPlayer().bankRoll -= betAmt;
    this.gameState.getCurrentPlayer().hands[0].bet = HumanActionService.tempBet;
  }
  this.clearBet = function(){
    this.gameState.getCurrentPlayer().bankRoll += HumanActionService.tempBet;
    HumanActionService.tempBet = 0;
    this.gameState.getCurrentPlayer().hands[0].bet = HumanActionService.tempBet;
  }
  this.halfBet = function(){
    this.endRound();
    if( (HumanActionService.tempBet/2) % 5 == 0 ){
      HumanActionService.tempBet /= 2;
      this.gameState.getCurrentPlayer().bankRoll += HumanActionService.tempBet;
      this.gameState.getCurrentPlayer().hands[0].bet = HumanActionService.tempBet;
    }
  }
  this.doubleBet = function(){
    this.endRound();
    this.gameState.getCurrentPlayer().bankRoll -= HumanActionService.tempBet;
    HumanActionService.tempBet *= 2;
    this.gameState.getCurrentPlayer().hands[0].bet = HumanActionService.tempBet;
  }

  this.actionStand  = function(){ HumanActionService.action = 'STAND'; }
  this.actionHit    = function(){ HumanActionService.action = 'HIT'; }
  this.actionDouble = function(){
    // TODO: Need to implement `this.gameState.getCurrentHand()`
    if( this.gameState.getCurrentPlayer().hands[0].canDouble() ){
      HumanActionService.action = 'DOUBLE';
    }
  }
  this.actionSplit = function(){
    // TODO: Need to implement `this.gameState.getCurrentHand()`
    if( this.gameState.getCurrentPlayer().hands[0].canSplit() ){
      HumanActionService.action = 'SPLIT';
    }
  }

  this.dealRound();
}]);

app.factory('HumanActionService', [ '$q', function( $q ){
  this.name = 'Human';
  this.action = null;
  this.tempBet = 0;
  this.bet = null;
  this.placeBet = async function(priorGameStateView){
    console.log("HumanActionService - placeBet start");
    // TODO: Fire event to notify controller and apply eligible actions to buttons
    while( this.bet == null ){
      await sleep(50);
    }
    var nextBet = this.bet;
    this.bet = null;
    console.log("HumanActionService - placeBet end (amt: " + nextBet +")");
    return nextBet;
  }
  this.nextAction = async function(gameStateView, hand){
    console.log("HumanActionService - nextAction start");
    // TODO: Fire event to notify controller and apply eligible actions to buttons
    while( this.action == null ){
      await sleep(50);
    }
    var myNextAction = this.action;
    this.action = null;
    console.log("HumanActionService - nextAction end");
    return myNextAction;
  }
  this.takeInsurance = async function(gameStateView, hand){
    console.log("HumanActionService - takeInsurance start");
    // TODO: Fire event to notify controller and apply eligible actions to buttons
    console.log("HumanActionService - takeInsurance end");
  }
  return this;
}]);

app.filter('reverse', function() {
  return function(items){
    return items.slice().reverse();
  };
});

