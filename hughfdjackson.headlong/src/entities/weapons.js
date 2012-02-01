var anew = require("../libs/anew"),
    base = require("./base_entity")

var weapon_base = anew(base, {
    constructor: function(){
        this.vel.direction = Math.PI
    },
    power: 10,

    update: function(){
        var canvas = this.game.context.canvas,
            game = this.game

      if (  this.y < -100 
         || this.y > canvas.height + 100 
         || this.x < -100
         || this.x > canvas.width + 100
        ) 
            game.remove(this)
    
    }
})

module.exports = {

    standard : anew(weapon_base, {
        constructor: function(){
            this.offset = {x: 0.5, y: 0}
        },

        image: "weapon_standard",
        x: 0,
        y: 0,
        width: 10,
        height: 20,
        speed: .75,
        slipperiness: 1,
        
        rate: 75,
        on_add: function(){
            this.vel.speed = this.speed
        },
    })
}
