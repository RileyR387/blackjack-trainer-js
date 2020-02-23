
class HiLo extends AgentModel {

  constructor( gameOpts, hiloCounter ){
    super(gameOpts)
    this.name = this.constructor.name;
    console.log(this.name + " - Loaded");
    this.maxRisk = 10;
    this.winStreak = 0;
    this.lossStreak = 0;
    this.riskLevel = 1;
    this.splitEnabled = true;
    this.lastBet = 0;
    this.counter = hiloCounter;
    this.betProgression = [2,1,2,3,4,5,6,7,8,9,10,5,7,10,15,10,15,20,15,20,25,20,25,30,25,30];
  }

  async placeBet(gameState){
    //console.log(this.name + " bet start");
    this.riskLevel = this.winStreak;
    if( gameState == null || gameState == '' ){
      //console.log(this.name + " bet end");
      this.lastBet = this.minBet * 2;
      return this.minBet * 2;
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
          this.winStreak -= 4;
        } else {
          this.winStreak = 0;
        }
        //console.log( 'loss increment' );
        this.lossStreak++;
      }
    });

    //console.log('Loss Streak: ' + this.lossStreak );
    //console.log('Win Streak: ' + this.winStreak );

    var myBet = 0;

    if( this.winStreak > 0 && this.lossStreak < 3 ){
      //console.log('Betting progression');
      myBet = this.betProgression[this.winStreak] * this.minBet;
    }
    if( this.lossStreak > 0 && (this.lossStreak%2 == 0 || this.lastBet == this.minBet) ){
      //console.log('Betting flip');
      myBet = this.minBet*2;
    }
    if( myBet == 0 ){
      //console.log("Betting default");
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

