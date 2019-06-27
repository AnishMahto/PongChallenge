/*
@param {number} playerId = player who this goal object belongs to (0 for player 1, 1 for player 2)
@param {number} x = x-coordinate of this goal object
@param {object} game = instance of the GameInstance class that this goal object belongs to

The goal object is an object that is as tall as the canvas, and is on either the left or right edge of the canvas (behind the player's paddles). The purpose of this object is to check whether the ball has collided with it, and then update players scores accordingly.
*/
function Goal (playerId, x, game) {
  let self = this;
  self.height=game.canvas.height;
  self.width=1; //the object should not be visible, so set width to only 1px
  self.playerId=playerId;
  self.game = game;
  self.ctx = game.ctx;
  self.x = x;

  //function that checks if any of the current existing balls have collided with this goal object
  self.checkCollision = function () {
    for (let i = 0; i < self.game.ballObjects.length; i++) {
      //loop through all the currently existing balls
      let cur = self.game.ballObjects[i];
      //check if the ball has collided with this goal object
      if ((cur.x + cur.radius >= self.x && self.playerId==1) || (cur.x - cur.radius <= self.x+self.width && self.playerId==0)) {
        //if true, increment the opposite player's score
        self.game.playerScores[self.playerId^1]++;
        //play goal sound
        resetAudio ("goalSound1");
        playAudio ("goalSound1");
        
        //reset game by deleting all the currently existing balls, and creating a new ball object after a set amount of time
        let resetBallTimeout = setTimeout (()=> {
          self.game.ballObjects.push(new Ball (self.game.canvas.width / 2, (0.1 + randomNumberGenerator(0,80)/100)*self.game.canvas.height, 4 * randomDirection(), 4 * randomDirection(), 10, self.game));
        }, 1000);
        self.game.setTimeoutCalls.push(resetBallTimeout);
        self.game.ballObjects.splice (0, self.game.ballObjects.length);
        //reinitialize paddles as new round begins
        gameInstance.reInitPaddles();
        break;
      }
    }
  };

  //function that handles drawing the goal object at its fixed position
  self.draw = function () {
    self.ctx.fillStyle = "rgba(5,5,5,1)";
    self.ctx.fillRect(self.x,0,self.width,self.height);
  };
  
  //update function, called at every iteration of the game loop
  self.update = function () {
    self.draw();
    self.checkCollision();
  };
}