
var CardModel = function(){
  this.rank = '';
  this.suit = '';
  this.value = function(){
    if( IsNumeric(this.rank) ){
      return parseInt(this.rank);
    } else if( this.rank == 'A' ){
      return 11;
    }
    return 10;
  }
}

var HandModel = function(){
  this.cards = [];
  this.isSoft = false;
  this.nextHand = null;
  this.isFinal = false;
  this.wasSplitAces = false;
  this._canHit = true;
  this._canDouble = true;
  this.bet = 0;

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
    return this.isFinal;
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
    if( this.cards.length == 2 && cards[0].value() == cards[1].value() ){
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
    if( cards[0].value() == 1 && cards.length == 2 ){
      return true;
    }
    return false;
  }

  /**
   * maybe this should be handled differently... TBD
   */
  this.dealerHand = function(){
    dHand = new HandModel();
    dHand.addCard(cards[0]);
    dHand.addCard(new Card(null, null, true) );
    return dHand;
  }

  this.value = function(){
    var x = 0;
    var aceCount = 0;
    this.isSoft = false;
    for( i = 0; i < this.cards.length; ++i){
      var cVal = this.cards[i].value();
      if( cVal == 11 ){
        cVal = 0;
        aceCount++;
      }
      x += cVal;
    }

    while( aceCount > 0 ){
      if( x== 10 && aceCount == 1){
        this.isSoft == true;
        x += 11;
      } else if( x > 10-aceCount ){
        x += 1;
      } else {
        this.isSoft == true;
        x += 11;
      }
      aceCount--;
    }
    return x;
  }

}

var PlayerModel = function(name, agent, bankRoll) {
  this.name  = name;
  this.hands = [];
  this.agent = agent;
  this.bankRoll = bankRoll;
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
}

var GameSettingsDialogModel = function() {
  this.opts = {};
  this.visible = false;
  this.incDeckCount = function() { this.opts.deckCount++; };
  this.decDeckCount = function() { this.opts.deckCount--; };
  this.incDealRate  = function() { this.opts.dealRate += 0.1; };
  this.decDealRate  = function() { if( this.opts.dealRate > 0.01) {this.opts.dealRate -= 0.1; }};
  this.open = function(opts) {
    this.opts = opts;
    this.visible = true;
  };
  this.close = function() {
    this.visible = false;
  };
};

var PlayerSettingsDialogModel = function() {
  this.players = [];
  this.visible = false;
  this.open = function(players) {
    this.players = players;
    this.visible = true;
  };
  this.close = function() {
    this.visible = false;
  };
};

