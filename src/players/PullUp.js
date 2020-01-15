
class PullUp extends AgentModel {
  constructor( gameOpts ){
    super(gameOpts)
    this.name = this.constructor.name;

    console.log(this.name + " - Loaded");
    this.maxRisk = 10;
    this.winStreak = 0;
    this.lossStreak = 0;
    this.riskLevel = 1;
    this.betProgression = [2,1,2,3,4,5,6,7,8,9,10,5,7,10,15,10,15,20,15,20,25,20,25,30,25,30];
  }

  async placeBet( priorGameSnapshot){
    var gameState = priorGameSnapshot;
    console.log('Loss Streak: ' + this.lossStreak );
    console.log('Win Streak: ' + this.winStreak );

    if( gameState == null || gameState == '' ){
      return this.minBet * 2;
    }

    var lossFound = false;
    myHands.each( hand => {
      if( hand.score != ScoreModel.Blackjack && hand.score != ScoreModel.Win ){
        lossFound = true;
        if( this.winStreak > 5 ){
          this.winStreak -= 4;
        } else {
          this.winStreak = 0;
        }
        console.log( 'loss increment' );
        this.lossStreak++;
      } else {
        this.lossStreak = 0;
        this.winStreak++;
        console.log( 'win increment' );
      }
    });

    if( this.winStreak > 0 && self.lossStreak < 3 ){
      return this.betProgression[this.winStreak] * this.minBet;
    }
    if( this.lossStreak > 0 && this.lossStread%2 == 0){
      return this.minBet*2;
    }
    return this.minBet;
  }

  async nextAction( gameSnapshot, myHand ){
    //console.log( this.dealerHand( gameSnapshot ) );
    //console.log( 'nextAction - MyHands:' );
    //console.log( this.myHands(gameSnapshot) );
    if( this.riskLevel < this.maxRisk && this.splitEnabled &&
        myHand.canSplit() &&
        (
          myHand.value() < 18
       ||
          ((myHand.value() == 18 || myHand.value() == 20 ) && (dealer.value() == 2 || dealer.value() == 3 || dealer.value() == 4 || dealer.value() == 11) )
        )
    ){
      this.riskLevel *= 2
      return 'SPLIT'
    }
    if( this.riskLevel < this.maxRisk && (myHand.value() == 10 || myHand.value() == 10) && myHand.canDouble() ){
      this.riskLevel *= 2
      return 'DOUBLE'
    }
    if( myHand.value() >=17
     || (myHand.value() > 11 && ! myHand.isSoft() && dealer.value() < 7)
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
