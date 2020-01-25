
const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

var global;
try {
  global = Function('return this')() || (42, eval)('this');
} catch(e) {
  global = window;
}

const CardModel = function(rank, suit){
  this.rank = rank;
  this.suit = suit;
  this.clone = function( card ){
    this.rank = card.rank;
    this.suit = card.suit;
    return this;
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

  this.rigInsuranceShoe = function(){
    console.log( "Rigging shoe for insurance");
    var aceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(11, 50);
    console.log( this._shoe[aceIndex] );
    this._swap( 4, aceIndex );
    console.log( this._shoe[4] );
    console.log( this._shoe[9] );
  }

  this.rigSoftSevenTeen = function(){
    console.log( "Rigging shoe for deal soft 17");
    var aceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(11, 50);
    console.log( this._shoe[aceIndex] );
    this._swap( 4, aceIndex );
    var sixIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(6, 50);
    console.log( this._shoe[aceIndex] );
    this._swap( 9, sixIndex );
    console.log( this._shoe[4] );
    console.log( this._shoe[9] );
  }

  this.rigBlackjacks = function(){
    console.log( "Rigging Blackjack shoe");
    var aceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(11, 50);
    var faceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50);
    this._swap( 0, faceIndex );
    this._swap( 5, aceIndex );
    aceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(11, 50);
    faceIndex = this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50);
    this._swap( 1, faceIndex );
    this._swap( 6, aceIndex );
    console.log( this._shoe[1] );
    console.log( this._shoe[6] );
  }

  this.rigLowDealer = function(){
    console.log( "Rigging Dealer 2's");
    this._swap( 4, this._shoe.map(function(e){ return e.value(); }).indexOf(2, 50) );
    this._swap( 9, this._shoe.map(function(e){ return e.value(); }).indexOf(2, 50) );
    console.log( "Rigging Player 10's");
    this._swap( 0, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 1, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 2, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 3, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 5, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 6, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 7, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 8, this._shoe.map(function(e){ return e.value(); }).indexOf(10, 50) );
    this._swap( 10, this._shoe.map(function(e){ return e.value(); }).indexOf(2, 50) );
  }


  this._swap = function(i,j){
    var t = this._shoe[i];
    this._shoe[i] = this._shoe[j];
    this._shoe[j] = t;
  }

  this.shuffle();
  this.rigLowDealer();
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
    // try to allow allow aces to re-split... How to prevent the option to hit though... hrmmm
    if( this.wasSplitAces && card.value == 11 ){
      this.wasSplitAces = false;
      this._canHit = false;
      this._canDouble = false;
    }

    this.cards.push( card );
    if( this.value() >= 21 || this.wasSplitAces){
      this.isFinal = true;
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

  this.canDouble = function(){
    // FIXME: prevent double after split aces?
    return (this.cards.length == 2 ? true : false );
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
  this.incDeckCount = function() { if( this.bjg.game.opts.deckCount < 12){ this.bjg.game.opts.deckCount++;}};
  this.decDeckCount = function() { if( this.bjg.game.opts.deckCount > 1 ){ this.bjg.game.opts.deckCount--;}};
  this.incDealRate  = function() { this.bjg.game.opts.dealRate += 0.1; };
  this.decDealRate  = function() { if( this.bjg.game.opts.dealRate > 0.01) {this.bjg.game.opts.dealRate -= 0.1; }};
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

