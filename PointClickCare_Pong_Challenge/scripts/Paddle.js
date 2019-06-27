/**
@param {number} x = initial x position of paddle
@param {number} y = initial y position of paddle
@param {number} height = initial height of paddle
@param {number} playerId = player who controls this paddle (0 for player 1, 1 for player 2)
@param {number} moveUpKey = keycode of the key that will accelerate the paddle upwards
@param {number} moveDownKey = keycode of the key that will accelerate the paddle upwards
@param {number} shootBulletKey = keycode of the key that will shoot a bullet for this paddle
@param {object} game = instance of the GameInstance class that this paddle belongs to
*/
function Paddle(x, y, height, playerId, moveUpKey, moveDownKey, shootBulletKey, game) {
  var self = this;
  self.x = x;
  self.y = y;
  self.dy = 0;
  self.height = Math.max(height, 100);
  self.width = 20;
  self.game = game;
  self.ctx = game.ctx;
  self.a = 0;
  self.frictionFactor = 0.02;
  self.velocityChange = 12;
  self.isLoaded = true;
  self.playerId = playerId;
  self.forceMultiplier = 1;
  self.moveUpKey = moveUpKey;
  self.moveDownKey = moveDownKey;
  self.shootBulletKey = shootBulletKey;
  self.computerControlled = false;
  self.bulletAutoAim = false;
  
  self.reInit = function () {
    self.isLoaded = true;
  }
  
  //event listener to check if any of this paddle's controls have been pressed
  window.addEventListener ("keydown", function () {
    
    if([38, 40, 32, 16].indexOf(event.keyCode) > -1) {
      //prevent default actions of the shift, space, and up/down keys, as they need to be reserved for game-play
      event.preventDefault();
    }
    
    if (event.keyCode==self.moveUpKey) {
      //if up key is pressed, accelerate object upwards
      self.dy -= self.velocityChange;
    } else if (event.keyCode==self.moveDownKey) {
      //if down key is pressed, accelerate object downwards
      self.dy += self.velocityChange;
    } else if (event.keyCode==self.shootBulletKey) {
      //if shoot bullet key is pressed, call the firebullet function
      self.fireBullet();
    }
    
  });
  
  //function that handles requests to fire a bullet
  self.fireBullet = function () {
    if (self.isLoaded) {
      //if the paddle is loaded (i.e allowed to shoot a bullet at this instant), proceed to fire bullet
      self.isLoaded = false; //as loaded bullet will be fired shortly, set loaded to false
      //create bullet object based on playerId, in order to position bullet correctly
      if (self.playerId == 0) {
        self.game.bulletObjects.push(new Bullet(self.x + self.width, self.y + self.height / 2, self.playerId, self, game));
      } else {
        self.game.bulletObjects.push(new Bullet(self.x, self.y + self.height / 2, self.playerId, self, game));
      }
      //after a set period of time, consider the paddle reloaded, and change the state variable accordingly
      let reloadTimeout = setTimeout (()=> { 
        self.isLoaded=true;
      }, 3000);
      self.game.setTimeoutCalls.push(reloadTimeout);
    }
  };

  //function that checks if the paddle has collided with top or bottom of the canvas
  self.collide = function () {
    if (self.y<=0 || self.y+self.height>=self.game.canvas.height) {
      //if the paddle has collided, set acceleration and velocity to 0, to prevent user from forcing paddle off the canvas
      self.a=0;
      self.dy=0;
      //shift paddle up or down to ensure it is completely contained within the canvas
      if (self.y<=0) {
        self.y=1;
      } else {
        self.y = self.game.canvas.height-self.height-2;
      }
    }
  };

  //function that checks and handles collisions between this paddle and existing balls in the game instance
  self.checkBallCollision = function (curBall) {
    //check if the current ball being inspected has a y position that is within the paddle's y-range
    if (curBall.y-curBall.radius <= self.y+self.height && curBall.y+curBall.radius >= self.y) {

      //check left paddle for x-intersection: if the ball is curBallrently in collision with the paddle OR the ball has not yet collided but will be already passed the paddle in the next iteration (could happen at high speeds) 
      if ((curBall.x-curBall.radius <= self.x+self.width && curBall.x-curBall.radius >= self.x) || (curBall.x-curBall.radius > self.x+self.width && curBall.x+curBall.dx-curBall.radius < self.x)) {
        //as collision is detected, play sound effect and alter velocity of ball
        playAudio("impactThudWobble");

        //reverse ball velocity x-direction, and apply force multiplier
        curBall.dx = -1 * curBall.dx/Math.abs(curBall.dx) * (23+self.forceMultiplier*1);
        curBall.dy += self.dy + self.forceMultiplier;

        //apply velocity factored by window size to the ball position
        curBall.x += curBall.dx * windowWidthFactor(game);
        curBall.y += curBall.dy * windowHeightFactor(game);
        return true;
      }

      //check right paddle for x-intersection: if the ball is curBallrently in collision with the paddle OR the ball has not yet collided but will be already passed the paddle in the next iteration (could happen at high speeds)
      if ((curBall.x+curBall.radius >= self.x && curBall.x+curBall.radius <= self.x+self.width) || (curBall.x+curBall.radius < self.x && curBall.x+curBall.dx+curBall.radius > self.x+self.width)) {
        //as collision is detected, play sound effect and alter velocity of ball
        playAudio("impactThudWobble");

        //reverse ball velocity x-direction, and apply force multiplier
        curBall.dx = -1 * curBall.dx/Math.abs(curBall.dx) * (23+self.forceMultiplier*1);
        curBall.dy += self.dy + self.forceMultiplier;

        //apply velocity factored by window size to the ball position
        curBall.x += curBall.dx * windowWidthFactor(game);
        curBall.y += curBall.dy * windowHeightFactor(game);
        return true;
      }
    }
    return false;
  };
  
  //auxiliary function that checks all existing balls for collisions, and updates position/velocity of the ball accordingly
  self.ballCollision = function () {
    for (let i = 0; i < self.game.ballObjects.length; i++) {
      //loop through each existing ball, to check/handle potential collision
      let curBall = self.game.ballObjects[i];
      self.checkBallCollision(curBall);
    } 
  };

  //function to draw the paddle at its resulting position
  self.draw = function () {

    //once new position is determined, draw paddle
    self.ctx.fillStyle="white";
    self.ctx.fillRect(self.x, self.y, self.width, self.height);

    //if forceMultiplier is applicable (greater than 1), draw an indicator strip on the paddle
    if (self.forceMultiplier!=1) {
      self.ctx.fillStyle="#ee5253";
      if (self.playerId==0) {
        self.ctx.fillRect(self.x+self.width-5, self.y, 5, self.height);
      } else if (self.playerId==1) {
        self.ctx.fillRect(self.x, self.y, 5, self.height);
      }

    }
  };

  //predict where the paddle y-coordinate will be after a certain number of game loop iterations, using simulation
  self.simulate = function (tim) {
    let tmpY = self.y, tmpA, tmpDy = self.dy;
    for (let i = 0; i < tim; i++) {
      tmpA = -self.dy * self.frictionFactor;
      tmpDy += tmpA;
      tmpY += tmpDy;
    }
    return tmpY;
  };
  
  //function that automatically fires bullet if a powerup is within firing sight
  self.autoBullet = function () {
    for (let i = 0; i < self.game.powerUpObjects.length; i++) {
      //loop through all existing powerups in the game instance, to check if they can be shot
      let cur = self.game.powerUpObjects[i];
      if (self.y+self.height/2 >= cur.y && self.y+self.height/2 <= cur.y+cur.height) {
        //if the powerup lines up correctly with this paddle's shot trajectory at this instant, attempt to fire a bullet
        self.fireBullet();
        //since the paddle needs to reload after firing a shot, we know we can't shoot again during this instant, so we can stop our search
        break;
      }
    }
  };
  
  //function that handles bot movement, when called
  self.computerMove = function () {
    //determine the x-coordinate of the paddle's edge that is closest to the center (as this is the edge that will collide with the ball)
    let posX = self.x;
    if (self.playerId==0) {
      posX += self.width;
    }
    //find the ball closest to paddle at this current instant, if any exist
    let closestBall = null;
    for (let i = 0; i < self.game.ballObjects.length; i++) {
      let curBall = self.game.ballObjects[i];
      if (closestBall === null || Math.abs (closestBall.x - posX) > Math.abs(curBall.x-posX)) {
        //if the current ball being assessed is closer to the paddle than any previous balls iterated over, then this ball is the closest thus far
        closestBall = curBall;
      }
    }
    if (closestBall === null) {
      //if no ball exists in the game at this instant (for example when a player has just scored), then bring the paddle back to the vertical center of the canvas (optimal waiting place)
      if (self.game.canvas.height/2 - 5 < self.y) {
        self.dy -= self.velocityChange;
      } else if (self.game.canvas.height/2 + 5 > self.y) {
        self.dy += self.velocityChange;
      }
      return;
    }
    //otherwise a closest ball exists, check which of the two following cases the current instance falls under
    if (Math.abs(closestBall.x-posX) > 800) {
      
      //if the ball is further than a certain distance from the paddle, then focus on centering paddle vertically
      let tim = Math.abs(closestBall.x-posX)/Math.abs(closestBall.dx);
      if (self.game.canvas.height/2 - 5 < self.simulate(tim)) {
        self.dy -= self.velocityChange;
      } else if (self.game.canvas.height/2 + 5 > self.simulate(tim)) {
        self.dy += self.velocityChange;
      }
    } else {
      
      //otherwise, focus on aligning center of paddle with the closest ball
      let futureY = closestBall.y+closestBall.dy*(Math.abs(closestBall.x-posX)/Math.abs(closestBall.dx));
      let tim = Math.abs(closestBall.x-posX)/Math.abs(closestBall.dx);
      if (self.simulate (tim)+self.height/2<futureY) {
        self.dy += self.velocityChange;
      } else if (self.simulate(tim)+self.height/2 >futureY) {
        self.dy -= self.velocityChange;
      }
    
    }
    if (self.bulletAutoAim) {
      //if bullet auto aim mode is on, call the appropriate function
      self.autoBullet();
    }
  };
  
  //update function, called at every iteration of the game loop
  self.update = function () {
    if (self.computerControlled) {
      self.computerMove();
    } 
    if (self.bulletAutoAim) {
      self.autoBullet();
    }
    
    //before applying accleration/velocity, check if paddle has collided with the top/bottom of the screen
    self.collide();

    //apply acceleration to velocity, reduce acceleration due to friction, and apply velocity to position
    //when applying values, scale accordingly based on screen height (can only increase speed)
    self.dy += self.a * Math.max(windowHeightFactor(game), 1);
    self.a = -self.dy * self.frictionFactor;
    self.y += self.dy * Math.max(windowHeightFactor(game), 1);
    
    //now that all required changes are applied, draw the paddle at its new position
    self.draw();
    self.ballCollision();
  };

}
