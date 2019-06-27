/*
@param {number} x = x-coordinate of this ball object
@param {number} y = y-coordinate of this ball object
@param {number} dx = initial x-velocity of this ball object
@param {number} dy = initial y-velocity of this ball object
@param {number} radius = radius of this ball object
@param {object} game = game instance that created this object
*/
function Ball (x, y, dx, dy, radius, game) {
  let self = this;
  self.x = x;
  self.y = y;
  self.dx = dx;
  self.dy = dy;
  self.radius = radius;
  self.game = game;
  self.ctx = game.ctx;
  //establish min/max ball speeds based on the average of the proportions of the window's dimensions
  self.maxAbsSpeed = 40 * (windowWidthFactor(game)+windowHeightFactor(game)) / 2;
  self.minAbsSpeed = 11 * (windowWidthFactor(game)+windowHeightFactor(game)) / 2;
  self.frictionFactor = 0.992;
  
  //draw the ball at its current position, as well as its "shadow trail"
  self.draw = function () {
    self.ctx.fillStyle="white";
    self.ctx.beginPath();
    self.ctx.arc(self.x,self.y,self.radius, 0, 2 * Math.PI);
    self.ctx.fill();

    //create shadow trail by extrapolating backwards, based on curret x and y velocities
    for (let i = 0; i < 15; i++) {
      self.ctx.fillStyle="rgba(255,255,255," + 1/(2*i+1) + ")"; //the trail becomes more transparent after each iteration
      self.ctx.beginPath();
      self.ctx.arc(self.x-i*self.dx, self.y-i*self.dy, self.radius, 0, 2 * Math.PI);
      self.ctx.fill();
    }
  };

  //check if the ball has collided with either the top or bottom of the canvas
  self.collide = function () {
    if (self.y+self.radius>=self.game.canvas.height || self.y-self.radius<=0) {
      //if the ball has collided with the top or bottom, bring the ball back into the canvas and reverse the y-veclocity of the ball
      self.y = Math.min (self.y, game.canvas.height);
      self.y = Math.max (self.y, 0);
      self.dy *= -1;
      self.y += self.dy;
    }
  };

  //update function, called at every iteration of the game loop
  self.update = function () {

    //before updating the position using veclocity, update the veclocity using deceleration caused by friction
    self.dx *= self.frictionFactor;
    self.dy *= self.frictionFactor;

    //ensure that the absolute value of the x velocity is within the preset min and max velocity range 
    if (self.dx>=0) {
      self.dx = Math.max (self.dx, self.minAbsSpeed);
      self.dx = Math.min (self.dx, self.maxAbsSpeed);
    } else {
      self.dx = Math.min (self.dx, -self.minAbsSpeed);
      self.dx = Math.max (self.dx, -self.maxAbsSpeed);
    }
    
    //ensure that the absolute value of the y velocity is within the preset min and max velocity range 
    if (self.dy>=0) {
      self.dy = Math.max (self.dy, self.minAbsSpeed);
      self.dy = Math.min (self.dy, self.maxAbsSpeed);
    } else {
      self.dy = Math.min (self.dy, -self.minAbsSpeed);
      self.dy = Math.max (self.dy, -self.maxAbsSpeed);
    }

    self.collide();

    //apply x and y velocities to the position of the ball, and then draw the ball at its new position
    self.x += self.dx;
    self.y += self.dy;
    self.draw();
  };

}