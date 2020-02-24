/**!
 * https://github.com/RileyR387/blackjack-trainer-js
 * Author: Riley Raschke <rileyATrrappsdevDOTcom>
 * © 2020 rrappsdev.com
 * License OSL-3.0
 */

const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

jQuery(function () {
  jQuery('[data-toggle="popover"]').popover()
})

jQuery(function () {
  jQuery('[data-toggle="tooltip"]').tooltip()
})

var copyBtns = new ClipboardJS('.clipboard-btn');

copyBtns.on('success', function(e) {
  jQuery(e.trigger).popover('show');
});

const HiLoCounter = function(deckCount){
  this.deckCount = deckCount;

  this.count = 0;
  this.cardsSeen = 0;

  this.cachedDealercard = null;

  this.countCard = function(card){
    var cardVal = card.value();
    this.cardsSeen++;
    if( [2,3,4,5,6].indexOf( cardVal ) >= 0 ){
      this.count += 1;
      return;
    }
    if( [10,11].indexOf( cardVal ) >= 0 ){
      this.count -= 1;
    }
  };

  this.cacheCard = function(card){
    this.cachedDealercard = card;
  }

  this.countScoredCard = function(){
    this.countCard( this.cachedDealercard );
    this.cachedDealercard = null;
  }

  this.trueCount = function(){
    if( this.cardsSeen == 0 ){ return 0; }
    if( this.deckCount == 1 ){
      var decksRemain = (((this.deckCount * 52) - this.cardsSeen )/52);
      if( decksRemain <= 1 ){
        return this.count;
      }
      return this.count / decksRemain;
    }
    return this.count / Math.round(((this.deckCount * 52) - this.cardsSeen )/52);
  };
}

const CardModel = function(rank, suit){
  this.rank = rank;
  this.suit = suit;
  this.clone = function( card ){
    this.rank = card.rank;
    this.suit = card.suit;
    return this;
  }
  this.toString = function(){
    if( this.rank == '10'){
      return this.rank + this.suit;
    } else {
      return ' ' + this.rank + this.suit;
    }
  }
  this.value = function(){
    if( jQuery.isNumeric(this.rank) ){
      return parseInt(this.rank);
    } else if( this.rank == 'A' ){
      return 11;
    }
    return 10;
  }
}

const DeckModel = function(){
  ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  suits = ["♣","♠","♦","♥"];
  deck = [];
  for(i = 0; i < suits.length; ++i){
    for(j = 0; j < ranks.length; ++j){
      deck.push( new CardModel( ranks[j], suits[i] ) );
    }
  }
  return deck;
}

