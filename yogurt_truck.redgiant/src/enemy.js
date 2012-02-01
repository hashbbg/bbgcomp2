var
  asEntity = require("./lib/entity"),
  asBullet = require("./bullet"),
  augment = require("./lib/augment"),
  asDrawable = require("./lib/drawable")


var asEnemy = function () {
  this.update = function (input, game) {
    var that = this
    this.dirX = Math.random() * 10 >= 5 ? 1 : -1
    if (this.collision === true && this.colliders && this.colliders.length > 0) {
      this.colliders.forEach(function (colliderEntity) {
        if (colliderEntity.damage != null) {
          that.health -= colliderEntity.damage
          if (colliderEntity.type == 'bullet') {
            colliderEntity.damage = 0
          }
        }
      })
    }
    this.toRemove = this.health < 1
    if (this.toRemove) {
      soundManager.createSound({
        id: 'fireBulletSFX' + game.counter,
        url: '/res/sounds/enemy-explosion.mp3',
        volume: 10
      }).play({multiShot: true})
    } else {
      this.attack(game)
    }
  }

  this.attack = function (game) {
    function ElectricOrbBullet(x, y, width, height, image) {
      this.x = x
      this.y = y
      this.speed = {x: 1.6, y: 3.6, step: 3.5, damping: 0, max: 10}
      this.dirX = 0
      this.dirY = 1
      this.width = width
      this.height = height
      this.image = image
      this.type = 'bullet'
      this.baseColor = '#f83'
      this.accelerate = {left: false, up: false, right: false, down: false}
      this.minX = 40
      this.minY = 0
    }

    augment(ElectricOrbBullet, asBullet, asEntity, asDrawable)

    var thisAttackDate = +new Date,
      newBullet,
      timeBetweenAttacks = (thisAttackDate - this.previousAttackDate) * game.deltaT
    if (timeBetweenAttacks < 2000 + (Math.random() * 5000)) {
      return
    }
    newBullet = new ElectricOrbBullet(this.x, this.y, 12, 24, document.querySelector('.res .images .bullet-electricorb'))
    newBullet.maxX = game.canvas.width - newBullet.width
    newBullet.maxY = game.canvas.height + newBullet.height + 100
    newBullet.created = thisAttackDate
    newBullet.damage = 10
    newBullet.owner = this
    newBullet.lifeSpan = 50000
    newBullet.onPreMove = function () {
      this.x += (Math.sin(this.y * 0.06) * 4)
      if (this.x < game.player.x) {
        this.dirX = 1
      } else if (this.x > game.player.x) {
        this.dirX = -1
      }
    }
    game.addEntity(newBullet)

    this.previousAttackDate = thisAttackDate
  }

  this.init = function (x, y, width, height, image) {
    this.x = x
    this.y = y
    this.speed = {x: 0.8, y: 0, step: 1.5, damping: 0.060, max: 5, min: 0}
    this.dirX = 0
    this.dirY = 0
    this.accelerate = {left: false, up: false, right: false, down: false}
    this.width = width
    this.height = height
    this.image = image
    this.type = 'weakling'
    this.baseColor = '#835'
    this.health = 100
    this.previousAttackDate = 0
  }


}

module.exports = asEnemy
