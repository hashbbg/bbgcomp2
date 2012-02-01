var bean = require("./lib/bean")

var asGame = function () {

  this.init = function () {
    var that = this
    this.PPS = 12
    this.config = require("./config")
    this.setupInput()
    this.createInitialEntities()
    this.iterateEntities(function (entity) {
      entity.minX = 0
      entity.minY = 0
      entity.maxX = that.canvas.width - entity.width
      entity.maxY = that.canvas.height - entity.height
    })
    this.counter = 0
    this.initSound()
    this.setupMap()
  }

  this.createInitialEntities = function () {
    this.createPlayer()
    this.createEnemies(10)
  }

  this.createPlayer = function () {
    var player
    player = new this.entityBuilders.Player()
    player.init(200, 200, 50, 50, document.querySelector('.res .images .player'))
    this.addEntity(player)
    this.player = player
  }

  this.createEnemies = function (n) {
    var i, newWeakling
    for (i = 0; i < n; i++) {
      newWeakling = new this.entityBuilders.Weakling()
      newWeakling.init(
        Math.round(Math.random() * 700),
        Math.round(Math.random() * 20),
        44, 44,
        document.querySelector('.res .images .weakling'))
      newWeakling.minX = 0
      newWeakling.minY = 0
      newWeakling.maxX = this.canvas.width - newWeakling.width
      newWeakling.maxY = this.canvas.height - newWeakling.height
      this.addEntity(newWeakling)
    }
  }

  this.update = function (deltaT) {
    this.deltaT = deltaT / this.PPS
    this.updateEntities()
    this.clearScreen()
//    this.drawBackground()
    this.drawEntities()
    this.drawStatuses(this.getStatuses())
    this.applyGameRules()
    this.counter += 1
  }

  this.applyGameRules = function () {
    if (this.entities.weakling.length < 0) {
      this.createEnemies(10)
      // Or... something that makes sense
    }
  }

  this.clearScreen = function () {
    // Store the current transformation matrix
    this.context.save()

    // Use the identity matrix while clearing the canvas
    this.context.setTransform(1, 0, 0, 1, 0, 0)
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    // Restore the transform
    this.context.restore()
  }

  this.drawBackground = function () {
    var that = this
    this.map.tiles.forEach(function (tile) {
      if (tile.y > 600) {
        tile.y = -600
      }
      that.context.drawImage(tile.image, 0, tile.y)
      tile.y += 2
    })
  }

  this.drawEntities = function () {
    var that = this, prop
    for (prop in this.entities) {
      if (this.entities.hasOwnProperty(prop)) {
        this.entities[prop].forEach(function (entity) {
          entity.draw(that.context)
        })
      }
    }
  }

  this.setupInput = function () {
    var input = {}

    bean.add(document, 'keydown', function(e) {
      var keyCode = e.which
      input[keyCode] = true
      if (keyCode == 38 || keyCode == 40 || keyCode == 32) e.preventDefault()
    })

    bean.add(document, 'keyup', function(e) {
      var keyCode = e.which
      input[keyCode] = false
    })

    this.input = input
  }

  this.updateEntities = function () {
    var game = this
    this.iterateEntities(function (entity) {
      if (entity.type == 'player') {
        game.handleMotionInput(game.input, entity)
      }
      if (entity.type == 'bullet') {

        if (entity.owner == game.player) {
          game.iterateEntitiesByType('weakling', function (weakling) {
            game.checkForCollisions(entity, weakling, game.onBulletCollision)
          })
        } else {
          game.checkForCollisions(entity, game.player, game.onBulletCollision)
        }

      }
      entity.update(game.input, game)
      if (entity.toRemove) {
        game.removeEntity(entity)
      } else {
        game.moveEntity(entity)
      }
    })
  }

  this.onBulletCollision = function (entityA, entityB) {
    entityA.colliders.push(entityB)
    entityB.colliders.push(entityA)
  }

  this.getStatuses = function () {
    return [
      {text: "LEVEL 1: WEAKLINGS", x: 100, y: this.canvas.height - 30},
      {text: "HEALTH: " + this.player.health, x: this.canvas.width - 200, y: this.canvas.height - 30}
    ]
  }

  this.initSound = function () {
    soundManager.url = '/lib/soundmanager2.swf'
    soundManager.flashVersion = 9
    soundManager.debugMode = false
  }

  this.setupMap = function () {
    this.map = {
      tiles: [
        { image: document.querySelector('.res .images .bg-darkish'), y: 0},
        { image: document.querySelector('.res .images .bg-darkish-flipped'), y: -600}
      ]
    }

  }
}

module.exports = asGame