const ShoeModel = function(decks){
  this._shoe = [];
  this.decks = decks;
  this.sentShuffleNotice = false;
  this.needsShuffle = false;
  this._shuffleAtDecks = 1.5;

  for(var i = 0; i < this.decks; ++i){
    Array.prototype.push.apply(this._shoe, new DeckModel());
  }

  this.shuffle = function(){
    var j, x, i;
    for( i = this._shoe.length-1; i > 0; i--){
      j = Math.floor(Math.random() * (i + 1));
      x = this._shoe[i];
      this._shoe[i] = this._shoe[j];
      this._shoe[j] = x;
    }
    console.log("Shoe shuffled");
  }

  this.nextCard = function(){
    if( this.sentShuffleNotice ||
        (this.decks < 4 && this._shoe.length > this.decks*52*0.3) ||
        (this.decks > 3 && this._shoe.length > 52 * this._shuffleAtDecks )
      ){
      return this._shoe.shift();
    } else {
      this.sentShuffleNotice = true;
      throw new ShuffleShoeException();
    }
  }
  /**
   * Rigged decks for testing.
   */
  this._swap = function(i,j){
    var t = this._shoe[i];
    this._shoe[i] = this._shoe[j];
    this._shoe[j] = t;
  }
  this._rig = function( cardPos, targetCard ){
    this._swap( cardPos, this._shoe.map(function(e){ return e.value(); }).indexOf(targetCard, 50) );
  }
  this.rigInsuranceShoe = function(){
    console.log( "Rigging shoe for insurance");
    this._rig( 4, 11 );
    console.log( this._shoe[4] );
    console.log( this._shoe[9] );
  }
  this.rigSoftSevenTeen = function(){
    console.log( "Rigging shoe for deal soft 17");
    console.log( this._shoe[aceIndex] );
    this._rig( 4, 11 );
    this._rig( 9, 6 );
    console.log( this._shoe[4] );
    console.log( this._shoe[9] );
  }
  this.rigBlackjacks = function(){
    console.log( "Rigging Blackjack shoe");
    var aceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(11, 50);
    var faceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50);
    this._rig( 0, 10 );
    this._rig( 5, 11 );
    aceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(11, 50);
    faceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50);
    this._rig( 1, 10 );
    this._rig( 6, 11 );
    console.log( this._shoe[1] );
    console.log( this._shoe[6] );
  }
  this.rigLowDealer = function(){
    console.log( "Rigging Dealer 2's");
    this._rig( 4, 2);
    this._rig( 9, 2);
    console.log( "Rigging Player 10's");
    this._rig( 0, 10);
    this._rig( 1, 10);
    this._rig( 2, 10);
    this._rig( 3, 10);
    this._rig( 5, 10);
    this._rig( 6, 10);
    this._rig( 7, 10);
    this._rig( 8, 10);
    this._rig( 10, 2);
  }
  this.rigDoubleSplitAces = function(){
    console.log( "Rigging Dealer 2's");
    this._rig( 4, 2);
    this._rig( 9, 2);
    console.log( "Rigging Player 10's");
    this._rig( 0, 11);
    this._rig( 1, 10);
    this._rig( 2, 10);
    this._rig( 3, 10);
    this._rig( 5, 11);
    this._rig( 6, 10);
    this._rig( 7, 10);
    this._rig( 8, 10);
    this._rig( 10, 11);
    this._rig( 11, 9);
    this._rig( 12, 10);
  }
  this.rigDealer21PlayerBj = function(){
    console.log( "Rigging Dealer 10 5 5");
    this._rig( 4, 10);
    this._rig( 9, 5);
    this._rig( 10, 6);
    console.log( "Rigging Player 10's");
    this._rig( 0, 11);
    this._rig( 1, 10);
    this._rig( 2, 10);
    this._rig( 3, 10);
    this._rig( 5, 10);
    this._rig( 6, 10);
    this._rig( 7, 10);
    this._rig( 8, 10);
  }
  this.rigDealerBjPlayer21 = function(){
    console.log( "Rigging Dealer 10 5 5");
    this._rig( 4, 10);
    this._rig( 9, 11);
    console.log( "Rigging Player 10's");
    this._rig( 0, 5);
    this._rig( 1, 10);
    this._rig( 2, 10);
    this._rig( 3, 10);
    this._rig( 5, 10);
    this._rig( 6, 10);
    this._rig( 7, 10);
    this._rig( 8, 10);
    this._rig( 10, 6);
  }
  this.rigDealerBjPlayerBjNoInsur = function(){
    console.log( "Rigging Dealer 10 A");
    this._rig( 4, 10);
    this._rig( 9, 11);
    console.log( "Rigging Seat1 BJ");
    this._rig( 0, 11);
    this._rig( 5, 10);
    console.log( "Other seats 20");
    this._rig( 1, 10);
    this._rig( 2, 10);
    this._rig( 3, 10);
    this._rig( 6, 10);
    this._rig( 7, 10);
    this._rig( 8, 10);
    this._rig( 10, 6);
  }
  this.rigDealerBjPlayerBjInsur = function(){
    console.log( "Rigging Dealer 10 A");
    this._rig( 4, 11);
    this._rig( 9, 10);
    console.log( "Rigging Player 10's");
    this._rig( 0, 11);
    this._rig( 5, 10);
    console.log( "Other seats 20");
    this._rig( 1, 10);
    this._rig( 2, 10);
    this._rig( 3, 10);
    this._rig( 6, 10);
    this._rig( 7, 10);
    this._rig( 8, 10);
    this._rig( 10, 6);
  }
  this.rigMultiSplit = function(){
    console.log( "Rigging Player 10's");
    this._rig( 0, 10);
    this._rig( 5, 10);
    console.log( "Split as much as ya want!");
    this._rig( 10, 10);
    this._rig( 11, 10);
    this._rig( 12, 10);
    this._rig( 13, 10);
    this._rig( 14, 10);
    this._rig( 15, 10);
    this._rig( 16, 11);
  }
  this.shuffle();
}

