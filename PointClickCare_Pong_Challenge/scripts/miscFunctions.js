/*
This file contains general, miscellaneous functions that can be called in multiple other files
*/

//get ratio of current screen width the to screen width that this game was developed for, to help scale ball/paddle speed
function windowWidthFactor(game) {
  return game.canvas.width / 1366;
}

//get ratio of current screen height the to screen height that this game was developed for, to help scale ball/paddle speed
function windowHeightFactor(game) {
  return game.canvas.height / 616;
}

//a random number generator function, that takes inputs for the range to generate a random number in
function randomNumberGenerator(leftBound, rightBound) {
  let range = rightBound-leftBound;
  return Math.round(range*Math.random())+leftBound;
}

//randomly choose direction for one dimensional motion (negative is left, positive is right)
function randomDirection () {
  if (Math.random() <= 0.5) {
    return -1;
  } else {
    return 1;
  }
}

//create canvas and draw background for the canvas
function gameCanvasSetup (game) {
  game.setCanvasSize();
  drawBackground(game);
}

//function to create the half/half blue background
function drawBackground (game) {
  game.ctx.fillStyle="#3498db";
  game.ctx.fillRect(0,0,game.canvas.width/2,game.canvas.height);

  game.ctx.fillStyle="#34495e";
  game.ctx.fillRect(game.canvas.width/2,0,game.canvas.width/2,game.canvas.height);
}

//helper function that plays an audio element, given the html element id
function playAudio (audioElementId) {
  if (document.getElementById(audioElementId)===null) {
    return;
  }
  let playPromise = document.getElementById(audioElementId).play();
  if (playPromise !== undefined) {
    playPromise.catch ((e) => {
      console.log ("Error playing audio: " + e);
    });
  }
}

//helper function that resets an audio element's playback, given the html element id
function resetAudio (audioElementId) {
  if (document.getElementById(audioElementId)===null) {
    return;
  }
  let resetPromise = document.getElementById(audioElementId).pause();
  if (resetPromise !== undefined) {
    resetPromise.then (() => {
      document.getElementById(audioElementId).currentTime = 0;
    }).catch ((e) => {
      console.log ("Error playing audio: " + e);
    });
  }
}

//function to raw message alerting user the game will start
function gameStartMessage (game) {
  for (let i = 0; i < game.messageSetTimeoutCalls.length; i++) {
    //clear any lingering delayed mesasges before outputting a new one
    clearTimeout (game.messageSetTimeoutCalls[i]);
  }
  
  //display first part of message ("Ready")
  let gameStartMessageTimeout1 = setTimeout (()=> {
    playAudio ("gameStart1");
    game.ctx.font = "bold 60px Helvetica";
    game.ctx.fillStyle = "white";
    game.ctx.fillText("Ready", game.canvas.width/2-350, game.canvas.height/2+100);
  }, 500);
  //display second part of message ("Set")
  game.setTimeoutCalls.push(gameStartMessageTimeout1);
  let gameStartMessageTimeout2 = setTimeout (()=> {
    playAudio ("gameStart1");
    game.ctx.font = "bold 60px Helvetica";
    game.ctx.fillStyle = "white";
    game.ctx.fillText ("Set", game.canvas.width/2-50, game.canvas.height/2+100);
  }, 1500);
  //display third part of message ("Go!");
  game.setTimeoutCalls.push(gameStartMessageTimeout2);
  let gameStartMessageTimeout3 = setTimeout (()=> {
    playAudio ("gameStart2");
    game.ctx.font = "bold 60px Helvetica";
    game.ctx.fillStyle = "white";
    game.ctx.fillText ("Go!", game.canvas.width/2+250, game.canvas.height/2+100);
  }, 2500);
  game.setTimeoutCalls.push(gameStartMessageTimeout3);
}