/**
 * Entity mixin.
 */

function asEntity() {
  this.update = function (input, game) {

  }

  this.handleAccelerationInput = function (accelerationInput) {
    this.accelerate.left = accelerationInput.left && this.x > this.minX
    this.accelerate.up = accelerationInput.up && this.y > this.minY
    this.accelerate.right = accelerationInput.right && this.x < this.maxX
    this.accelerate.down = accelerationInput.down && this.y < this.maxY
  }

  return this
}

module.exports = asEntity