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


//test to see if 
describe ("Testing Bullet-Powerup Collisions", function () {
  
  reset();
  
  for (let i = 0; i < 10; i++) {
    
    let id = randomNumberGenerator (0,1000000);
      
    //randomly choose which one of the 3 power ups to generate (1 = paddle extension, 2 = paddle force increase, 3 = generate extra ball)
    let powerUpType = randomNumberGenerator(1,3);

    //randomly choose the coordinates at which the power up will be generated, then create an object for that powerup
    let x = (randomNumberGenerator(0,80) / 100 + 0.05)*gameInstance.canvas.width;
    let y = (randomNumberGenerator(0,80) / 100 + 0.05)*gameInstance.canvas.height;

    let powerUp = new PowerUp(x, y, id, powerUpType, gameInstance);
    gameInstance.powerUpObjects.push(powerUp);

    //randomly generate a bullet that collides with the left edge of the powerup
    let bullet = new Bullet (randomNumberGenerator(x, x+10-1), randomNumberGenerator(y,y+powerUp.height-1), 0, gameInstance.paddleObjects[0], gameInstance);

    
    it ("Check for collision between a PowerUp and Bullet " + 0, function () {
    
      //if collision function returns true, it has successfully detected a collision
      expect(bullet.checkPowerUpCollision(powerUp)).toBe(true);
      
    });
    
    it ("Check for collision between a PowerUp and Bullet " + 1, function () {
    
      //now a bullet shot by a player on the right side (hence bullet collides with the right edge of the powerup)
      bullet.playerId=1;
      bullet.x = x+powerUp.width-10+1;
      //if collision function returns true, it has successfully detected a collision
      expect(bullet.checkPowerUpCollision(powerUp)).toBe(true);
      
    });
    
  }


});