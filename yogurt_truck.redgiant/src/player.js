var
  config = require("./config"),
  asEntity = require("./lib/entity"),
  asBullet = require("./bullet"),
  augment = require("./lib/augment"),
  asDrawable = require("./lib/drawable")

var asPlayer = function () {

  this.update = function (input, game) {
    var that = this
    if (input[config.keyMap.ATTACK]) {
      this.attack(game)
    }
    if (this.collision === true && this.colliders && this.colliders.length > 0) {
      this.colliders.forEach(function (colliderEntity) {
        if (colliderEntity.damage != null && colliderEntity.damage != 0) {
          that.health -= colliderEntity.damage
          if (colliderEntity.type == 'bullet') {
            colliderEntity.damage = 0
            soundManager.createSound({
              id: 'playerHitByOrb' + game.counter,
              url: '/res/sounds/player-hit-by-orb.mp3',
              volume: 30
            }).play({multiShot: true})
          }
        }
      })
    }
  }

  this.attack = function (game) {
    function FireBullet(x, y, width, height, image) {
      this.x = x
      this.y = y
      this.speed = {x: 0, y: 12, step: 3.5, damping: 0, max: 10}
      this.dirX = 0
      this.dirY = -1
      this.width = width
      this.height = height
      this.image = image
      this.type = 'bullet'
      this.baseColor = '#f83'
      this.accelerate = {left: false, up: false, right: false, down: false}
      this.minX = 0
      this.minY = -40
    }

    augment(FireBullet, asBullet, asEntity, asDrawable)
    var thisAttackDate = +new Date,
      newBullet,
      timeBetweenAttacks = (thisAttackDate - this.previousAttackDate) * game.deltaT
    if (timeBetweenAttacks < 150) {
      return
    }
//    soundManager.play('fireBulletSFX', {multiShotEvents: true})
    soundManager.createSound({
      id: 'fireBulletSFX' + game.counter,
      url: '/res/sounds/bullet-fire.mp3',
      volume: 40
    }).play({multiShot: true})


    newBullet = new FireBullet(this.x, this.y, 12, 24, document.querySelector('.res .images .bullet-fire'))
    newBullet.maxX = game.canvas.width - newBullet.width
    newBullet.maxY = game.canvas.height - newBullet.height
    newBullet.created = thisAttackDate
    newBullet.damage = 15
    newBullet.owner = this
    newBullet.lifeSpan = 900
    game.addEntity(newBullet)

    this.previousAttackDate = thisAttackDate
  }

  this.init = function (x, y, width, height, image) {
    var that = this

    this.x = x
    this.y = y
    this.speed = {x: 0, y: 0, step: 0.7, damping: 0.330, max: 5, min: 0}
    this.dirX = 0
    this.dirY = 0
    this.accelerate = {left: false, up: false, right: false, down: false}
    this.width = width
    this.height = height
    this.image = image
    this.type = 'player'
    this.baseColor = '#f83'
    this.health = 200
    this.previousAttackDate = 0

    soundManager.onready(function() {
      that.fireBulletSFX = soundManager.createSound({
        id: 'fireBulletSFX',
        url: '/res/sounds/bullet-fire.mp3'
      })
    })

  }
}

module.exports = asPlayer
