/**
 * Collision manager.
 */
function Point(x, y) {
  this.x = x
  this.y = y
  this.add = function(point) {
    return new Point(this.x + point.x, this.y + point.y)
  }
  this.sub = function(point) {
    return new Point(this.x - point.x, this.y - point.y)
  }
}

function asCollisionManager() {
  this.prepareForCollisions = function (entity) {
    entity.collision = false
    entity.colliders = []
  }

  this.checkForCollisions = function (entityA, entityB, onCollision) {
    if (entityA.colliders == null) {
      this.prepareForCollisions(entityA)
    }
    if (entityB.colliders == null) {
      this.prepareForCollisions(entityB)
    }
    this.calculateCenter(entityA)
    this.calculateCenter(entityB)
    var points = ['u'], collision = false, nearX, nearY
    for (var i = 0; i < points.length; i++) {
      nearX = Math.abs(entityA[points[i]].x - entityB.u.x) < (entityB.width / 2)
      nearY = Math.abs(entityA[points[i]].y - entityB.u.y) < (entityB.height / 2)
      collision = nearX && nearY
      if (collision === true) {
        entityA.collision = entityB.collision = true
        onCollision(entityA, entityB)
        break
      }
    }
  }

  this.calculateCenter = function (entity) {
    entity.u = new Point(entity.x + (entity.width / 2), entity.y + (entity.height / 2))
  }

  this.calculateVertices = function (entity) {
    entity.a = new Point(entity.x + entity.width, entity.y)
    entity.b = new Point(entity.x + entity.width, entity.y + entity.height)
    entity.c = new Point(entity.x, entity.y + entity.height)
    entity.d = new Point(entity.x, entity.y)
    return entity
  }

  return this
}

module.exports = asCollisionManager