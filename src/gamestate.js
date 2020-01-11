
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

  this.status = 'Dealing Hands';

  this.getCurrentPlayer = function(){
    if( this._currPlayerIndex < 0 || this._currPlayerIndex >= this.seats.length ){
      return this.seats[0];
    }
    return this.seats[this._currPlayerIndex];
  }

  this.getCurrentHand = function(){
    var currPlayer = this.getCurrentPlayer();
    for( i = 0; i < currPlayer.hands.length; ++i){
      if( !currPlayer.hands[i].isFinal ){
        return currPlayer.hands[i];
      }
    }
  }

  this.consumeCard = async function(card){
    player = this.nextPlayer();

    if( this.status == 'Dealing Hands'){
      if( await this._dealHand( player, card) != null ){
        this.status = 'Delt';
      } else {
        return;
      }
    }

    if( this.status == "Delt" ){
      if( await this._queryPlayers(player, card) != null ){
        // A player didn't consume the card.. update state and continue
        this.status = 'Score';
      } else {
        // some player consumed the card
        return;
      }
    }

    if( this.status == 'Score' ){
      this.priorGameState = this.ScoreRound();
      if( this.newShoeFlag ){
        this.status = 'Game Over';
      }
    }
  }

  this._queryPlayers = async function(player, card){
    var action = null;
    if( ! this._roundCanStart(player, card) ){
      return 'Score';
    }

    if( player.name == 'Dealer' ){
      var dealerHand = this._getDealerHand();
      if( this.playersRemain() && (dealerHand.value() < 17 || (dealerHand.value() == 17 && dealerHand.isSoft) ) ){
        dealerHand.addCard( card );
        return;
      } else {
        dealerHand.isFinal = true;
        this.status = 'Score';
        return 'Score';
      }
    } else {
      thisHand = this._nextHand(player);
      if( thisHand == null ){
        this.consumeCard( card );
        return;
      }
      if( thisHand.cards.length < 2 ){
        thisHand.addCard( card );
        return;
      }
      try {
        action = await player.agent.nextAction( this.GameSnapshot(), thisHand );
      } catch(e){
        console.log(player.name + " didn't return an action!");
      }
      this._handleAction( player, card, thisHand, action );
    }
  }

  this._handleAction = async function( player, card, hand, action ){
    switch( action ) {
      case 'STAND':
        hand.isFinal = true;
        this.consumeCard( card );
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
        break;
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

  this._roundCanStart = async function(player, card){
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
            if( await this.seats[i].agent.takeInsurance( this.GameSnapshot(), this.seats[i].hands[0] ) ){
              // TODO: Account for insurance
            }
          } catch( e ){
            // agent didn't respond correctly or insurance isn't supported for agent...
            null;
          }
        }
        if( dealerHand.isBlackjack() ){
          this.status = 'Score';
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

  this.clearRound = async function(){
    this.priorGameState = this.GameSnapshot();
    if( ! this.newShoeFlag ){
      this.seats.forEach( player => {
        player.hands = [ new HandModel ];
      });
      this.status = 'Dealing Hands';
      this._currPlayerIndex = -1;
      return true;
    } else {
      return false;
    }
  }

  this.GameSnapshot = function(){
    if( this.status == 'Score' ){
      return this.ScoreRound();
    } else {
      var gameView = [];
      this.seats.forEach( (seat, idx) => {
        seat.hands.forEach( hand => {
          if( hand.cards.length > 0 ){
            if( seat.name == 'Dealer' ){
              gameView.push({
                [seat.name + "-" + idx]: {
                  name: seat.name,
                  //agent: seat.agent.name, // FIXME
                  agent: seat.name,
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
                  //agent: seat.agent.name, // FIXME
                  agent: seat.name,
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
      return gameView;
    }
  }

  this.ScoreRound = function() {
    var gameView = [];
    dealer = this._getDealerHand();

    if( dealer.offerInsurance() && dealer.isBlackjack() ){
      this.seats.forEach( (seat, idx) => {
        seat.roundsPlayed++;
        seat.hands.forEach( hand => {
          seat.handsPlayed++;
          if( seat.name != 'Dealer' ){
            if( hand.insured ){
              hand.result = ScoreModel.insured;
              seat.bankRoll += hand.bet;
              seat.bankRoll += (hand.bet/2);
              hand.bet = 0;
            } else if( hand.isBlackjack() ){
              hand.result = ScoreModel.push;
              this._getDealer().stats.pushes++;
              seat.stats.pushes++;
              seat.bankRoll += hand.bet;
              hand.bet = 0;
            } else {
              hand.change = 0-hand.bet;
              hand.bet = 0;
              hand.result = ScoreModel.lose;
              seat.stats.loses++;
              this._getDealer().stats.wins++;
              this._getDealer().bankRoll += hand.bet;
              this._getDealer().stats.loses++;
            }
          }
          gameView.push({
            [seat.name + "-" + idx]: {
              name: seat.name,
              //agent: seat.agent.name || seat.name,
              agent: seat.name,
              hand: hand,
              handVal: hand.value(),
              score: hand.result,
              amt: hand._bet,
              bankRoll: seat.bankRoll
            }
          });
        });
      });
    } else {
      this.seats.forEach( (seat, idx) => {
        seat.roundsPlayed++;
        seat.hands.forEach( hand => {
          seat.handsPlayed++;
          var startBalance = seat.bankRoll;
          // Blackjack
          if(
              hand.value() == 21 && hand.cards.length == 2 &&
              (
                (dealer.value() != 21 || seat.name == 'Dealer' ) ||
                (dealer.value() == 21 && seat.name != 'Dealer' && dealer.cards.length > 2)
              )
          ){
            hand.result = ScoreModel.blackjack;
            seat.stats.bjs++;
            seat.stats.wins++;
            var win = Math.round((hand.bet * parseFloat(this.opts.payout)) + hand.bet, 2);
            hand.change = Math.round((hand.bet * parseFloat(this.opts.payout)), 2);
            seat.bankRoll              += win;
            if(seat.name != 'Dealer'){
              this._getDealer().bankRoll -= win;
              this._getDealer().stats.loses++;
            } else {
              console.log("Dealer Blackjack!");
            }
          } else if( seat.name == 'Dealer' ){
            if( ! hand.hasBusted() ){
              if( ! this.playersRemain() ){
                hand.result = ScoreModel.win;
                seat.stats.wins++;
              } else {
                hand.result = null;
              }
            } else {
              hand.result = ScoreModel.bust;
              seat.stats.loses++;
            }
          } else if( hand.value() > 21 ){
            hand.result = ScoreModel.bust;
            seat.stats.busts++;
            hand.change = 0-hand.bet;
            this._getDealer().bankRoll += hand.bet;
            hand.bet = 0;
          } else if(
            (dealer.value() > 21 && hand.value() < 22)
            ||
            (hand.value() < 22 && hand.value() > dealer.value() )
          ){
            hand.result = ScoreModel.win;
            seat.stats.wins++;
            var win = Math.round(hand.bet * 2, 2);
            hand.change = hand.bet;
            seat.bankRoll += win;
            this._getDealer().bankRoll -= win;
            this._getDealer().stats.loses++;
            hand.bet = 0;
          } else if( hand.value() < 22 && hand.value() == dealer.value() ){
            hand.result = ScoreModel.push;
            this._getDealer().stats.pushes++;
            seat.stats.pushes++;
            seat.bankRoll += hand.bet;
            hand.bet = 0;
          } else if( hand.value() < 22 && hand.value() < dealer.value() ){
            hand.result = ScoreModel.lose;
            seat.stats.loses++;
            hand.change = 0-hand.bet;
            this._getDealer().stats.wins++;
            this._getDealer().bankRoll += hand.bet;
            hand.bet = 0;
          }

          gameView.push({
            [seat.name + "-" + idx]: {
              name: seat.name,
              //agent: seat.agent.name || seat.name,
              agent: seat.name,
              hand: hand,
              handVal: hand.value(),
              score: hand.result,
              amt: hand._bet,
              bankRoll: seat.bankRoll
            }
          });

        });
      });
    }
    return gameView;
  }

  this._getDealerHand = function(){
    return this.seats[this.seats.length-1].hands[0];
  }
  this._getDealer = function(){
    return this.seats[this.seats.length-1];
  }

  this.nextPlayer = function(){
    if( this.status == 'Dealing Hands' ){
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

  this._dealHand = async function( player, card ){
    thisHand = player.hands[0];
    if( this._currPlayerIndex == 0 && thisHand.cards.length == 0 ){
      await this._takeBets();
      console.log("Dealing...");
    }

    if( this._currPlayerIndex == 0 && thisHand.cards.length == 2 ){
      this.status = "Delt";
    } else {
      thisHand.addCard( card );
      return null;
    }
  }

  this._takeBets = async function(){
    this.status = 'Taking Bets';
    for( this._currPlayerIndex = 0; this._currPlayerIndex < this.seats.length; ++this._currPlayerIndex){
      var seat = this.seats[this._currPlayerIndex];
      if( seat.name != 'Dealer' ){
        for( var j = 0; j < seat.hands.length; ++j){
          if( seat.name != 'Dealer' ){
            try {
              var pBet = await seat.agent.placeBet( this.priorGameState );
              if( ! seat.isHuman ){
                seat.hands[j].bet = pBet;
                seat.bankRoll -= pBet;
              }
              seat.lastBet = seat.hands[j].bet;
            } catch ( e ){
              console.log( "Player: " + seat.name + " didn't bet!" );
              seat.hands[j].bet = this.opts.minBet;
              seat.bankRoll -= this.opts.minBet;
            }
          }
        }
      }
    }
    this._currPlayerIndex = 0;
    this.status = 'Dealing Hands';
  }

}

