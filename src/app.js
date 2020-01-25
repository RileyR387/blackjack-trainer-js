/**
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * OSL-3.0
 */

const app = angular.module('BlackjackAI', []);

app.controller( 'BlackjackGameController', [
         '$scope', 'HumanActionService',
function( $scope,   HumanActionService ) {

  this.applyScope = async function(){
    await $scope.$applyAsync();
  }

  this.game = {
    opts: {
      deckCount: 8,
      dealRate: 0.25,
      showDeckStats: true,
      payout: '1.5',
      minBet: 10,
      enableInsurance: true,
    },
    dealer: new PlayerModel('Dealer', null, 100000),
  };
  this.game.players = [
    new PlayerModel('You', HumanActionService, 200, true),
    new PlayerModel('HighLow', new PullUp(this.game.opts), 200),
    new PlayerModel('PullUp', new PullUp(this.game.opts), 200),
    new PlayerModel('KayOh', new PullUp(this.game.opts), 200),
    //new PlayerModel('You', HumanActionService, 200, true),
    //new PlayerModel('You', HumanActionService, 300, true),
  ];

  this.gameState = new GameState( this.game, this.applyScope );
  this.shoe      = new ShoeModel( this.game.opts.deckCount );

  this.card = null;
  this.cardConsumed = true;

  $scope.navbar               = new NavbarModel();
  $scope.gameSettingsDialog   = new GameSettingsDialogModel(this, $scope.navbar);
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel(this, $scope.navbar);

  this.shuffleShoe = async function() {
    console.log("Shuffling shoe...");
    this.shoe = new ShoeModel( this.game.opts.deckCount );
    this.gameState = new GameState( this.game, this.applyScope );
    await this.dealRound();
  }

  this.dealRound = async function(){
    console.log( "Controller Dealing" );
    while( this.gameState.status != "Score" && this.gameState.status != "Game Over" ){
      if( this.cardConsumed ){
        try{
          card = this.shoe.nextCard();
          //console.log( this.shoe._shoe.length + " cards remain - CardUpcoming: " + card.value());
        } catch( ShuffleShoeException ){
          //console.log("Last hand in shoe!");
          this.gameState.newShoeFlag = true;;
        }
      }
      try{
        await this.gameState.consumeCard( card );
        this.cardConsumed = true;
      } catch( e ){
        this.cardConsumed = false;
      }
      console.log( "Delt: " + card.toString() + " used: " + this.cardConsumed );
      //$scope.$applyAsync();
      if( this.gameState.status != 'Score' && this.gameState.status != 'Game Over' ){
        $scope.$apply();
        await sleep( Math.round(this.game.opts.dealRate * 1000) );
      }
    }
    if( this.gameState.status == 'Score' && this.gameState.newShoeFlag ){
      this.gameState.status = 'Game Over';
    }
    this.gameState.ScoreRound();
    $scope.$applyAsync();
    await sleep( Math.round(this.game.opts.dealRate * 1000) );
  }

  this.endRound = async function(){
    if( this.gameState.status == 'Game Over' ){
      await this.shuffleShoe();
    } else if( this.gameState.status == 'Score'){
      await this.gameState.clearRound();
      await this.dealRound();
    }
  }

  this.deal = async function(){
    this.endRound();
    $scope.$applyAsync();
    var currPlayer = this.gameState.getCurrentPlayer();
    while( ! currPlayer.isHuman ){
      await sleep( this.game.opts.dealRate * 1001 );
      currPlayer = this.gameState.getCurrentPlayer();
    }
    var finalBet = HumanActionService.tempBet;
    if( finalBet != 0 ){
      HumanActionService.tempBet = 0;
      HumanActionService.bet = finalBet;
    }
    if( currPlayer.lastBet != 0 ){
      currPlayer.bankRoll -= currPlayer.lastBet;
      currPlayer.hands[0].bet = currPlayer.lastBet;
      HumanActionService.bet = currPlayer.lastBet;
    }
  }

  this.addBet = async function(betAmt){
    this.endRound();
    var currPlayer = this.gameState.getCurrentPlayer();
    while( ! currPlayer.isHuman ){
      await sleep( this.game.opts.dealRate * 1001 );
      currPlayer = this.gameState.getCurrentPlayer();
    }
    currPlayer.lastBet = 0;
    HumanActionService.tempBet += betAmt;
    currPlayer.bankRoll -= betAmt;
    currPlayer.hands[0].bet = HumanActionService.tempBet;
    $scope.$applyAsync();
  }
  this.clearBet = async function(){
    this.endRound();
    var currPlayer = this.gameState.getCurrentPlayer();
    while( ! currPlayer.isHuman ){
      await sleep( this.game.opts.dealRate * 1001 );
      currPlayer = this.gameState.getCurrentPlayer();
    }
    currPlayer.bankRoll += HumanActionService.tempBet;
    currPlayer.lastBet = 0;
    HumanActionService.tempBet = 0;
    currPlayer.hands[0].bet = HumanActionService.tempBet;
  }
  this.halfBet = async function(){
    this.endRound();
    var currPlayer = this.gameState.getCurrentPlayer();
    while( ! currPlayer.isHuman ){
      await sleep( this.game.opts.dealRate * 1001 );
      currPlayer = this.gameState.getCurrentPlayer();
    }
    if( HumanActionService.tempBet == 0 && currPlayer.lastBet != 0 ){
      currPlayer.lastBet = currPlayer.lastBet - currPlayer.lastBet%10;
      HumanActionService.tempBet = currPlayer.lastBet;
      currPlayer.hands[0].bet = currPlayer.lastBet;
      currPlayer.bankRoll -= currPlayer.lastBet;
      currPlayer.lastBet = 0;
    }
    if( HumanActionService.tempBet != 0 && (HumanActionService.tempBet/2) % 5 == 0 ){
      HumanActionService.tempBet -= (HumanActionService.tempBet/2)%5;
      HumanActionService.tempBet /= 2;
      currPlayer.bankRoll += HumanActionService.tempBet;
      currPlayer.hands[0].bet = HumanActionService.tempBet;
      this.deal();
    }
  }
  this.doubleBet = async function(){
    this.endRound();
    var currPlayer = this.gameState.getCurrentPlayer();
    while( ! currPlayer.isHuman ){
      await sleep( this.game.opts.dealRate * 1001 );
      currPlayer = this.gameState.getCurrentPlayer();
    }

    if( HumanActionService.tempBet == 0 && currPlayer.lastBet != 0){
      HumanActionService.tempBet = currPlayer.lastBet;
      currPlayer.bankRoll -= currPlayer.lastBet
      currPlayer.lastBet = 0;
    }

    if( HumanActionService.tempBet == 0 && currPlayer.lastBet != 0){
      HumanActionService.tempBet = currPlayer.lastBet;
    }
    currPlayer.bankRoll -= HumanActionService.tempBet;
    HumanActionService.tempBet *= 2;
    currPlayer.hands[0].bet = HumanActionService.tempBet;
    this.deal();
  }

  this.takeInsurance = function(){
    var currPlayer = this.gameState.getCurrentPlayer();
    currPlayer.bankRoll -= currPlayer.hands[0].bet/2;
    currPlayer.hands[0].insured = true;
    HumanActionService.insurance = true;
  }
  this.declineInsurance = function(){
    HumanActionService.insurance = false;
  }

  this.actionStand  = function(){ HumanActionService.action = 'STAND'; }
  this.actionHit    = function(){ HumanActionService.action = 'HIT'; }
  this.actionDouble = function(){
    if( this.gameState.getCurrentHand().canDouble() ){
      HumanActionService.action = 'DOUBLE';
    }
  }
  this.actionSplit = function(){
    if( this.gameState.getCurrentHand().canSplit() ){
      HumanActionService.action = 'SPLIT';
    }
  }

  this.dealRound();

  //$scope.gameSettingsDialog.open();
  //$scope.navbar.expand();
}]);

app.factory('HumanActionService', [ '$q', function( $q ){
  this.name = 'Human';
  this.action = null;
  this.tempBet = 0;
  this.bet = null;
  this.insurance = null;

  this.placeBet = async function(priorGameStateView){
    //console.log("HumanActionService - placeBet start");
    while( this.bet == null ){
      await sleep(50);
    }
    var nextBet = this.bet;
    this.bet = null;
    //console.log("HumanActionService - placeBet end (amt: " + nextBet +")");
    return nextBet;
  }

  this.nextAction = async function(gameStateView, hand){
    //console.log("HumanActionService - nextAction start");
    while( this.action == null ){
      await sleep(50);
    }
    var myNextAction = this.action;
    this.action = null;
    //console.log("HumanActionService - nextAction end");
    return myNextAction;
  }

  this.takeInsurance = async function(gameStateView, hand){
    //console.log("HumanActionService - takeInsurance start");
    while( this.insurance == null ){
      await sleep(50);
    }
    var choice = this.insurance;
    this.insurance = null;
    //console.log("HumanActionService - takeInsurance end");
    return choice;
  }

  return this;
}]);

app.filter('reverse', function() {
  return function(items){
    return items.slice().reverse();
  };
});

