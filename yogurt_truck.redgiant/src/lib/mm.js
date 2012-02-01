/**
 * Motion manager.
 */

function asMotionManager() {

  this.handleMotionInput = function (motionInput, entity) {
    var keyMap = this.config.keyMap,
      noAccelerationInput = !motionInput[keyMap.LEFT] && !motionInput[keyMap.UP] && !motionInput[keyMap.RIGHT] && !motionInput[keyMap.DOWN],
      goingTooFast = {x: entity.speed.x > entity.speed.max, y: entity.speed.y > entity.speed.max},
      speedIsNegative = {x: entity.speed.x < 0, y: entity.speed.y < 0},
      noSpeed = {x: entity.speed.x == 0, y: entity.speed.y == 0}

    if (noAccelerationInput && noSpeed.x) {
      entity.dirX = 0
    }

    if (noAccelerationInput && noSpeed.y) {
      entity.dirY = 0
    }

    entity.speed.x -= entity.speed.damping
    entity.speed.y -= entity.speed.damping
    entity.accelerate.left = motionInput[keyMap.LEFT] && entity.x > entity.minX
    entity.accelerate.up = motionInput[keyMap.UP] && entity.y > entity.minY
    entity.accelerate.right = motionInput[keyMap.RIGHT] && entity.x < entity.maxX
    entity.accelerate.down = motionInput[keyMap.DOWN] && entity.y < entity.maxY

     if (goingTooFast.x) {
      entity.speed.x = entity.speed.max
    } else if (speedIsNegative.x) {
      entity.speed.x = entity.speed.min
    }

    if (goingTooFast.y) {
      entity.speed.y = entity.speed.max
    } else if (speedIsNegative.y) {
      entity.speed.y = entity.speed.min
    }
  }

  this.moveEntity = function (entity) {
    if (entity.onPreMove) {
      entity.onPreMove()
    }
    // Accelerate first
    if (entity.accelerate.left) {
      entity.speed.x += entity.speed.step
      entity.dirX = -1
    }
    if (entity.accelerate.up) {
      entity.speed.y += entity.speed.step
      entity.dirY = -1
    }
    if (entity.accelerate.right) {
      entity.speed.x += entity.speed.step
      entity.dirX = 1
    }
    if (entity.accelerate.down) {
      entity.speed.y += entity.speed.step
      entity.dirY = 1
    }

    var newX = entity.x + ((entity.speed.x * this.deltaT) * entity.dirX),
      newY = entity.y + ((entity.speed.y * this.deltaT) * entity.dirY),
      withinMaxBoundX = newX <= entity.maxX,
      withinMinBoundX = newX >= entity.minX,
      withinBoundsX = withinMaxBoundX && withinMinBoundX,
      withinMaxBoundY = newY <= entity.maxY,
      withinMinBoundY = newY >= entity.minY,
      withinBoundsY = withinMaxBoundY && withinMinBoundY

    if (withinBoundsX) {
      entity.x = newX
    } else {
      entity.speed.x = 0
      entity.dirX = 0
      entity.x = withinMinBoundX ? entity.maxX : entity.minX
    }

    if (withinBoundsY) {
      entity.y = newY
    } else {
      entity.speed.y = 0
      entity.dirY = 0
      entity.y = withinMinBoundY ? entity.maxY : entity.minY
    }

  }
  return this
}

module.exports = asMotionManager