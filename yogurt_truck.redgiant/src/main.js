/* Require stuff. This is ugly. */

var
  asGame = require("./game"),
  asEntityManager = require("./lib/em"),
  asMotionManager = require("./lib/mm"),
  asCollisionManager = require("./lib/cm"),
  asStatusManager = require("./lib/sm"),
  asPlayer = require("./player"),
  player,
  asEnemy = require("./enemy"),
  asEntity = require("./lib/entity"),
  game,
  augment = require("./lib/augment"),
  asDrawable = require("./lib/drawable"),
  newWeakling

function RedGiant(canvas, context) {
  this.canvas = canvas
  this.context = context
}
augment(RedGiant, asGame, asEntityManager, asMotionManager, asCollisionManager, asStatusManager)

function Player() { }
augment(Player, asPlayer, asEntity, asEntityManager, asDrawable)

function Weakling() { }
augment(Weakling, asEnemy, asEntity, asEntityManager, asDrawable)

game = new RedGiant(
  document.getElementById("main-canvas"),
  document.getElementById("main-canvas").getContext("2d")
)
game.declareEntityTypes(['player', 'weakling', 'bullet'])

game.entityBuilders = {Weakling: Weakling, Player: Player}

game.init()

function animationLoop(render, element) {
  var running, lastFrame = +new Date;

  function loop(now) {
    // stop the loop if render returned false
    if (running !== false) {
      requestAnimationFrame(loop, element)
      var deltaT = now - lastFrame;
      // do not render frame when deltaT is too high
      if (deltaT < 160) {
        running = render(deltaT)
      }
      lastFrame = now
    }
  }

  loop(lastFrame)
}

animationLoop(function(deltaT) {
  game.update(deltaT)
}, game.canvas)