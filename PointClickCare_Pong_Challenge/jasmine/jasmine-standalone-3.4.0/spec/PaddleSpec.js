gameInstance.clearObjects();

//reset function to be called before and after every unit test, to restart the game instances
function reset () {
  beforeEach(function() {
    gameInstance.clearObjects();
  });
  afterEach(function() {
    gameInstance.clearObjects();
  });
}

//function to test if the program enforces the paddle's position to be within the canvas height
describe ("Testing Paddle Boundaries", function () {
  reset();
  for (let i = 0; i < 10; i++) {
    //generate a random velocity in a given range
    let dy = randomNumberGenerator (-10000, 10000);
    
    for (let j = 0; j < gameInstance.paddleObjects.length; j++) {
      //for each unit test, apply the random velocity to the paddle, and update it to its new position
      gameInstance.paddleObjects[j].y += dy;
      gameInstance.paddleObjects[j].update();
      it ("Check if Paddle is in range of canvas", function () {
        //if the new position is still within the canvas' range, this means that either the program successfully enforced this boundaries, or the randomly generated velocity was too small to push the paddle out of range in the first place
        expect (gameInstance.paddleObjects[j].y >= 0 && gameInstance.paddleObjects[j].y+gameInstance.paddleObjects[j].height <= gameInstance.canvas.height).toBe(true);
      });
    }
  }
});

//test to see if the paddle successfully detects collisions with a ball object
describe ("Testing Paddle-Ball Collisions", function () {
  reset();
  for (let i = 0; i < gameInstance.paddleObjects.length; i++) {
    let curPaddle = gameInstance.paddleObjects[i];
    let ballRadius = 10;
    for (let j = 0; j < 10; j++) {
      //randomly generate coordinates for the ball that should collide with the paddle
      let x = randomNumberGenerator (curPaddle.x-ballRadius, curPaddle.x+ballRadius);
      let y = randomNumberGenerator (curPaddle.y-ballRadius, curPaddle.y+ballRadius);
      it ("Check for collision between a Ball and Paddle " + i, function () {
        //if the paddle-ball collision function returns true, then the test is sucessful
        expect (curPaddle.checkBallCollision(new Ball(x, y, 0, 0, 10, gameInstance))).toBe (true);
      });
    }
  }
});