
class HiLo extends AgentModel {

  constructor( gameOpts, hiloCounter ){
    super(gameOpts)
    this.name = this.constructor.name;
    console.log(this.name + " - Loaded");
    this.winStreak = 0;
    this.lossStreak = 0;
    this.splitEnabled = true;
    this.lastBet = 0;
    this.counter = hiloCounter;
    this.betProgression = [3,2,3,4,5,6,7,8,9,10,5,7,10,15,10,15,20,15,20,25,20,25,30,25,30];
  }

  async placeBet(gameState){
    if( gameState == null || gameState == '' ){
      //console.log(this.name + " No GameState - returning minBet + minUnit");
      this.lastBet = this.minBet + this.minUnit;
      return this.minBet + this.minUnit;
    }

    var lossFound = false;
    this.myHands(gameState).forEach( hand => {
      //console.log( hand );
      if( hand.result == ScoreModel.blackjack || hand.result == ScoreModel.win ){
        this.lossStreak = 0;
        this.winStreak++;
        //console.log( 'win increment' );
      } else if( hand.result == ScoreModel.push ){
        //console.log( 'push - no increment' );
      } else {
        lossFound = true;
        if( this.winStreak > 5 ){
          this.winStreak -= 3;
        } else {
          this.winStreak = 0;
        }
        //console.log( 'loss increment' );
        this.lossStreak++;
      }
    });

    var myBet = 0;
    //console.log( "WinStreak: " + this.winStreak );
    //console.log( "LossStreak: " + this.lossStreak );

    if( this.winStreak > 0 && this.lossStreak < 3 ){
      if( this.lastBet == this.minBet ){
        myBet = this.minBet + this.minUnit;
      } else {
        myBet = this.betProgression[this.winStreak] * this.minUnit;
      }
    }
    if( this.lossStreak > 0 && (this.lossStreak%2 == 0 || this.lastBet == this.minBet) ){
      myBet = this.minBet + this.minUnit;
    }
    if( myBet == 0 || myBet < this.minBet ){
      myBet = this.minBet;
    }
    var trueCount = this.counter.trueCount();
    if( trueCount > 15.0 ){
      trueCount = 15;
    }
    if( trueCount > 1.0 ){
      //console.log( "Factoring Bet: " + myBet + " * " + trueCount);
      myBet *= trueCount;
      //console.log( "Factored bet due to count: " + myBet );
    } else if( trueCount <= -1.0 ){
      myBet *= (1/Math.round(Math.abs(trueCount)));
      //console.log( "Reduced bet due to count: " + myBet );
    }
    if( myBet%5 != 0 ){
      //console.log( "Reducing Bet: " + myBet + " * " + trueCount);
      myBet -= myBet%5;
      myBet = Math.round(myBet);
    }
    if( myBet < this.minBet ){
      myBet = this.minBet;
    }
    this.lastBet = myBet;
    //console.log(this.name + " bet end. amt: " + myBet);
    return myBet;
  }

  async nextAction( gameSnapshot, myHand ){
    //console.log(this.name + " nextAction start");
    var dealer = this.dealerHand(gameSnapshot);
    var hands = this.myHands(gameSnapshot);
    var stratLabel = deckCountToLabel( this.deckCount );
    //console.log("Dealer has: " + dealer.value());
    //console.log(this.name + " has: " + myHand.value());

    var counterStrat = testCountingStratTable( myHand.value(), dealer.value(), this.counter.trueCount() );
    if( counterStrat != null ){
      switch( counterStrat ){
        case "DOUBLE":
          if( myHand.canDouble() ){
            return 'DOUBLE';
          } else {
            return 'HIT';
          }
          break;
        case "SPLIT":
          if( myHand.canSplit() ){
            return 'SPLIT';
          } else {
            return 'STAND';
          }
          break;
        default:
          return counterStrat;
          break;
      }
    }

    if( myHand.canSplit() ){
      return stratDecodeAction( stratIndexTable[stratLabel]['splitTable'][ myHand.cards[0].value() ][ dealer.value() ], myHand);
    }

    if( myHand.value() && myHand.isSoft ){
      return stratDecodeAction( stratIndexTable[stratLabel]['softTable'][ myHand.value() ][ dealer.value() ], myHand);
    }

    return stratDecodeAction( stratIndexTable[stratLabel]['hardTable'][ myHand.value() ][ dealer.value() ], myHand);
  }

  async takeInsurance( gameSnapshot ){
    if( this.counter.trueCount() >= 3.0 ){
      return true;
    }
    return false;
  }

}

