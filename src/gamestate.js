
const GameState = function(game){
  this.seats = [];
  this.opts = game.opts;
  this.players = game.players;
  this._currPlayerIndex = -1;
  this.newShoeFlag = false;
  this.priorGameState = null;

  this.agentOpts = {
    decks: this.opts.deckCount,
    insurance: this.opts.insurance,
    actions: ['N','S','H','D'],
  };

  for( var p = 0; p < this.players.length; ++p){
    this.seats.push(this.players[p]);
    this.seats[p].hands = [ new HandModel() ];
  }

  game.dealer.hands = [ new HandModel() ];
  this.seats.push( game.dealer );

  this.status = 'DEALING_HANDS';

  this.consumeCard = function(card){
    player = this.nextPlayer();
    if( this.status == 'DEALING_HANDS'){
      if( this._dealHand( player, card) != null ){
        this.status = 'DELT';
      } else {
        return;
      }
    }

    if( this.status == "DELT" ){
      if( this._queryPlayers(player, card) != null ){
        // A player didn't consume the card.. update state and continue
        this.status = 'SCORE';
      } else {
        // some player consumed the card
        return;
      }
    }

    if( this.status == 'SCORE' ){
      // TODO: _clearRound should somehow wait for input.. maybe clear upon bet placement?
      if( this._clearRound() ){
        console.log("consumeCard recursion after _clearRound()");
        this.consumeCard( card );
      } else {
        this.status = 'GAMEOVER';
      }
    }
  }

  this._queryPlayers = function(player, card){
    var action = null;
    if( ! this._roundCanStart(player, card) ){
      return 'SCORE';
    }

    if( player.name == 'Dealer' ){
      var dealerHand = this._getDealerHand();
      if( this.playersRemain() && ((dealerHand.value() == 17 && dealerHand.isSoft) || dealerHand.value() < 17 ) ){
        dealerHand.addCard( card );
        return;
      } else {
        dealerHand.isFinal = true;
        this.status = 'SCORE';
        return 'SCORE';
      }
    } else {
      thisHand = this._nextHand(player);
      if( thisHand == null ){
        console.log("consumeCard recursion in _queryPlayers()");
        this.consumeCard( card );
        return;
      }
      if( thisHand.cards.length < 2 ){
        thisHand.addCard( card );
        return;
      }
      try {
        action = player.agent.nextAction( this.playerGameStateObject(), thisHand );
      } catch(e){
        console.log(player.name + " didn't return an action!");
      }
      this._handleAction( player, card, thisHand, action );
    }
  }

  this._handleAction = function( player, card, hand, action ){
    switch( action ) {
      case 'STAND':
        hand.isFinal = true;
        console.log("consumeCard recursion in STAND");
        this.consumeCard(card);
        return;
        break;
      case 'DOUBLE':
        if( hand.canDouble() ){
          hand.addCard( card );
          player.stats.doubles++;
          player.bankRoll -= hand.bet;
          hand.bet *= 2;
          hand.isFinal = true;
        } else {
          hand.addCard( card );
        }
      case 'HIT':
        hand.addCard(card);
        break;
      case 'SPLIT':
        if( ! this.newShoeFlag && hand.canSplit() ){
          player.stats.splits++;
          player.bankRoll -= hand.bet;
          var nextHand = hand.splitHand();
          nextHand.bet = hand.bet;
          player.hands.push( nextHand );
        } else {
          console.log("_handleAction recursion");
          this._handleAction( player, card, hand, null );
        }
        break;
      default:
        if( hand.value() >= 17 ){
          hand.isFinal = true;
          console.log("consumeCard recursion in default");
          this.consumeCard( card );
          return;
        } else {
          hand.addCard( card );
        }
        break;
    }
    if( hand.hasBusted() || hand.value() == 21 ){
      hand.isFinal = true;
    }
  }

  this._roundCanStart = function(player, card){
    if(
        this._currPlayerIndex == 0 &&
        player.hands[0].cards.length == 2 &&
        player.hands.length == 1
    ){
      dealerHand = this._getDealerHand();
      if( dealerHand.offerInsurance() && this.opts.enableInsurance ){
        console.log("Offering Insurance");
        for( var i = 0; i < this.seats.length-1; ++i){
          try{
            if( this.seats[i].agent.takeInsurance( this.playerGameStateObject(), this.seats[i].hands[0] ) ){
              // TODO: Account for insurance
            }
          } catch( e ){
            // agent didn't respond correctly or insurance isn't supported for agent...
            null;
          }
        }
        if( dealerHand.isBlackjack() ){
          this.status = 'SCORE';
          return false;
        } else {
          // TODO: Consume any failed insurance bets
        }
      }
    }
    return true;
  }

  this.playersRemain = function(){
    for( var i = 0; i < this.seats.length; ++i){
      var seat = this.seats[i];
      if( seat.name != 'Dealer' ){
        for( var j = 0; j < seat.hands.length; ++j){
          if( ! seat.hands[j].hasBusted() ){
            return true;
          }
        }
      }
    }
    return false;
  }

  this._clearRound = function(){
    this.priorGameState = this.playerGameStateObject();
    if( ! this.newShoeFlag ){
      this.seats.forEach( player => {
        player.hands = [ new HandModel ];
      });
      this.status = 'DEALING_HANDS';
      this._currPlayerIndex = -1;
      return true;
    } else {
      return false;
    }
  }

  this.playerGameStateObject = function() {
    var gameView = [];
    if( this.status == 'SCORE' ){
      // TODO: Score the game elseware unlike my python terminal version...
    } else {
      this.seats.forEach( (seat, idx) => {
        seat.hands.forEach( hand => {
          if( hand.cards.length > 0 ){
            if( seat.name == 'Dealer' ){
              gameView.push({
                [seat.name + "-" + idx]: {
                  name: seat.name,
                  agent: seat.agent.name,
                  hand: [ hand.cards[0] ],
                  handVal: hand.cards[0].value(),
                  score: '',
                  amt: 0,
                  bankRoll: seat.bankRoll
                }
              });
            } else {
              gameView.push({
                [seat.name + "-" + idx]: {
                  name: seat.name,
                  agent: seat.agent.name,
                  hand: hand,
                  handVal: hand.value(),
                  score: '',
                  amt: hand._bet,
                  bankRoll: seat.bankRoll
                }
              });
            }
          }
        });
      });
    }
    return gameView;
  }

  this._getDealerHand = function(){
    return this.seats[this.seats.length-1].hands[0];
  }

  this.nextPlayer = function(){
    if( this.status == 'DEALING_HANDS' ){
      this._currPlayerIndex += 1;
      if( this._currPlayerIndex >= this.seats.length ){
        this._currPlayerIndex = 0;
        return this.seats[0];
      } else {
        return this.seats[this._currPlayerIndex];
      }
    }
    thisHand = this._nextHand(this.seats[this._currPlayerIndex])
    if(thisHand == null){
      this._currPlayerIndex += 1;
    }
    if( this._currPlayerIndex >= this.seats.length ){
      this._currPlayerIndex = 0;
      return this.seats[0];
    }
    return this.seats[this._currPlayerIndex];
  }

  this._nextHand = function(player){
    for( var i = 0; i < player.hands.length; ++i){
      var thisHand = player.hands[i];
      if( thisHand.isFinal || thisHand.hasBusted() ){
        null; // next/pass
      } else {
        return thisHand;
      }
    }
    return null;
  }

  this._dealHand = function( player, card ){
    thisHand = player.hands[0];
    if( this._currPlayerIndex == 0 && thisHand.cards.length == 0 ){
      this._takeBets();
      console.log("Dealing...");
    }

    if( this._currPlayerIndex == 0 && thisHand.cards.length == 2 ){
      this.status = "DELT";
    } else {
      thisHand.addCard( card );
      return null;
    }
  }

  this._takeBets = function(){
    for( var i = 0; i < this.seats.length; ++i){
      var seat = this.seats[i];
      if( seat.name != 'Dealer' ){
        for( var j = 0; j < seat.hands.length; ++j){
          if( seat.name != 'Dealer' ){
            try {
              var pBet = seat.agent.placeBet( this.priorGameState );
              seat.hands[j].bet = pBet;
              seat.bankRoll -= pBet;
            } catch ( e ){
              console.log( "Player: " + seat.name + " didn't bet!" );
              seat.hands[j].bet = this.opts.minBet;
              seat.bankRoll -= this.opts.minBet;
            }
          }
        }
      }
    }

  }

}

