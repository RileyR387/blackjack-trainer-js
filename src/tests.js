
/**
 * Test models
 */
var deck     = new DeckModel();
var testHand = new HandModel();
var testSuccess = true;

try {
  /**
   * Dealer double Ace
   */
  testHand.addCard( deck[0] ); // ACE
  testHand.addCard( deck[0] ); // ACE

  // Should be 12 - must call value prior to checking 'isSoft' property
  if( testHand.value() != 12 ){
    console.log('Model error in hand.value()');
    throw new Error( 'hand.value() is broke!' );
  }

  // Should be soft
  if( ! testHand.isSoft ){
    console.log('Model error in isSoft');
    throw new Error( 'isSoft is broke!' );
  }

  // Make it not soft
  testHand.addCard( deck[11] ); // A A Q not soft 12
  if( testHand.value() != 12 ){
    console.log('Model error in hand.value()');
    throw new Error( 'hand.value() is broke! A A Q didn\'t eqal 12' );
  }
  // Make it not soft 17
  testHand.addCard( deck[4] );  // A A Q 5 not soft 17
  if( testHand.value() != 17 ){
    console.log('Model error in hand.value()');
    throw new Error( 'hand.value() is broke! A A Q 5 didn\'t eqal 17' );
  }
  // Shouldn't be soft
  if( testHand.isSoft ){
    throw new Error( 'isSoft is broke!' );
  }

  /**
   * Test soft 17/Insurance Hand( A, 6);
   */
  testHand = new HandModel();
  testHand.addCard( deck[0] ); // ACE
  testHand.addCard( deck[5] ); // 6

  // Should be soft
  if( ! testHand.isSoft ){
    console.log('Model error in isSoft - soft 17 wasn\'t soft');
    throw new Error( 'isSoft is broke!' );
  }
  // Should offer insurance
  if( ! testHand.offerInsurance() ){
    console.log('Model error in isSoft - didn\'t offer insurance on ace up');
    throw new Error( 'isSoft is broke!' );
  }

  /**
   * Test soft 18 no Insurance Hand( 7, A);
   */
  testHand = new HandModel();
  testHand.addCard( deck[6] ); // 7
  testHand.addCard( deck[0] ); // Ace

  // Should be soft
  if( ! testHand.isSoft ){
    console.log('Model error in isSoft - soft 18 wasn\'t soft');
    throw new Error( 'isSoft is broke!' );
  }
  // Should NOT offer insurance
  if( testHand.offerInsurance() ){
    throw new Error( 'Incorrect insurance offering, ace wasn\'t first card' );
  }

  /**
   * Test canSplit
   */
  testHand = new HandModel();
  testHand.addCard( deck[3] ); // 4
  testHand.addCard( deck[2] ); // 3

  // Should not be able to split
  if( testHand.canSplit() ){
    console.log('Model error in canSplit() - you can\'t split a 3 and 4');
    throw new Error( 'canSplit is broke!' );
  }
  // Should not return a hand after split
  if( testHand.splitHand() != null ){
    console.log('Model error in splitHand() - soft 18 wasn\'t soft');
    throw new Error( 'canSplit is broke!' );
  }
  // Should not be soft
  if( testHand.isSoft ){
    console.log('Model error in isSoft - 3 & 4 aren\'t soft');
    throw new Error( 'isSoft is broke!' );
  }
  // Should NOT offer insurance
  if( testHand.offerInsurance() ){
    throw new Error( 'Incorrect insurance offering, ace wasn\'t first card or in hand!' );
  }

  // Test Cloning a card.
  var cardA = deck[0];
  var cardB = new CardModel().clone(cardA);
  cardB.rank = 2;
  cardB.suit = deck[25].suit;
  if( cardA.suit == cardB.suit ){
    throw new Error( 'Model error in CardModel.clone() - both cards suit were equal after change' );
  }
  if( cardA.rank == cardB.rank ){
    throw new Error( 'Model error in CardModel.clone() - both cards rank were equal after change' );
  }

} catch(e) {
  console.log( '!!! TESTS FAILED !!!' );
  throw e;
  testSuccess = false;
}

/**
 * Report
 */
if( testSuccess ){
  console.log( 'All test passed' );
}

/**
 * Cleanup
 */
testHand = null;
deck = null;

