var anew = require("../libs/anew"),
    base = require("./base_entity"),
    weapons = require("./weapons"),
    timer = require("../timer")

var base_enemy = anew(base, {


    constructor: function(){
        this.gun = {}
        this.gun.y =  this.height
        this.gun.x =  (this.width / 2)
        this.timer = anew(timer)
    },
    type: "enemy",
    weapon: weapons.standard,
    health: 1000,
    _firing: function(dir){


        if ( this._weapon_cooldown ) return 
        
        // create new bullet
        var bullet = anew(this.weapon)
        bullet.x = this.gun.x + this.x
        bullet.y = this.gun.y + this.y
        bullet.vel.direction = dir
        bullet.type = "enemy_weapon"

        this.game.add(bullet)
        
        // handle cooldown
        this._weapon_cooldown = true

        this.timer.add_action(function(){
            this._weapon_cooldown = false
        }.bind(this), this.weapon.rate)

    },
    check_collision: function(other){
        if ( other.type != "player_weapon" ) return

        this.health -= other.power
        other.from.add_shields(20)
        this.game.remove(other)
        
        if ( this.health < 0 ) this.game.remove(this)
    }
})

module.exports = {
    
    peon: anew(base_enemy, {
        
        draw: function(context){
            context.fillStyle = "#eee"
            context.fillRect(this.x, this.y, this.width, this.height)
        },
        update: function(td){
            this.timer.update(td)
            
            this.vel.speed = 0.1
            this._firing(0)
        
            if ( this.x < 100 ) this.vel.direction = Math.PI * 0.5
            else if ( this.x + this.width > 400 ) this.vel.direction = Math.PI * 1.5
        }
        
    })
}
