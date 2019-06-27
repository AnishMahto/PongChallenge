//$(document).ready(function () {
  
  //create a game instance and setup part of the canvas
  let gameInstance = new GameInstance("gameScreen");
  gameCanvasSetup (gameInstance);
  
  $("#playBtn").click (function() {
    //when the user clicks the play/reset game button, clear all current objects in the game screen, and reinitialize game
    gameInstance.clearObjects();
  });
  
  $("#powerUpsBtn").click (function () {
    //toggle the power ups boolean
    gameInstance.powerUpsOn = !gameInstance.powerUpsOn;
    //need to restart game to apply change
    gameInstance.clearObjects();
  });
  
  $("#p1BotBtn").click (function () {
    //request player 1 paddle to be bot controlled
    let status = gameInstance.toggleBot(gameInstance.paddleObjects[0]);
  });
  
  $("#p2BotBtn").click (function () {
    let status = gameInstance.toggleBot(gameInstance.paddleObjects[1]);
  });
  
  $("#p1BulletAutoAimBtn").click (function () {
    let status = gameInstance.toggleBulletAutoAim(gameInstance.paddleObjects[0]);
  });
  
  $("#p2BulletAutoAimBtn").click (function () {
    let status = gameInstance.toggleBulletAutoAim(gameInstance.paddleObjects[1]);
  });
  
  function GameInstance (canvasId) {
    var self = this;
    
    //declare arrays that will store this game instance's objects
    self.ballObjects = [];
    self.paddleObjects = []; //the i-th player is represented by the i-1 th index (because of 0 indexing); for example player 1 is the 0th index
    self.goalObjects = []; 
    self.playerScores = [0,0];
    self.powerUpObjects = []; 
    self.bulletObjects = [];
    
    //declare arrays that will store this game instance's timeout and intervall function calls
    self.setIntervalCalls = [];
    self.setTimeoutCalls = [];
    self.messageSetTimeoutCalls = [];
    
    //declare variables that will store properties that define the state of this game instance
    self.pause=null;
    self.restart=false;
    self.powerUpsOn = true;
    
    //get references to the html canvas element and drawing object
    self.canvas = document.getElementById(canvasId);
    self.ctx = document.getElementById(canvasId).getContext("2d");
    
    //set size of canvas based on browser window size
    self.setCanvasSize = function () {
      self.canvas.width = window.innerWidth-15;
      self.canvas.height = window.innerHeight;
    };
    
    self.reInitPaddles = function () {
      for (let i = 0; i < self.paddleObjects.length; i++) {
        self.paddleObjects[i].reInit();
      }
    }
    
    //function that initializes this game instance
    self.init = function () {
      
      //reset canvas size and pause state
      self.setCanvasSize();
      self.pause=false;
      
      //create a new ball object, and two new paddle objects (one for player 1, one for player 2)
      self.ballObjects.push(new Ball (self.canvas.width/2, (0.1 + randomNumberGenerator(0,80)/100)*self.canvas.height, randomDirection()*4, randomDirection()*4, 10, self));
      
      if (self.paddleObjects.length==0) {
        //if this is the first time initializing the game, populate it with paddles
        self.paddleObjects.push(new Paddle (10,this.canvas.height/2, this.canvas.height/7, 0, 87, 83, 32, self));
        
        self.paddleObjects.push(new Paddle (this.canvas.width-20-10,this.canvas.height/2, this.canvas.height/7, 1, 38, 40, 16, self));
        
      } else {
        //otherwise if the game is just being restarted, reset the y-positions of each paddle
        self.reInitPaddles();
      }
      //create two new goal sensor objects, one for player 1 and one for player 2
      self.goalObjects.push(new Goal (0, 0, self));
      self.goalObjects.push(new Goal (1, this.canvas.width-1, self));
      
      //as the game is now being initialized, enable all game option butons/toggles/switches
      $("#pauseBtn").removeClass("disabled");
      $("#p1BulletAutoAimBtn").removeClass("disabled");
      $("#p2BulletAutoAimBtn").removeClass("disabled");
      $("#p1BotBtn").removeClass("disabled");
      $("#p2BotBtn").removeClass("disabled");
      
      //call function that handles running the game, now that it is initialized
      self.runGame();
    };
    
    //function that runs the game from the initialized state
    self.runGame = function () {
      //draw the background of the canvas and display start game countdown
      drawBackground(self);
      gameStartMessage(self);
      
      let runGameTimeout = setTimeout (()=> {
        //after a delay that is long enough for the game start message to be displayed, set state variables accordingly and begin game loop
        self.restart=false;
        self.pause=false;
        self.animateGameInstance();
      }, 3500);
      self.setTimeoutCalls.push(runGameTimeout);
      
      if (self.powerUpsOn) {
        //if powerups state variable is true, create an interval call to randomly generate powerups
        let generatePowerUpInterval = setInterval (()=> {
          self.generatePowerUp ();
        },4000);
        self.setIntervalCalls.push(generatePowerUpInterval);
        
      }
    };
    
    //function to clear all drawings currently on the screen
    self.clear = function () {
      self.ctx.clearRect (0, 0, this.canvas.width, this.canvas.height);
    };
    
    //function to clear all objects that currently exist, to begin the restart process
    self.clearObjects = function () {
      
      //as we are beginning the restart cycle, set this global state to true
      self.restart=true;

      //loop through all on-going interval calls, and clear them
      for (let i = 0; i < self.setIntervalCalls.length; i++) {
        clearInterval (self.setIntervalCalls[i]);
      }
      
      //loop through all on-going timeout calls, and clear them
      for (let i = 0; i < self.setTimeoutCalls.length; i++) {
        clearTimeout (self.setTimeoutCalls[i]);
      }

      //delete all non-paddle objects from the current game instance
      self.ballObjects.splice (0, self.ballObjects.length);
      self.goalObjects.splice (0, self.goalObjects.length);
      self.bulletObjects.splice(0, self.bulletObjects.length);
      self.powerUpObjects.splice(0, self.powerUpObjects.length);
      //reset player scores to 0
      self.playerScores = [0,0];

      //now that the current instance has been cleared, complete the restart cycle by re-initializing
      self.init();
    };
    
    //function to toggle bot mode for a given player
    self.toggleBot = function (player) {
      
      //check if playerId requested exists in the game
      if (player !== null) {
        //toggle bot mode for paddle of given playerId
        player.computerControlled = !player.computerControlled;
        //return the new bot mode state of the paddle
        return player.computerControlled;
      }
      //if current player does not exist, toggling is not possible, so return null
      return null;
    };
    
    //function to toggle bullet auto aim for a given player
    self.toggleBulletAutoAim = function (player) {
      
      //check if the playerId requested exists in the game
      if (player!==null) {
        //toggle auto aim mode for paddle of given playerId
        player.bulletAutoAim = !player.bulletAutoAim;
        //return the new auto aim mode state of the paddle
        return player.bulletAutoAim;
      }
      //if current plyaer does not exist, toggling is not possible, so return null
      return null;
    };
    
    
    //function that may randomly generate a powerup when called
    self.generatePowerUp = function () {
      //when this function is called, 50% chance of actually generating a powerup, to add a fun/unpredictable factor in the game
      if (Math.random() <= 0.5) {
        //generate id for the powerup to be generated, in order to refer to it later
        //id is generated as a random number between 0 and 1000000, to minimize chance of collision
        let id = randomNumberGenerator (0,1000000);

        //randomly choose which one of the 3 power ups to generate (1 = paddle extension, 2 = paddle force increase, 3 = generate extra ball)
        let powerUp = randomNumberGenerator(1,3);

        //randomly choose the coordinates at which the power up will be generated, then create an object for that powerup
        let x = (randomNumberGenerator(0,80) / 100 + 0.05) * self.canvas.width, y = (randomNumberGenerator(0,80) / 100 + 0.05) * self.canvas.height;
        self.powerUpObjects.push(new PowerUp(x, y, id, powerUp, self));

        //one the powerup is created, set a timer to automatically delete the powerup, in the event that it is not consumed soon enough
        let deletePowerUpTimeout = setTimeout (()=> {
          self.deletePowerUp (id);
        }, 13000);
        self.setTimeoutCalls.push(deletePowerUpTimeout);
      }
    }

    //function that deletes a powerup when called, given its id
    self.deletePowerUp = function (id) {
      for (let i = 0; i < self.powerUpObjects.length; i++) {
        //loop through the powerup objects array, to find object with given id
        if (self.powerUpObjects[i].id==id) {
          //if id is matched then the powerup exists and needs to be deleted from the array
          self.powerUpObjects.splice(i,1);
          //we assume there are 0 id collisions due to extermely low probability, so we simply break our search here
          break;
        }
      }
    }
    
    //helper function that assists in updating the current game instance at every iteration of the game loop
    self.updateGameInstance = function () {
      //clear the current canvas drawings (everything will be updated then re-drawn accordingly)
      self.clear();
      
      //draw the canvas background
      drawBackground(self);

      //for all the existing objects in this game instance, call their respective update functions
      for (let x = 0; x < self.paddleObjects.length; x++) {
        self.paddleObjects[x].update();
      }
      for (let x = 0; x < self.ballObjects.length; x++) {
        self.ballObjects[x].update();
      }
      for (let x = 0; x < self.goalObjects.length; x++) {
        self.goalObjects[x].update();
      }
      for (let x = 0; x < self.powerUpObjects.length; x++) {
        self.powerUpObjects[x].update();
      }
      for (let x = 0; x < self.bulletObjects.length; x++) {
        self.bulletObjects[x].update();
      }

      //re-draw the scoreboard
      self.ctx.font = "bold 60px Helvetica";
      self.ctx.fillStyle = "white";
      //formula used to calculate starting x position of text based on the scoreboard string length, to center it apporopriately
      self.ctx.fillText (self.playerScores[0] + " : " + self.playerScores[1], self.canvas.width/2-22 - 37*self.playerScores[0].toString().length, 60);
    };
    
    //game loop function
    self.animateGameInstance = function () {
      if (self.pause) {
        //if the current game state is paused, display the game paused message, and stop the game loop
        self.ctx.font = "bold 60px Helvetica";
        self.ctx.fillStyle = "white";
        self.ctx.fillText("Game Paused", gameInstance.canvas.width/2-180, gameInstance.canvas.height/2-20);
        return;
      } else if (gameInstance.restart) {
        //if the current game state is undergoing to restarting process, stop the game loop
        return;
      }
      //call helper function to update this game's objects
      self.updateGameInstance();
      //recursively continue the game loop, using javascript's built in requestAnimationFrame function
      requestAnimationFrame (self.animateGameInstance);
    };
    
  }
  
  //function that handles general keydown events
  window.addEventListener ("keydown", function () {
    
    //prevent default actions of the shift, space, and up/down keys, as they need to be reserved for game-play
    if([38, 40, 32, 16].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
    
    //if the P key is pressed, toggle pause instance accordingly
    if (event.keyCode == 80) {
      if (gameInstance.pause === false) {
        pauseGame();
      } else if (gameInstance.pause === true) {
        unPauseGame();
      }
    }
  });
  
  $("#pauseBtn").click (function () {
    //toggle pause state for game instance
    if (gameInstance.pause === false) {
      pauseGame();
    } else if (gameInstance.pause === true) {
      unPauseGame();
    }
  });
  
  function pauseGame () {
    //set the game state to paused
    gameInstance.pause=true;
  }
  
  function unPauseGame () {
    //display game start message, to alert user the game will be unpaused soon
    gameStartMessage(gameInstance);  
    
    //set delay for unpausing game, to give user enough time to be prepared
    let unPauseTimeout = setTimeout (()=> {
      if (gameInstance.pause) {
        //set state to unpaused and continue game loop
        gameInstance.pause=false;
        gameInstance.animateGameInstance();
      }
    }, 3200);
    gameInstance.setTimeoutCalls.push(unPauseTimeout);
  }
  
  //use a function called at frequent intervals to check the current state of the game/game objects, and modify button text accordingly
  setInterval (function () {
    if (gameInstance.pause === false || gameInstance.pause === null) {
      $("#pauseBtn").html("Pause");
    } else if (gameInstance.pause === true) {
      $("#pauseBtn").html("Unpause");
    }
    if (gameInstance.powerUpsOn === true || gameInstance.powerUpsOn === null) {
      $("#powerUpsBtn").html("Disable Power-Ups");
    } else if (gameInstance.powerUpsOn === false) {
      $("#powerUpsBtn").html("Enable Power-Ups");
    }
    if (gameInstance.paddleObjects.length>0) {
      if (gameInstance.paddleObjects[0].computerControlled) {
        $("#p1BotBtn").html("Disable Player 1 Bot");
      } else {
        $("#p1BotBtn").html("Enable Player 1 Bot");
      }
      if (gameInstance.paddleObjects[0].bulletAutoAim) {
        $("#p1BulletAutoAimBtn").html("Disable Player 1 Bullet Auto-Aim");
      } else {
        $("#p1BulletAutoAimBtn").html("Enable Player 1 Bullet Auto-Aim");
      }
    }
    if (gameInstance.paddleObjects.length>1) {
      if (gameInstance.paddleObjects[1].computerControlled) {
        $("#p2BotBtn").html("Disable Player 2 Bot");
      } else {
        $("#p2BotBtn").html("Enable Player 2 Bot");
      }
      if (gameInstance.paddleObjects[1].bulletAutoAim) {
        $("#p2BulletAutoAimBtn").html("Disable Player 2 Bullet Auto-Aim");
      } else {
        $("#p2BulletAutoAimBtn").html("Enable Player 2 Bullet Auto-Aim");
      }
    }
  }, 10);

//});