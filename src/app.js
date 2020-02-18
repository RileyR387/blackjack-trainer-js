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
  this.needsReseat = false;

  $scope.navbar               = new NavbarModel();
  $scope.gameSettingsDialog   = new GameSettingsDialogModel(this, $scope.navbar);
  $scope.playerSettingsDialog = new PlayerSettingsDialogModel(this, $scope.navbar);

  this.shuffleShoe = async function() {
    if( this.CanShuffle() ){
      console.log("Shuffling shoe...");
      await this.clearAllBets();
      this.card = null;
      this.cardConsumed = true;
      this.shoe = new ShoeModel( this.game.opts.deckCount );
      this.gameState = new GameState( this.game, this.applyScope );
      $scope.$applyAsync();
    }
  }

  this.reseat = async function() {
    if( this.CanReseat() && this.needsReseat){
      this.gameState.seats = [];
      for( var p = 0; p < this.game.players.length; ++p){
        this.gameState.seats.push(this.game.players[p]);
      }
      this.gameState.seats.push( this.game.dealer );
      this.needsReseat = false;
    }
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
      //console.log( "Delt: " + card.toString() + " used: " + this.cardConsumed + " Status: " + this.gameState.status);
      //$scope.$applyAsync();
      if( this.gameState.status != 'Score' && this.gameState.status != 'Game Over' ){
        $scope.$apply();
        await sleep( Math.round(this.game.opts.dealRate * 1000) );
      }
    }
    if( this.gameState.status == 'Score' && this.gameState.newShoeFlag ){
      this.gameState.status = 'Game Over';
    }
    this.gameState.priorGameState = this.gameState.ScoreRound();
    $scope.$applyAsync();
    await sleep( Math.round(this.game.opts.dealRate * 1000) );
  }

  this.endRound = async function(){
    if( this.gameState.status == 'Game Over' ){
      await this.shuffleShoe();
    } else if( this.gameState.status == 'Score' || this.gameState.status == 'New Game'){
      await this.reseat();
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
    if( finalBet != 0  && finalBet >= this.game.opts.minBet){
      HumanActionService.tempBet = 0;
      HumanActionService.bet = finalBet;
    }
    if( currPlayer.lastBet != 0 ){
      currPlayer.bankRoll -= currPlayer.lastBet;
      currPlayer.hands[0].bet = currPlayer.lastBet;
      HumanActionService.bet = currPlayer.lastBet;
    } else if( finalBet == 0 && currPlayer.lastBet == 0 ) {
      currPlayer.bankRoll -= this.game.opts.minBet;
      currPlayer.hands[0].bet = this.game.opts.minBet;
      HumanActionService.bet = this.game.opts.minBet;
    }
  }

  this.clearAllBets = async function(){
    if( this.gameState.status == 'Taking Bets'){
      this.gameState.seats.forEach(seat => {
        if( seat.isHuman ){
          seat.bankRoll += HumanActionService.tempBet;
          seat.lastBet = 0;
          HumanActionService.tempBet = 0;
          seat.hands[0].bet = HumanActionService.tempBet;
        } else {
          seat.bankRoll += seat.hands[0].bet;
          seat.hands[0].bet = 0;
        }
      });
    }
  }
  this.halfBetRoundDown = function(betAmt){
    return this.roundBetDown(betAmt/2);
  }
  this.roundBetDown = function(betAmt){
    var tmpBet = betAmt;
    tmpBet -= betAmt%5;
    return tmpBet;
  }
  this.canHalfBet = function(betAmt){
    return (this.halfBetRoundDown(betAmt) > this.game.opts.minBet);
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
    await $scope.$applyAsync();
  }
  this.minBet = async function(){
    this.endRound();
    var currPlayer = this.gameState.getCurrentPlayer();
    while( ! currPlayer.isHuman ){
      await sleep( this.game.opts.dealRate * 1001 );
      currPlayer = this.gameState.getCurrentPlayer();
    }
    if( HumanActionService.tempBet > 0 ){
      currPlayer.bankRoll += HumanActionService.tempBet;
    }
    HumanActionService.tempBet = this.game.opts.minBet;
    currPlayer.bankRoll -= this.game.opts.minBet;
    currPlayer.hands[0].bet = HumanActionService.tempBet;
    currPlayer.lastBet = 0;
    this.deal();
    return;
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

  this.showBetActions = function(){
    return (/^((Taking Bets)|(Score)|(New Game))$/).test(this.gameState.status);
  }

  this.CanShuffle = function(){
    return (/^((Taking Bets)|(Score)|(New Game)|(Game Over))$/).test(this.gameState.status);
  }
  this.CanReseat = function(){
    return (/^((Score)|(New Game)|(Game Over))$/).test(this.gameState.status);
  }

  this.ShoeLength = function(){
    if( this.gameState.status == 'New Game'){
      return this.shoe._shoe.length;
    }
    return this.shoe._shoe.length+1;
  }

  this.isActivePlayer = function(player){
    if( player === this.gameState.getCurrentPlayer() && this.gameState.status != 'New Game'){
      return true;
    }
    if( player.isHuman && this.gameState.status == 'New Game'){
      return true;
    }
    return false;
  }

  //this.dealRound(); // Doesn't play nice with dk count changes.. maybe..
  //$scope.gameSettingsDialog.open();
  //$scope.navbar.expand();
  //$scope.playerSettingsDialog.open();
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

