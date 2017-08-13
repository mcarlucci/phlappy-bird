// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);
var timerEnabled = true;

// Create our 'main' state that will contain the games
var mainState = {
  preload: function() {
    // Load assets
    game.load.image('bird', 'assets/flappy.png');
    game.load.image('pipe', 'assets/pipe.png');
    game.load.image('restart', 'assets/restart.png', 193, 71);
    game.load.audio('jump', 'assets/jump.wav');
  },

  create: function() {
    // If this is not a desktop (so it's a mobile device)
    if (game.device.desktop == false) {
      // Set the scaling mode to SHOW_ALL to show all the game
      game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

      // Set a minimum and maximum size for the game
      // Here the minimum is half the game size
      // And the maximum is the original game size
      game.scale.setMinMax(game.width/2, game.height/2, game.width, game.height);

      // Center the game horizontally and vertically
      game.scale.pageAlignHorizontally = true;
      game.scale.pageAlignVertically = true;
    }
    // Change the background color of the game to blue
    game.stage.backgroundColor = '#71c5cf';

    // Set the physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Display the bird at the position x=100 and y=245
    this.bird = game.add.sprite(100, 245, 'bird');

    // Add physics to the bird
    // Needed for: movements, gravity, collisions, etc.
    game.physics.arcade.enable(this.bird);

    // Add gravity to the bird to make it fall
    this.bird.body.gravity.y = 1000;

    // Move the anchor to the left and downward
    this.bird.anchor.setTo(-0.2, 0.5);

    // load jump sound
    this.jumpSound = game.add.audio('jump');

    // Call the 'jump' function when the spacekey is hit
    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    spaceKey.onDown.add(this.jump, this);

    // Create an empty group
    this.pipes = game.add.group();

    this.timer = game.time.events.loop(1500, this.addRowOfPipes, this);

    this.restartButton = game.add.button(90, 200, 'restart');
    this.restartButton.visible = false;

    game.input.onDown.add(this.restartGame, this);
    spaceKey.onDown.add(this.restartGame, this);

    this.score = -1;
    this.labelScore = game.add.text(50, 20, "Score: 0",
      { font: "30px Arial", fill: "#ffffff" });
    this.highScore = game.add.text(240, 20, "0",
      { font: "30px Arial", fill: "#ffffff" });

    this.highScore.text = sessionStorage.highScore !== undefined && sessionStorage.highScore > 0 ? 'High: ' + sessionStorage.highScore : '';
  },

  update: function() {
    // If the bird is out of the screen (too high or too low)
    // Call the 'restartGame' function
    if (this.bird.y < 0 || this.bird.y > 490) {
      this.stopGame();
    }

    if (game.input.activePointer.isDown) {
      this.jump();
    }

    if (this.bird.angle < 20) {
      this.bird.angle += 1;
    }

    game.physics.arcade.overlap(this.bird, this.pipes, this.stopGame, null, this);
  },

  // Make the bird jump
  jump: function() {
    // play jump sound
    this.jumpSound.play();
    // Create an animation on the bird
    game.add.tween(this.bird).to({angle: -20}, 100).start();

    // Add a vertical velocity to the bird
    this.bird.body.velocity.y = -350;
  },

  // Stop the game
  stopGame: function() {
    // Stop the 'main' state, which stops the game
    // this.restart.text = 'Press the Space Bar to Restart';
    game.paused = true;
    this.restartButton.visible = true;
  },

  // Restart the game
  restartGame: function() {
    // Start the 'main' state, which restarts the game
    if (game.paused && timerEnabled) {
      timerEnabled = false
      this.restartButton.visible = false;
      var countdown = game.add.text(185, 220, "3",
        { font: "60px Arial", fill: "#ffffff" });
      var count = 3;
      var counter = setInterval(timer, 1000); //1000 will  run it every 1 second

      function timer() {
        count--;
        if (count <= 0) {
          countdown.visible = false;
          game.paused = false;
          timerEnabled = true;
          game.state.start('main');
          clearInterval(counter);
        }
        countdown.text = count;
      }
    }
  },

  addOnePipe: function(x, y) {
    // Create a pipe at the position x and y
    var pipe = game.add.sprite(x, y, 'pipe');

    // Add the pipe to our previously created group
    this.pipes.add(pipe);

    // Enable physics on the pipe
    game.physics.arcade.enable(pipe);

    // Add velocity to the pipe to make it move left
    pipe.body.velocity.x = -200;

    // Automatically kill the pipe when it's no longer visible
    pipe.checkWorldBounds = true;
    pipe.outOfBoundsKill = true;
  },

  addRowOfPipes: function() {
    // Randomly pick a number between 1 and 5
    // This will be the hole position
    var hole = Math.floor(Math.random() * 5) + 1;

    // Add the 6 pipes
    // With one big hole at position 'hole' and 'hole + 1'
    for (var i = 0; i < 8; i++) {
      if (i != hole && i != hole + 1) {
        this.addOnePipe(400, i * 60 + 10);
      }
    }

    this.score += 1;
    this.labelScore.text = 'Score: ' + this.score;
    sessionStorage.highScore = this.score > sessionStorage.highScore || sessionStorage.highScore === undefined ? this.score : sessionStorage.highScore;
  },
};

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState);

// Start the state to actually start the game
game.state.start('main');