const HandModel = function(){
  this.cards = [];
  this.isSoft = false;
  this.nextHand = null;
  this.isFinal = false;
  this.wasSplitAces = false;
  this._canHit = true;
  this._canDouble = true;
  this._didDouble = false;
  this.result = null;
  this.currentHand = false;
  this.bet = 0;
  this.insured = false;

  this.clone = function(hand){
    this.cards = [];
    hand.cards.forEach(card => {
      this.cards.push( new CardModel().clone( card ));
    });
    this.isSoft = hand.isSoft;
    this.nextHand = null;
    this.isFinal = hand.isFinal;
    this.wasSplitAces = hand.wasSplitAces;
    this._canHit = hand._canHit;
    this._canDouble = hand._canDouble;
    this._didDouble = hand._didDouble;
    this.result = hand.result;
    this.currentHand = hand.currentHand;
    this.bet = hand.bet;
    this.insured = hand.insured;
    return this;
  }
  this.addCard = function(card){
    // allow allow aces to re-split
    if( this.wasSplitAces && card.value() == 11 ){
      this.wasSplitAces = false;
      this._canHit = false;
      this._canDouble = false;
      this.cards.push( card );
    } else {
      this.cards.push( card );
      if( this.value() >= 21 || this.wasSplitAces){
        this.isFinal = true;
      }
    }
    return this;
  }

  this.hasBusted = function(){
    return (this.value() > 21 ? true : false);
  }

  this.isBlackjack = function(){
    if( this.value() == 21 && this.cards.length == 2 ){
      return true;
    }
    return false;
  }

  this.canSplit = function(){
    if( this.cards.length == 2 && this.cards[0].value() == this.cards[1].value() ){
      return true;
    }
    return false;
  }

  this.canHit = function(){
    return this._canHit;
  }

  this.canDouble = function(){
    return ((this._canDouble && this.cards.length == 2) ? true : false );
  }

  this.splitHand = function(){
    if( this.canSplit() ){
      if( this.cards[0].value() == 11 ){
        this.wasSplitAces = true;
      }
      this.nextHand = new HandModel();
      this.nextHand.addCard( this.cards.pop() );
      this.nextHand.wasSplitAces = this.wasSplitAces;
      return this.nextHand;
    }
    return null;
  }

  this.offerInsurance = function(){
    if( this.cards[0].value() == 11 && this.cards.length == 2 ){
      return true;
    }
    return false;
  }

  /**
   * maybe this should be handled differently... TBD
   */
  this.dealerHand = function(){
    dHand = new HandModel();
    dHand.addCard(this.cards[0]);
    dHand.addCard(new Card(null, null, true) );
    return dHand;
  }

  this.value = function(){
    var x = 0;
    var aceCount = 0;
    var maybeSoft = false;

    for( i = 0; i < this.cards.length; ++i){
      var cVal = this.cards[i].value();
      if( cVal == 11 ){
        cVal = 0;
        aceCount++;
      }
      x += cVal;
    }

    while( aceCount > 0 ){
      if( x == 10 && aceCount == 1){
        maybeSoft = true;
        x += 11;
      } else if( x > 10-aceCount ){
        x += 1;
      } else {
        maybeSoft = true;
        x += 11;
      }
      aceCount--;
    }
    this.isSoft = maybeSoft;
    return x;
  }
}

const PlayerModel = function(name, agent, bankRoll, isHuman) {
  this.name  = name;
  this.isHuman = false || isHuman;
  this.hands = [];
  this.agent = agent;
  this.bankRoll = bankRoll;
  this.winStreak = 0;
  this.lossStreak = 0;
  this.lastBet = 0;
  this.currPlayer = false;
  this.change = 0;
  this.roundsPlayed = 0;
  this.handsPlayed = 0;
  this.stats = {
     'bjs': 0,
     'wins': 0,
     'splits': 0,
     'doubles': 0,
     'pushes': 0,
     'loses': 0,
     'busts': 0,
  };
  if( this.agent != null ){
    this.agent.name = name;
  }
}

const AgentModel = function(gameOpts) {

  this.deckCount = gameOpts.deckCount;
  this.minBet    = gameOpts.minBet;
  this.name = '';

  this.myHands = function( gameState ){
    var hands = [];
    gameState.forEach( playerHand => {
      if( playerHand.name == this.name ){
        hands.push( playerHand.hand );
      }
    });
    return hands;
  }

  this.dealerHand = function( gameState ){
    return gameState[gameState.length-1].hand;
  }

  /*
  this.placeBet      = function (priorGameSnapshot){}
  this.nextAction    = function (gameSnapshot){}
  this.takeInsurance = function (gameSnapshot){}
  */
}

const ScoreModel = {
  insured: '-Insured-',
  blackjack: '*!BlackJack!*',
  win: 'Win',
  push: 'Pushed',
  bust: 'Busted',
  lose: 'Lost',
};

const GameSettingsDialogModel = function(bjg, nav) {
  this.bjg = bjg;
  this.nav = nav;
  this.visible = false;
  this.incDeckCount = function() {
    if( this.bjg.game.opts.deckCount < 12 && this.bjg.game.opts.deckCount != 1){ this.bjg.game.opts.deckCount += 2;}
    if( this.bjg.game.opts.deckCount == 1){ this.bjg.game.opts.deckCount++;}
    if( this.bjg.game.opts.deckCount %2 == 1 ){
      this.bjg.game.opts.deckCount++;
    }
  };
  this.decDeckCount = function() {
    if( this.bjg.game.opts.deckCount > 1 ){ this.bjg.game.opts.deckCount--;}
    if( this.bjg.game.opts.deckCount%2 == 1 && this.bjg.game.opts.deckCount > 2){
      this.bjg.game.opts.deckCount--;
    }
  };
  this.incDealRate  = function() { this.bjg.game.opts.dealRate += 0.05; };
  this.decDealRate  = function() { if( this.bjg.game.opts.dealRate > 0.01) {this.bjg.game.opts.dealRate -= 0.05; }};
  this.open = function() {
    this.visible = true;
  };
  this.close = function() {
    this.visible = false;
  };
};

const PlayerSettingsDialogModel = function(bjg, nav) {
  this.bjg = bjg;
  this.nav = nav;
  this.visible = false;
  this.open = function() {
    this.visible = true;
  };
  this.close = function() {
    this.visible = false;
  };
};

const NavbarModel = function() {
  this.collapsed = true;
  this.expand = function() {
    this.collapsed = false;
  };
  this.collapse = function() {
    this.collapsed = true;
  };
};

