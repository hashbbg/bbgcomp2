/**
 * Entity Manager.
 */

function asEntityManager() {
  this.entities = {}

  this.addEntity = function (entity) {
    this.entities[entity.type].push(entity)
  }

  this.removeEntity = function (entity) {
    var index = this.entities[entity.type].indexOf(entity)
    if (index >= 0) {
      this.entities[entity.type].splice(index, 1)
    }
  }

  this.declareEntityTypes = function (types) {
    var that = this
    types.forEach(function (type) {
      that.entities[type] = []
    })
  }

  this.iterateEntities = function (callback) {
    var type
    for (type in this.entities) {
      if (this.entities.hasOwnProperty(type)) {
        this.entities[type].forEach(callback)
      }
    }
  }

  this.iterateEntitiesByType = function (type, callback) {
    if (this.entities[type] == null || this.entities[type].length == 0) {
      return
    }
    this.entities[type].forEach(callback)
  }

  return this
}

module.exports = asEntityManager