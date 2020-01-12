
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
    throw new Error( 'hand.value() is broke!' );
  }
  // Make it not soft 17
  testHand.addCard( deck[4] );  // A A Q 5 not soft 17
  if( testHand.value() != 17 ){
    console.log('Model error in hand.value()');
    throw new Error( 'hand.value() is broke!' );
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
  testHand.addCard( deck[6] ); // ACE
  testHand.addCard( deck[0] ); // 6

  // Should be soft
  if( ! testHand.isSoft ){
    console.log('Model error in isSoft - soft 18 wasn\'t soft');
    throw new Error( 'isSoft is broke!' );
  }
  // Should NOT offer insurance
  if( testHand.offerInsurance() ){
    throw new Error( 'Incorrect insurance offering, ace wasn\'t first card' );
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
