var anew = require("../libs/anew")

var base_entity = anew({
    
    constructor: function(){
        this.vel = {
            direction: 0,
            speed: 0
        }
    },
    game: undefined,
    x: 0,
    y: 0,
    width: 100,
    height: 100
})

module.exports = base_entity
