
class PullUp extends AgentModel {
  constructor( gameOpts ){
    super(gameOpts)
    this.name = this.constructor.name;

    console.log(this.name + " - Loaded");
    this.maxRisk = 10;
    this.winStreak = 0;
    this.lossStreak = 0;
    this.riskLevel = 1;
    this.splitEnabled = true;
    this.lastBet = 0;
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
    //console.log("Dealer has: " + dealer.value());
    //console.log(this.name + " has: " + myHand.value());
    if( this.riskLevel < this.maxRisk && this.splitEnabled &&
        myHand.canSplit() && myHand.value() != 10 &&
        (
          myHand.value() < 18
       ||
          (myHand.value() == 18 && dealer.value() == 9 )
       ||
          (myHands.length < 3 && myHand.value() == 20  && (dealer.value() == 3 || dealer.value() == 4) )
        )
    ){
      this.riskLevel *= 2
      return 'SPLIT'
    }
    if( this.riskLevel < this.maxRisk && (myHand.value() == 10 || myHand.value() == 11) && myHand.canDouble() ){
      this.riskLevel *= 2
      return 'DOUBLE'
    }
    if( myHand.value() >=17
     || (myHand.value() > 11 && ! myHand.isSoft && (dealer.value() < 7 && dealer.value() > 2))
     || myHand.cards.length > 4
    ){
      return 'STAND'
    } else {
      return 'HIT'
    }

  }

  async takeInsurance( gameSnapshot ){
  }
}
