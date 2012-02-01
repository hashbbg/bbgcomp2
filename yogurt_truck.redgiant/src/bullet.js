var asBullet = function () {

  this.update = function (input, game) {
    var tooOld = (+new Date - this.created) * game.deltaT > this.lifeSpan
    this.toRemove = (tooOld || this.collision === true)
  }

}

module.exports = asBullet
