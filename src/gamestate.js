
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
    this.seats[p].hands.push( new HandModel() );
  }

  game.dealer.hands.push( new HandModel() );
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
    /*
        if self.status == "DELT":
            if self._queryPlayers( player, card) is not None:
                self.status = 'SCORE'
                pass
            else:
                return

        if self.status == "SCORE":
            self.printGameTable()
            #input()
            if self._clearRound():
                self.consumeCard( card )
                return
            else:
                print("Game over!")
                self.status = 'GAMEOVER'
    */

  };

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
  };

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
  };

  this._dealHand = function( player, card ){
    thisHand = player.hands[0];
    if( this._currPlayerIndex == 0 && thisHand.cards.length == 0 ){
      // TODO: write _takeBets()
      //this._takeBets();
      console.log("Dealing...");
    }

    if( this._currPlayerIndex == 0 && thisHand.cards.length == 2 ){
      this.status = "DELT";
    } else {
      thisHand.addCard( card );
      return null;
    }
  };

}

