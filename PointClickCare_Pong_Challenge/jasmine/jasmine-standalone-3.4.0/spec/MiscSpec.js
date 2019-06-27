gameInstance.clearObjects();

//reset function to be called before and after every unit test, to restart the game instance
function reset () {
  beforeEach(function() {
    gameInstance.clearObjects();
  });
  afterEach(function() {
    gameInstance.clearObjects();
  });
}

//test the random number generator function, see if it really produces a number in a given range
describe("Random Number Generator Test", function() {
  
  reset();
  
  for (let i = 0; i < 10; i++) {
    let lb = -1000, ub = 1000;
    let str = "Check Random Number Generator Range: " + lb + " to " + ub;
    it (str, function () {
      let value = randomNumberGenerator (lb, ub);
      //test to see if the random number generated is greater than or equal to the lowerbound, and less than or equal to the upper bound
      expect (value >= lb && value <= ub).toBe(true);
    });
    
  }
});