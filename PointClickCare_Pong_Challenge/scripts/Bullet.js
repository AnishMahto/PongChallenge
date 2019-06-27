/*
@param {number} x = x-coordinate of this bullet object
@param {number} y = y-coordinate of this bullet object
@param {number} playerId = player id of paddle that shot this bullet (0 for player 1, 1 for player 2)
@param {object} player = reference to paddle object that shot this bullet
@param {object} game = instance of the GameInstance class that this bullet object belongs to
*/
function Bullet (x, y, playerId, player, game) {
  let self = this;
  self.x = x;
  self.y = y;
  self.width= 10;
  self.height= 5;
  self.dx=8;
  self.playerId = playerId;
  self.ctx = game.ctx;
  self.game = game;
  self.player = player;

  //function that actually applies the effects of a given power up to the game instance
  self.applyPowerUp = function (powerUpType) {
    playAudio ("powerUp1");
    if (powerUpType==1) {
      //if power up type is 1 (extend paddle), increase paddle length of the player who shot this bullet by a constant factor, and then reduce it by the same factor after a set number of seconds
      self.player.height *= 1.5;
      let paddleHeightDecreaseTimeout = setTimeout (()=> {
        self.player.height /= 1.5;
      }, 10000);
      self.game.setTimeoutCalls.push (paddleHeightDecreaseTimeout);
    } else if (powerUpType==2) {
      //if power up type is 2 (force multiplier), set the paddle force multiplier of the player who shot this bullet to a constnat value, then reduce it back to the default after a set number of seconds
      if (self.player.forceMultiplier==1) {
        self.player.forceMultiplier = 18;
        let paddleForceReduceTimeout = setTimeout (()=> {
          self.player.forceMultiplier = 1;
        }, 10000);
        self.game.setTimeoutCalls.push (paddleForceReduceTimeout);
      }
    } else if (powerUpType==3 && self.game.ballObjects.length<3 && self.game.ballObjects.length>0) {
      //if power up type is 3 (extra ball, for a maximum of 3 balls), duplicate the main ball but reverse x-velocity, and delete this ball after a set number of seconds (if it still exists)
      self.game.ballObjects.push(new Ball (self.game.ballObjects[0].x, self.game.ballObjects[0].y, -self.game.ballObjects[0].dx, -self.game.ballObjects[0].dy, self.game.ballObjects[0].radius, game));
      let deleteExtraBallTimeout = setTimeout (()=>{
        if (self.game.ballObjects.length>1) {
          self.game.ballObjects.splice (1,1);
        }
      }, 5000);
      self.game.setTimeoutCalls.push (deleteExtraBallTimeout);
    }
  };

  self.checkPowerUpCollision = function (curBullet) {
    if (self.playerId==0) {
      //if player 1 shot this bullet and the bullet has hit a power up object, then apply that power up
      if (self.x+self.width>=curBullet.x && self.x+self.width<=curBullet.x+curBullet.width) {
        if ((self.y>=curBullet.y && self.y<=curBullet.y+curBullet.height) || (self.y+self.height>=curBullet.y && self.y+self.height<=curBullet.y+curBullet.height) ) {
          return true;
        }
      }
    } else if (self.playerId==1) {
      //if player 2 shot this bullet and the bullet has hit a power up object, then apply that power up
      if (self.x>=curBullet.x && self.x<=curBullet.x+curBullet.width) {
        if ((self.y>=curBullet.y && self.y<=curBullet.y+curBullet.height) || (self.y+self.height>=curBullet.y && self.y+self.height<=curBullet.y+curBullet.height) ) {
          return true;
        }
      }
    }
    return false;
  }
  
  //function that checks if the bullet has collided with a power up object
  self.powerUpCollision = function () {
    for (let i = 0; i < self.game.powerUpObjects.length; i++) {
      //loop through all the currently existing power up objects
      let curBullet = self.game.powerUpObjects[i];
      if (self.checkPowerUpCollision (curBullet)) {
        //if collision occurs, apply power up and then remove it from game instance
        self.applyPowerUp(curBullet.type);
        self.game.powerUpObjects.splice (i,1);
      }
    }
  };

  //function that handles drawing the bullet object at each iteration of the game loop
  self.draw = function () {
    self.ctx.fillStyle = "white";
    self.ctx.fillRect (self.x, self.y, self.width, self.height);
  };

  //update function, called at every iteration of the game loop
  self.update = function () {
    //update bullet position by adding or subtracting the speed from the current position, based on whether player 1 or 2 shot it
    if (self.playerId==0) {
      self.x += self.dx;
    } else {
      self.x -= self.dx;
    }
    self.powerUpCollision();
    self.draw();
    
    //if the earliest fired bullet that still exists has now left the screen, delete it
    if (self.x > self.game.canvas.width || self.x+self.width<0) {
      self.game.bulletObjects.shift();
    }
  };
}