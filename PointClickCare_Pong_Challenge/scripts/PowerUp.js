/*
PowerUp Class
@param {number} x = x position of powerup in game instance
@param {number} y = y position of powerup in game instance
@param {number} id = randomly generated id that this powerup can be identified by
@param {number} type = identifier of what type of powerup this is (1 = paddle extension, 2 = paddle force increase, 3 = generate extra ball)
@param {object} game = instance of the GameInstance class that this powerup belongs to
*/
function PowerUp(x, y, id, type, game) {
  let self = this;
  self.type = type;
  self.x = x;
  self.y = y;
  self.width = 100;
  self.height = 100;
  self.id = id;
  self.ctx = game.ctx;
  self.game = game;

  //function that draws the powerup icon, based on its type
  self.drawIcon = function () {
    if (self.type == 1) {
      self.ctx.fillStyle = "white";
      let rectWidth=10, rectHeight=70, rightRectWidth=3;
      self.ctx.fillRect (self.x+self.width/2-rectWidth/2, self.y+self.height/2-rectHeight/2, rectWidth, rectHeight);
    } else if (self.type == 2) {
      self.ctx.fillStyle = "white";
      let rectWidth=10, rectHeight=50, rightRectWidth=3;
      self.ctx.fillRect (self.x+self.width/2-rectWidth/2, self.y+self.height/2-rectHeight/2, rectWidth, rectHeight);
      self.ctx.fillStyle="#ee5253";
      self.ctx.fillRect (self.x+self.width/2+rectWidth/2-rightRectWidth, self.y+self.height/2-rectHeight/2, rightRectWidth, rectHeight);
    } else if (self.type == 3) {
      self.ctx.fillStyle = "white";
      self.ctx.beginPath();
      let radius=10;
      self.ctx.arc(self.x+self.width/2, self.y+self.height/2, radius, 0, 2 * Math.PI);
      self.ctx.fill();
    }
  };

  //function that draws powerup box
  self.draw = function () {
    self.ctx.fillStyle = "rgba(0,0,0,0.2)";
    self.ctx.fillRect (self.x,self.y,self.width,self.height);
    self.drawIcon();
  };

  //update function, called at every iteration of the game loop
  self.update = function () {
    self.draw();
  };
}