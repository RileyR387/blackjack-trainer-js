
const KeyMapHandlerModel = function(bjg){

  this.bjg = bjg;

  this.actionKeyMap = {
    'Deal': {
      keyCodes: [82,32,85],
      keys: ['R','Space','U'],
      context: 'Bet',
    },
    'Clear': {
      keyCodes: [67],
      keys: ['C'],
      context: 'Bet',
    },
    'Double Last Bet': {
      keyCodes: [68],
      keys: ['D'],
      context: 'Bet',
    },
    'Half Last Bet': {
      keyCodes: [69,73],
      keys: ['E','I'],
      context: 'Bet',
    },
    'Increment Last Bet': {
      keyCodes: [81,80],
      keys: ['Q','P'],
      context: 'Bet',
    },
    'Stand': {
      keyCodes: [16, 70],
      keys: ['S','F'],
      context: 'Round',
    },
    'Hit': {
      keyCodes: [71, 72,87, 86],
      keys: ['G','H','W','V'],
      context: 'Round',
    },
    'Double': {
      keyCodes: [68,75],
      keys: ['D','K'],
      context: 'Round',
    },
    'Split': {
      keyCodes: [65,89],
      keys: ['A','Y'],
      context: 'Round',
    },
    'Take Insurance': {
      keyCodes: [84,89],
      keys: ['T','Y'],
      context: 'Insurance',
    },
    'Decline Insurance': {
      keyCodes: [32,78],
      keys: ['Space','N'],
      context: 'Insurance',
    },
    'Shuffle': {
      keyCodes: [88],
      keys: ['X'],
      context: 'Any',
    },
  };

  this._validKeyCodes = function(){
    var keyCodes = [];
    jQuery.each(this.actionKeyMap, (key, value) => {
      keyCodes = keyCodes.concat( value.keyCodes );
    });
    return keyCodes;
  }
  this._keyMap = function(){
    var kMap = {};
    jQuery.each(this.actionKeyMap, (key, value) => {
      value.keyCodes.forEach( function(keyCode) {
        if( ! kMap[keyCode] ){
          kMap[keyCode] = [];
        }
        if( value.context == 'Bet' ){
          kMap[keyCode][0] = key;
        } else if ( value.context == 'Round' ){
          kMap[keyCode][1] = key;
        } else if ( value.context == 'Insurance' ){
          kMap[keyCode][2] = key;
        } else {
          kMap[keyCode][0] = key;
          kMap[keyCode][1] = key;
          kMap[keyCode][2] = key;
        }
      });
    });
    return kMap;
  }

  this.validKeyCodes = this._validKeyCodes();
  this.keyMap = this._keyMap();

  //console.log( this.validKeyCodes );
  //console.log( this.keyMap );

  this.handleKeyPress = function(keyEvent){
    console.log( keyEvent.key + " " + keyEvent.keyCode );

    if( this.validKeyCodes.indexOf( keyEvent.keyCode ) >= 0 ){
      var context = 1; // Round
      if( this.bjg.enableBetActions() ){
        context = 0;
      }
      if( this.bjg.enableInsuranceActions() ){
        context = 2;
      }
      var action = this.keyMap[keyEvent.keyCode][context];
      if( action ){
        switch( action ){
          case 'Shuffle': this.bjg.shuffleShoe(); break;
          case 'Stand': this.bjg.actionStand(); break;
          case 'Hit': this.bjg.actionHit(); break;
          case 'Split': this.bjg.actionSplit(); break;
          case 'Double': this.bjg.actionDouble(); break;
          case 'Decline Insurance': this.bjg.declineInsurance(); break;
          case 'Take Insurance': this.bjg.takeInsurance(); break;
          case 'Clear': this.bjg.clearBet(); break;
          case 'Deal': this.bjg.deal(); break;
          case 'Double Last Bet': this.bjg.doubleBet(); break;
          case 'Half Last Bet': this.bjg.halfBet(); break;
          case 'Increment Last Bet': this.bjg.incrementBet(); break;
          case 'Decrement Last Bet': this.bjg.decrementBet(); break;
        }
      }
    }
  }
}

